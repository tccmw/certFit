from __future__ import annotations

from datetime import date, datetime
from typing import Any

from pydantic import BaseModel, Field


class ProfileIn(BaseModel):
    target_field: str = "IT/개발"
    current_status: str = "대학생"
    available_weeks: int = Field(default=12, ge=1, le=52)
    weekly_hours: int = Field(default=8, ge=0, le=80)
    interested_role: str = "백엔드 개발자"
    knowledge_level: str = "basic"
    has_related_major: bool = False
    has_work_experience: bool = False


class UserOut(BaseModel):
    id: int
    email: str
    name: str
    profile: ProfileIn | None = None


class AuthIn(BaseModel):
    email: str
    password: str = Field(min_length=6)
    name: str | None = None


class AuthOut(BaseModel):
    token: str
    user: UserOut


class ExamScheduleOut(BaseModel):
    id: int
    exam_name: str
    registration_start: date | None
    registration_end: date | None
    exam_date: date | None
    result_date: date | None
    location: str
    note: str


class LearningResourceOut(BaseModel):
    name: str
    provider_type: str
    delivery: str
    fit: str
    note: str


class CertificateOut(BaseModel):
    id: int
    slug: str
    name: str
    category: str
    difficulty: int
    required_weeks: int
    min_weekly_hours: int
    average_pass_rate: float
    provider: str
    exam_type: str
    eligibility: str
    schedule_summary: str
    description: str
    target_roles: list[str]
    subjects: list[str]
    tags: list[str]
    schedules: list[ExamScheduleOut] = []
    learning_resources: list[LearningResourceOut] = []


class UserCertificateCreate(BaseModel):
    certificate_id: int


class UserCertificateOut(BaseModel):
    id: int
    certificate: CertificateOut
    acquired_at: date | None


class RecommendationItemOut(BaseModel):
    id: int
    certificate: CertificateOut
    score: float
    pass_probability: float
    estimated_weeks: int
    eligibility_status: str
    reasons: list[str]
    breakdown: dict[str, float]


class RecommendationRunOut(BaseModel):
    id: int
    created_at: datetime
    profile_snapshot: ProfileIn
    items: list[RecommendationItemOut]


class RoadmapCreate(BaseModel):
    certificate_id: int
    total_weeks: int | None = Field(default=None, ge=1, le=52)


class RoadmapStepOut(BaseModel):
    id: int
    week: int
    title: str
    description: str
    planned_hours: int
    checked: bool


class RoadmapOut(BaseModel):
    id: int
    certificate: CertificateOut
    title: str
    total_weeks: int
    created_at: datetime
    progress: float
    steps: list[RoadmapStepOut]


class StepPatch(BaseModel):
    checked: bool


class EventIn(BaseModel):
    event_type: str
    certificate_id: int | None = None
    metadata: dict[str, Any] = {}


class ImportOut(BaseModel):
    status: str
    imported_count: int
    message: str
