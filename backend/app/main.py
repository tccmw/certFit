from __future__ import annotations

import json
import os
from contextlib import asynccontextmanager
from typing import Annotated

from fastapi import Depends, FastAPI, Header, HTTPException, Response, status
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session, selectinload

from .database import Base, SessionLocal, engine, get_db
from .models import Certificate, RecommendationItem, RecommendationRun, Roadmap, RoadmapStep, User, UserCertificate, UserEvent, UserProfile
from .recommender import recommend
from .roadmaps import generate_roadmap_steps
from .schemas import (
    AuthIn,
    AuthOut,
    CertificateOut,
    EventIn,
    ImportOut,
    ProfileIn,
    RecommendationRunOut,
    RoadmapCreate,
    RoadmapOut,
    StepPatch,
    UserCertificateCreate,
    UserCertificateOut,
    UserOut,
)
from .security import hash_password, make_token, verify_password
from .seed import seed_database
from .serializers import certificate_out, recommendation_run_out, roadmap_out, user_certificate_out, user_out


@asynccontextmanager
async def lifespan(_: FastAPI):
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()
    try:
        seed_database(db)
    finally:
        db.close()
    yield


app = FastAPI(title="CertFit API", version="1.0.0", lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=os.getenv("CERTFIT_CORS_ORIGINS", "http://localhost:5173,http://127.0.0.1:5173").split(","),
    allow_origin_regex=os.getenv("CERTFIT_CORS_REGEX", r"^https?://(localhost|127\.0\.0\.1):\d+$"),
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


def current_user(
    authorization: Annotated[str | None, Header()] = None,
    db: Session = Depends(get_db),
) -> User:
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="로그인이 필요합니다.")
    token = authorization.removeprefix("Bearer ").strip()
    user = db.query(User).options(selectinload(User.profile)).filter(User.session_token == token).first()
    if not user:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="세션이 만료되었습니다.")
    return user


def optional_user(
    authorization: Annotated[str | None, Header()] = None,
    db: Session = Depends(get_db),
) -> User | None:
    if not authorization or not authorization.startswith("Bearer "):
        return None
    token = authorization.removeprefix("Bearer ").strip()
    return db.query(User).filter(User.session_token == token).first()


def upsert_profile(db: Session, user: User, profile: ProfileIn) -> UserProfile:
    existing = db.query(UserProfile).filter(UserProfile.user_id == user.id).first()
    if existing is None:
        existing = UserProfile(user_id=user.id, **profile.model_dump())
        db.add(existing)
    else:
        for key, value in profile.model_dump().items():
            setattr(existing, key, value)
    db.flush()
    return existing


@app.get("/health")
def health() -> dict[str, str]:
    return {"status": "ok"}


