from __future__ import annotations

from .models import Certificate
from .recommender import load_json_list


def generate_roadmap_steps(certificate: Certificate, total_weeks: int, weekly_hours: int) -> list[dict[str, object]]:
    subjects = load_json_list(certificate.subjects_json)
    if not subjects:
        subjects = ["핵심 개념", "기출 문제", "실전 정리"]

    steps: list[dict[str, object]] = []
    hours = max(1, weekly_hours)
    for week in range(1, total_weeks + 1):
        ratio = week / total_weeks
        subject = subjects[(week - 1) % len(subjects)]
        if ratio <= 0.25:
            title = f"{week}주차: {subject} 기초 정리"
            description = f"{subject}의 기본 용어와 출제 범위를 정리하고 짧은 확인 문제로 이해도를 점검합니다."
        elif ratio <= 0.65:
            title = f"{week}주차: {subject} 핵심 문제 풀이"
            description = f"{subject} 빈출 유형을 풀고 오답을 주제별로 분류해 약점을 보완합니다."
        elif ratio <= 0.9:
            title = f"{week}주차: 기출·모의고사 압축 훈련"
            description = "최근 기출과 모의고사를 시간 제한 안에 풀고 점수 변화를 기록합니다."
        else:
            title = f"{week}주차: 시험 직전 최종 점검"
            description = "오답 노트, 암기 항목, 시험장 전략을 점검하고 실전 컨디션을 맞춥니다."
        steps.append(
            {
                "week": week,
                "title": title,
                "description": description,
                "planned_hours": hours,
                "checked": False,
            }
        )
    return steps
