from __future__ import annotations

import json

from .models import Certificate, RecommendationItem, RecommendationRun, Roadmap, User, UserProfile
from .schemas import CertificateOut, ExamScheduleOut, ProfileIn, RecommendationItemOut, RecommendationRunOut, RoadmapOut, RoadmapStepOut, UserOut


def json_list(value: str) -> list[str]:
    try:
        parsed = json.loads(value)
    except json.JSONDecodeError:
        return []
    return parsed if isinstance(parsed, list) else []


def profile_out(profile: UserProfile | None) -> ProfileIn | None:
    if profile is None:
        return None
    return ProfileIn(
        target_field=profile.target_field,
        current_status=profile.current_status,
        available_weeks=profile.available_weeks,
        weekly_hours=profile.weekly_hours,
        interested_role=profile.interested_role,
        knowledge_level=profile.knowledge_level,
        has_related_major=profile.has_related_major,
        has_work_experience=profile.has_work_experience,
    )


def user_out(user: User) -> UserOut:
    return UserOut(id=user.id, email=user.email, name=user.name, profile=profile_out(user.profile))


def certificate_out(certificate: Certificate) -> CertificateOut:
    return CertificateOut(
        id=certificate.id,
        slug=certificate.slug,
        name=certificate.name,
        category=certificate.category,
        difficulty=certificate.difficulty,
        required_weeks=certificate.required_weeks,
        min_weekly_hours=certificate.min_weekly_hours,
        average_pass_rate=certificate.average_pass_rate,
        provider=certificate.provider,
        exam_type=certificate.exam_type,
        eligibility=certificate.eligibility,
        schedule_summary=certificate.schedule_summary,
        description=certificate.description,
        target_roles=json_list(certificate.target_roles_json),
        subjects=json_list(certificate.subjects_json),
        tags=json_list(certificate.tags_json),
        schedules=[
            ExamScheduleOut(
                id=schedule.id,
                exam_name=schedule.exam_name,
                registration_start=schedule.registration_start,
                registration_end=schedule.registration_end,
                exam_date=schedule.exam_date,
                result_date=schedule.result_date,
                location=schedule.location,
                note=schedule.note,
            )
            for schedule in certificate.schedules
        ],
    )


def recommendation_item_out(item: RecommendationItem) -> RecommendationItemOut:
    return RecommendationItemOut(
        id=item.id,
        certificate=certificate_out(item.certificate),
        score=item.score,
        pass_probability=item.pass_probability,
        estimated_weeks=item.estimated_weeks,
        eligibility_status=item.eligibility_status,
        reasons=json.loads(item.reasons_json),
        breakdown=json.loads(item.breakdown_json),
    )


def recommendation_run_out(run: RecommendationRun) -> RecommendationRunOut:
    return RecommendationRunOut(
        id=run.id,
        created_at=run.created_at,
        profile_snapshot=ProfileIn(**json.loads(run.profile_snapshot_json)),
        items=[recommendation_item_out(item) for item in sorted(run.items, key=lambda x: x.score, reverse=True)],
    )


def roadmap_out(roadmap: Roadmap) -> RoadmapOut:
    steps = sorted(roadmap.steps, key=lambda step: step.week)
    checked = sum(1 for step in steps if step.checked)
    progress = round((checked / len(steps)) * 100, 1) if steps else 0.0
    return RoadmapOut(
        id=roadmap.id,
        certificate=certificate_out(roadmap.certificate),
        title=roadmap.title,
        total_weeks=roadmap.total_weeks,
        created_at=roadmap.created_at,
        progress=progress,
        steps=[
            RoadmapStepOut(
                id=step.id,
                week=step.week,
                title=step.title,
                description=step.description,
                planned_hours=step.planned_hours,
                checked=step.checked,
            )
            for step in steps
        ],
    )