@app.post("/auth/register", response_model=AuthOut)
def register(payload: AuthIn, db: Session = Depends(get_db)) -> AuthOut:
    if db.query(User).filter(User.email == payload.email.lower()).first():
        raise HTTPException(status_code=409, detail="이미 가입된 이메일입니다.")
    user = User(
        email=payload.email.lower(),
        name=payload.name or payload.email.split("@")[0],
        password_hash=hash_password(payload.password),
        session_token=make_token(),
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    return AuthOut(token=user.session_token or "", user=user_out(user))


@app.post("/auth/login", response_model=AuthOut)
def login(payload: AuthIn, db: Session = Depends(get_db)) -> AuthOut:
    user = db.query(User).options(selectinload(User.profile)).filter(User.email == payload.email.lower()).first()
    if user is None or not verify_password(payload.password, user.password_hash):
        raise HTTPException(status_code=401, detail="이메일 또는 비밀번호가 올바르지 않습니다.")
    user.session_token = make_token()
    db.commit()
    db.refresh(user)
    return AuthOut(token=user.session_token or "", user=user_out(user))


@app.get("/auth/me", response_model=UserOut)
def me(user: User = Depends(current_user)) -> UserOut:
    return user_out(user)


@app.put("/auth/profile", response_model=UserOut)
def save_profile(payload: ProfileIn, user: User = Depends(current_user), db: Session = Depends(get_db)) -> UserOut:
    upsert_profile(db, user, payload)
    db.commit()
    db.refresh(user)
    return user_out(user)


@app.get("/certificates", response_model=list[CertificateOut])
def list_certificates(db: Session = Depends(get_db)) -> list[CertificateOut]:
    certificates = db.query(Certificate).options(selectinload(Certificate.schedules)).order_by(Certificate.name).all()
    return [certificate_out(certificate) for certificate in certificates]


@app.get("/certificates/{certificate_id}", response_model=CertificateOut)
def get_certificate(certificate_id: int, db: Session = Depends(get_db)) -> CertificateOut:
    certificate = db.query(Certificate).options(selectinload(Certificate.schedules)).filter(Certificate.id == certificate_id).first()
    if not certificate:
        raise HTTPException(status_code=404, detail="자격증을 찾을 수 없습니다.")
    return certificate_out(certificate)


@app.get("/my-certificates", response_model=list[UserCertificateOut])
def list_user_certificates(user: User = Depends(current_user), db: Session = Depends(get_db)) -> list[UserCertificateOut]:
    user_certificates = (
        db.query(UserCertificate)
        .options(selectinload(UserCertificate.certificate).selectinload(Certificate.schedules))
        .filter(UserCertificate.user_id == user.id)
        .order_by(UserCertificate.created_at.desc())
        .all()
    )
    return [user_certificate_out(user_certificate) for user_certificate in user_certificates]


@app.post("/my-certificates", response_model=UserCertificateOut, status_code=status.HTTP_201_CREATED)
def add_user_certificate(
    payload: UserCertificateCreate,
    user: User = Depends(current_user),
    db: Session = Depends(get_db),
) -> UserCertificateOut:
    certificate = db.query(Certificate).options(selectinload(Certificate.schedules)).filter(Certificate.id == payload.certificate_id).first()
    if not certificate:
        raise HTTPException(status_code=404, detail="자격증을 찾을 수 없습니다.")
    if db.query(UserCertificate).filter(UserCertificate.user_id == user.id, UserCertificate.certificate_id == certificate.id).first():
        raise HTTPException(status_code=409, detail="이미 보유 자격증에 추가되어 있습니다.")

    user_certificate = UserCertificate(user_id=user.id, certificate_id=certificate.id)
    db.add(user_certificate)
    db.add(UserEvent(user_id=user.id, certificate_id=certificate.id, event_type="certificate_add", metadata_json=json.dumps({"tags": [certificate.category]}, ensure_ascii=False)))
    db.commit()
    db.refresh(user_certificate)
    return user_certificate_out(user_certificate)


@app.delete("/my-certificates/{user_certificate_id}", status_code=status.HTTP_204_NO_CONTENT, response_class=Response)
def remove_user_certificate(user_certificate_id: int, user: User = Depends(current_user), db: Session = Depends(get_db)) -> Response:
    user_certificate = (
        db.query(UserCertificate)
        .filter(UserCertificate.id == user_certificate_id, UserCertificate.user_id == user.id)
        .first()
    )
    if not user_certificate:
        raise HTTPException(status_code=404, detail="보유 자격증을 찾을 수 없습니다.")

    certificate_id = user_certificate.certificate_id
    db.delete(user_certificate)
    db.add(UserEvent(user_id=user.id, certificate_id=certificate_id, event_type="certificate_remove"))
    db.commit()
    return Response(status_code=status.HTTP_204_NO_CONTENT)


@app.post("/recommendations", response_model=RecommendationRunOut)
def create_recommendations(payload: ProfileIn, user: User = Depends(current_user), db: Session = Depends(get_db)) -> RecommendationRunOut:
    upsert_profile(db, user, payload)
    certificates = db.query(Certificate).options(selectinload(Certificate.schedules)).all()
    results = recommend(db, certificates, payload, user.id)
    run = RecommendationRun(user_id=user.id, profile_snapshot_json=payload.model_dump_json())
    db.add(run)
    db.flush()
    for result in results:
        db.add(
            RecommendationItem(
                run_id=run.id,
                certificate_id=result.certificate.id,
                score=result.score,
                pass_probability=result.pass_probability,
                estimated_weeks=result.estimated_weeks,
                eligibility_status=result.eligibility_status,
                reasons_json=json.dumps(result.reasons, ensure_ascii=False),
                breakdown_json=json.dumps(result.breakdown, ensure_ascii=False),
            )
        )
    db.add(UserEvent(user_id=user.id, event_type="recommendation_run", metadata_json=payload.model_dump_json()))
    db.commit()
    run = (
        db.query(RecommendationRun)
        .options(selectinload(RecommendationRun.items).selectinload(RecommendationItem.certificate).selectinload(Certificate.schedules))
        .filter(RecommendationRun.id == run.id)
        .first()
    )
    return recommendation_run_out(run)


@app.get("/recommendations/history", response_model=list[RecommendationRunOut])
def recommendation_history(user: User = Depends(current_user), db: Session = Depends(get_db)) -> list[RecommendationRunOut]:
    runs = (
        db.query(RecommendationRun)
        .options(selectinload(RecommendationRun.items).selectinload(RecommendationItem.certificate).selectinload(Certificate.schedules))
        .filter(RecommendationRun.user_id == user.id)
        .order_by(RecommendationRun.created_at.desc())
        .limit(10)
        .all()
    )
    return [recommendation_run_out(run) for run in runs]


@app.post("/roadmaps", response_model=RoadmapOut)
def create_roadmap(payload: RoadmapCreate, user: User = Depends(current_user), db: Session = Depends(get_db)) -> RoadmapOut:
    certificate = db.query(Certificate).options(selectinload(Certificate.schedules)).filter(Certificate.id == payload.certificate_id).first()
    if not certificate:
        raise HTTPException(status_code=404, detail="자격증을 찾을 수 없습니다.")
    profile = user.profile
    total_weeks = payload.total_weeks or (profile.available_weeks if profile else certificate.required_weeks)
    weekly_hours = profile.weekly_hours if profile else certificate.min_weekly_hours
    roadmap = Roadmap(
        user_id=user.id,
        certificate_id=certificate.id,
        title=f"{certificate.name} {total_weeks}주 합격 로드맵",
        total_weeks=total_weeks,
    )
    db.add(roadmap)
    db.flush()
    for step in generate_roadmap_steps(certificate, total_weeks, weekly_hours):
        db.add(RoadmapStep(roadmap_id=roadmap.id, **step))
    db.add(UserEvent(user_id=user.id, certificate_id=certificate.id, event_type="roadmap_save", metadata_json=json.dumps({"tags": [certificate.category]}, ensure_ascii=False)))
    db.commit()
    roadmap = (
        db.query(Roadmap)
        .options(selectinload(Roadmap.steps), selectinload(Roadmap.certificate).selectinload(Certificate.schedules))
        .filter(Roadmap.id == roadmap.id)
        .first()
    )
    return roadmap_out(roadmap)


@app.get("/roadmaps", response_model=list[RoadmapOut])
def list_roadmaps(user: User = Depends(current_user), db: Session = Depends(get_db)) -> list[RoadmapOut]:
    roadmaps = (
        db.query(Roadmap)
        .options(selectinload(Roadmap.steps), selectinload(Roadmap.certificate).selectinload(Certificate.schedules))
        .filter(Roadmap.user_id == user.id)
        .order_by(Roadmap.created_at.desc())
        .all()
    )
    return [roadmap_out(roadmap) for roadmap in roadmaps]


@app.patch("/roadmaps/{roadmap_id}/steps/{step_id}", response_model=RoadmapOut)
def update_step(roadmap_id: int, step_id: int, payload: StepPatch, user: User = Depends(current_user), db: Session = Depends(get_db)) -> RoadmapOut:
    roadmap = (
        db.query(Roadmap)
        .options(selectinload(Roadmap.steps), selectinload(Roadmap.certificate).selectinload(Certificate.schedules))
        .filter(Roadmap.id == roadmap_id, Roadmap.user_id == user.id)
        .first()
    )
    if not roadmap:
        raise HTTPException(status_code=404, detail="로드맵을 찾을 수 없습니다.")
    step = next((item for item in roadmap.steps if item.id == step_id), None)
    if not step:
        raise HTTPException(status_code=404, detail="단계를 찾을 수 없습니다.")
    step.checked = payload.checked
    db.add(UserEvent(user_id=user.id, certificate_id=roadmap.certificate_id, event_type="roadmap_check", metadata_json=json.dumps({"checked": payload.checked}, ensure_ascii=False)))
    db.commit()
    db.refresh(roadmap)
    return roadmap_out(roadmap)


@app.post("/events")
def record_event(payload: EventIn, user: User | None = Depends(optional_user), db: Session = Depends(get_db)) -> dict[str, str]:
    db.add(
        UserEvent(
            user_id=user.id if user else None,
            certificate_id=payload.certificate_id,
            event_type=payload.event_type,
            metadata_json=json.dumps(payload.metadata, ensure_ascii=False),
        )
    )
    db.commit()
    return {"status": "recorded"}


@app.post("/imports/public-data", response_model=ImportOut)
def import_public_data(db: Session = Depends(get_db), user: User = Depends(current_user)) -> ImportOut:
    api_key = os.getenv("PUBLIC_DATA_API_KEY")
    before = db.query(Certificate).count()
    if not api_key:
        seed_database(db)
        after = db.query(Certificate).count()
        return ImportOut(status="sample", imported_count=after - before, message="PUBLIC_DATA_API_KEY가 없어 샘플 데이터를 유지했습니다.")
    return ImportOut(status="ready", imported_count=0, message="공공데이터 어댑터 자리입니다. API 키가 감지되었고 실제 매핑만 연결하면 됩니다.")
