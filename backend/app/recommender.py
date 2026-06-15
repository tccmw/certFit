from __future__ import annotations

import json
import math
from dataclasses import dataclass
from typing import Iterable

from sqlalchemy.orm import Session

from .models import Certificate, UserEvent
from .schemas import ProfileIn


KNOWLEDGE_LEVEL = {
    "beginner": 1,
    "basic": 2,
    "intermediate": 3,
    "advanced": 4,
}

EVENT_WEIGHT = {
    "view": 0.4,
    "click": 0.8,
    "recommendation_select": 1.2,
    "roadmap_save": 1.8,
    "roadmap_check": 1.0,
}


@dataclass
class RecommendationResult:
    certificate: Certificate
    score: float
    pass_probability: float
    estimated_weeks: int
    eligibility_status: str
    reasons: list[str]
    breakdown: dict[str, float]


def load_json_list(value: str) -> list[str]:
    try:
        parsed = json.loads(value)
    except json.JSONDecodeError:
        return []
    return parsed if isinstance(parsed, list) else []


def estimate_weeks(certificate: Certificate, profile: ProfileIn) -> int:
    weekly_hours = max(profile.weekly_hours, 1)
    required_hours = certificate.required_weeks * certificate.min_weekly_hours
    return max(1, math.ceil(required_hours / weekly_hours))


def eligibility_status(certificate: Certificate, profile: ProfileIn) -> tuple[str, float]:
    if "제한 없음" in certificate.eligibility:
        return "응시 가능", 10.0
    if profile.has_related_major or profile.has_work_experience:
        return "응시 가능성 높음", 8.0
    if profile.current_status in {"대학생", "이직 준비 직장인"}:
        return "응시 자격 확인 필요", 5.0
    return "추가 조건 확인 필요", 3.0


def behavior_score(db: Session, user_id: int | None, certificate: Certificate) -> float:
    if not user_id:
        return 0.0
    tags = set(load_json_list(certificate.tags_json) + load_json_list(certificate.target_roles_json))
    events = db.query(UserEvent).filter(UserEvent.user_id == user_id).order_by(UserEvent.created_at.desc()).limit(50).all()
    raw = 0.0
    for event in events:
        weight = EVENT_WEIGHT.get(event.event_type, 0.2)
        if event.certificate_id == certificate.id:
            raw += weight * 1.5
            continue
        try:
            metadata = json.loads(event.metadata_json or "{}")
        except json.JSONDecodeError:
            metadata = {}
        event_tags = set(metadata.get("tags", []))
        if tags.intersection(event_tags):
            raw += weight * 0.5
    return min(5.0, raw)


def pass_probability(certificate: Certificate, profile: ProfileIn, estimated: int) -> float:
    level = KNOWLEDGE_LEVEL.get(profile.knowledge_level, 2)
    study_capacity = profile.available_weeks * max(profile.weekly_hours, 0)
    required_capacity = max(1, certificate.required_weeks * certificate.min_weekly_hours)
    capacity_ratio = min(1.4, study_capacity / required_capacity)
    level_fit = 1 - min(0.5, max(0, certificate.difficulty - level) * 0.12)
    time_fit = min(1.1, profile.available_weeks / max(estimated, 1))
    base = certificate.average_pass_rate
    probability = base * 0.45 + capacity_ratio * 28 + level_fit * 17 + time_fit * 10
    return round(max(5.0, min(95.0, probability)), 1)


def score_certificate(db: Session, certificate: Certificate, profile: ProfileIn, user_id: int | None = None) -> RecommendationResult:
    roles = load_json_list(certificate.target_roles_json)
    tags = load_json_list(certificate.tags_json)
    subjects = load_json_list(certificate.subjects_json)

    field_points = 0.0
    if certificate.category == profile.target_field:
        field_points += 28
    if profile.interested_role in roles:
        field_points += 12
    elif any(token in " ".join(roles + tags) for token in profile.interested_role.split()):
        field_points += 7
    if profile.target_field in tags:
        field_points += 5
    field_points = min(45.0, field_points)

    estimated = estimate_weeks(certificate, profile)
    capacity_ratio = (profile.available_weeks * max(profile.weekly_hours, 0)) / max(1, certificate.required_weeks * certificate.min_weekly_hours)
    prep_points = min(20.0, max(0.0, capacity_ratio * 17 + (3 if profile.available_weeks >= estimated else 0)))

    user_level = KNOWLEDGE_LEVEL.get(profile.knowledge_level, 2)
    gap = abs(certificate.difficulty - user_level)
    if certificate.difficulty <= user_level + 1:
        level_points = 20.0 - gap * 3
    else:
        level_points = 9.0 - (certificate.difficulty - user_level - 1) * 2
    level_points = max(0.0, min(20.0, level_points))

    status, eligibility_points = eligibility_status(certificate, profile)
    behavior_points = behavior_score(db, user_id, certificate)

    breakdown = {
        "field": round(field_points, 1),
        "preparation": round(prep_points, 1),
        "level": round(level_points, 1),
        "eligibility": round(eligibility_points, 1),
        "behavior": round(behavior_points, 1),
    }
    score = round(sum(breakdown.values()), 1)
    probability = pass_probability(certificate, profile, estimated)

    reasons = []
    if field_points >= 35:
        reasons.append(f"{profile.target_field} 목표와 {profile.interested_role} 관심 직무에 직접 연결됩니다.")
    elif field_points >= 18:
        reasons.append("목표 분야와 일부 직무 역량이 겹쳐 보조 스펙으로 활용할 수 있습니다.")
    else:
        reasons.append("목표 분야와의 직접 일치도는 낮지만 기초 역량 보완에 도움이 될 수 있습니다.")

    if profile.available_weeks >= estimated:
        reasons.append(f"현재 학습량이면 약 {estimated}주 안에 준비 가능한 범위입니다.")
    else:
        reasons.append(f"권장 준비 기간은 약 {estimated}주로, 현재 계획보다 학습 밀도를 높여야 합니다.")

    if level_points >= 15:
        reasons.append("현재 기초 지식 수준과 난이도 균형이 좋습니다.")
    else:
        reasons.append("난이도가 높은 편이라 초반 개념 학습 비중을 크게 잡는 것이 좋습니다.")

    reasons.append(f"응시 자격 판단: {status}.")
    if behavior_points > 0:
        reasons.append("최근 조회·저장 행동이 반영되어 우선순위가 보정되었습니다.")

    return RecommendationResult(
        certificate=certificate,
        score=score,
        pass_probability=probability,
        estimated_weeks=estimated,
        eligibility_status=status,
        reasons=reasons,
        breakdown=breakdown,
    )


def recommend(db: Session, certificates: Iterable[Certificate], profile: ProfileIn, user_id: int | None = None) -> list[RecommendationResult]:
    results = [score_certificate(db, certificate, profile, user_id) for certificate in certificates]
    return sorted(results, key=lambda item: item.score, reverse=True)
