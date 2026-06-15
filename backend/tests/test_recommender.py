from __future__ import annotations

from backend.app.database import Base
from backend.app.models import Certificate
from backend.app.recommender import eligibility_status, estimate_weeks, pass_probability, recommend
from backend.app.schemas import ProfileIn
from backend.app.seed import seed_database
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker


def make_db():
    engine = create_engine("sqlite:///:memory:", connect_args={"check_same_thread": False})
    Base.metadata.create_all(bind=engine)
    session = sessionmaker(bind=engine)
    db = session()
    seed_database(db)
    return db


def test_recommendation_prioritizes_matching_field_and_role():
    db = make_db()
    profile = ProfileIn(
        target_field="데이터",
        current_status="대학생",
        available_weeks=10,
        weekly_hours=8,
        interested_role="데이터 분석가",
        knowledge_level="basic",
    )

    results = recommend(db, db.query(Certificate).all(), profile, None)

    assert results[0].certificate.name in {"SQLD", "ADsP"}
    assert results[0].score > results[-1].score
    assert results[0].breakdown["field"] >= 35


def test_pass_probability_is_bounded():
    db = make_db()
    certificate = db.query(Certificate).first()
    profile = ProfileIn(available_weeks=1, weekly_hours=0, knowledge_level="beginner")

    probability = pass_probability(certificate, profile, estimate_weeks(certificate, profile))

    assert 5 <= probability <= 95


def test_eligibility_marks_open_certificates_as_available():
    db = make_db()
    certificate = db.query(Certificate).filter_by(name="SQLD").one()
    status, points = eligibility_status(certificate, ProfileIn())

    assert status == "응시 가능"
    assert points == 10.0
