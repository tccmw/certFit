from __future__ import annotations

from datetime import UTC, date, datetime

from sqlalchemy import Boolean, Date, DateTime, Float, ForeignKey, Integer, String, Text, UniqueConstraint
from sqlalchemy.orm import Mapped, mapped_column, relationship

from .database import Base


def utcnow() -> datetime:
    return datetime.now(UTC)


class User(Base):
    __tablename__ = "users"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    email: Mapped[str] = mapped_column(String(255), unique=True, index=True)
    name: Mapped[str] = mapped_column(String(100))
    password_hash: Mapped[str] = mapped_column(String(255))
    session_token: Mapped[str | None] = mapped_column(String(128), unique=True, index=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=utcnow)

    profile: Mapped["UserProfile"] = relationship(back_populates="user", uselist=False)


class UserProfile(Base):
    __tablename__ = "user_profiles"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    user_id: Mapped[int] = mapped_column(ForeignKey("users.id"), unique=True)
    target_field: Mapped[str] = mapped_column(String(80))
    current_status: Mapped[str] = mapped_column(String(80))
    available_weeks: Mapped[int] = mapped_column(Integer)
    weekly_hours: Mapped[int] = mapped_column(Integer)
    interested_role: Mapped[str] = mapped_column(String(120))
    knowledge_level: Mapped[str] = mapped_column(String(40))
    has_related_major: Mapped[bool] = mapped_column(Boolean, default=False)
    has_work_experience: Mapped[bool] = mapped_column(Boolean, default=False)
    updated_at: Mapped[datetime] = mapped_column(DateTime, default=utcnow)

    user: Mapped[User] = relationship(back_populates="profile")


class Certificate(Base):
    __tablename__ = "certificates"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    slug: Mapped[str] = mapped_column(String(80), unique=True, index=True)
    name: Mapped[str] = mapped_column(String(120))
    category: Mapped[str] = mapped_column(String(80))
    difficulty: Mapped[int] = mapped_column(Integer)
    required_weeks: Mapped[int] = mapped_column(Integer)
    min_weekly_hours: Mapped[int] = mapped_column(Integer)
    average_pass_rate: Mapped[float] = mapped_column(Float)
    provider: Mapped[str] = mapped_column(String(120))
    exam_type: Mapped[str] = mapped_column(String(120))
    eligibility: Mapped[str] = mapped_column(Text)
    schedule_summary: Mapped[str] = mapped_column(Text)
    description: Mapped[str] = mapped_column(Text)
    target_roles_json: Mapped[str] = mapped_column(Text)
    subjects_json: Mapped[str] = mapped_column(Text)
    tags_json: Mapped[str] = mapped_column(Text)

    schedules: Mapped[list["ExamSchedule"]] = relationship(back_populates="certificate")


class ExamSchedule(Base):
    __tablename__ = "exam_schedules"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    certificate_id: Mapped[int] = mapped_column(ForeignKey("certificates.id"))
    exam_name: Mapped[str] = mapped_column(String(120))
    registration_start: Mapped[datetime | None] = mapped_column(Date, nullable=True)
    registration_end: Mapped[datetime | None] = mapped_column(Date, nullable=True)
    exam_date: Mapped[datetime | None] = mapped_column(Date, nullable=True)
    result_date: Mapped[datetime | None] = mapped_column(Date, nullable=True)
    location: Mapped[str] = mapped_column(String(120), default="전국")
    note: Mapped[str] = mapped_column(Text, default="")

    certificate: Mapped[Certificate] = relationship(back_populates="schedules")


class UserCertificate(Base):
    __tablename__ = "user_certificates"
    __table_args__ = (UniqueConstraint("user_id", "certificate_id", name="uq_user_certificate"),)

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    user_id: Mapped[int] = mapped_column(ForeignKey("users.id"))
    certificate_id: Mapped[int] = mapped_column(ForeignKey("certificates.id"))
    acquired_at: Mapped[date | None] = mapped_column(Date, nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=utcnow)

    certificate: Mapped[Certificate] = relationship()


class RecommendationRun(Base):
    __tablename__ = "recommendation_runs"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    user_id: Mapped[int] = mapped_column(ForeignKey("users.id"))
    profile_snapshot_json: Mapped[str] = mapped_column(Text)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=utcnow)

    items: Mapped[list["RecommendationItem"]] = relationship(back_populates="run")


class RecommendationItem(Base):
    __tablename__ = "recommendation_items"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    run_id: Mapped[int] = mapped_column(ForeignKey("recommendation_runs.id"))
    certificate_id: Mapped[int] = mapped_column(ForeignKey("certificates.id"))
    score: Mapped[float] = mapped_column(Float)
    pass_probability: Mapped[float] = mapped_column(Float)
    estimated_weeks: Mapped[int] = mapped_column(Integer)
    eligibility_status: Mapped[str] = mapped_column(String(80))
    reasons_json: Mapped[str] = mapped_column(Text)
    breakdown_json: Mapped[str] = mapped_column(Text)

    run: Mapped[RecommendationRun] = relationship(back_populates="items")
    certificate: Mapped[Certificate] = relationship()


class Roadmap(Base):
    __tablename__ = "roadmaps"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    user_id: Mapped[int] = mapped_column(ForeignKey("users.id"))
    certificate_id: Mapped[int] = mapped_column(ForeignKey("certificates.id"))
    title: Mapped[str] = mapped_column(String(160))
    total_weeks: Mapped[int] = mapped_column(Integer)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=utcnow)

    certificate: Mapped[Certificate] = relationship()
    steps: Mapped[list["RoadmapStep"]] = relationship(back_populates="roadmap")


class RoadmapStep(Base):
    __tablename__ = "roadmap_steps"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    roadmap_id: Mapped[int] = mapped_column(ForeignKey("roadmaps.id"))
    week: Mapped[int] = mapped_column(Integer)
    title: Mapped[str] = mapped_column(String(160))
    description: Mapped[str] = mapped_column(Text)
    planned_hours: Mapped[int] = mapped_column(Integer)
    checked: Mapped[bool] = mapped_column(Boolean, default=False)

    roadmap: Mapped[Roadmap] = relationship(back_populates="steps")


class UserEvent(Base):
    __tablename__ = "user_events"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    user_id: Mapped[int | None] = mapped_column(ForeignKey("users.id"), nullable=True)
    certificate_id: Mapped[int | None] = mapped_column(ForeignKey("certificates.id"), nullable=True)
    event_type: Mapped[str] = mapped_column(String(40))
    metadata_json: Mapped[str] = mapped_column(Text, default="{}")
    created_at: Mapped[datetime] = mapped_column(DateTime, default=utcnow)
