from __future__ import annotations

import json
from datetime import date

from sqlalchemy.orm import Session

from .models import Certificate, ExamSchedule


CERTIFICATES = [
    {
        "slug": "information-processing-engineer",
        "name": "정보처리기사",
        "category": "IT/개발",
        "difficulty": 4,
        "required_weeks": 16,
        "min_weekly_hours": 8,
        "average_pass_rate": 52.0,
        "provider": "한국산업인력공단",
        "exam_type": "필기 + 실기",
        "eligibility": "관련 학과, 경력, 학점은행 등 기사 응시 자격 확인 필요",
        "schedule_summary": "연 3회 정기 기사 시험 중심",
        "description": "소프트웨어 개발, 데이터베이스, 네트워크, 정보시스템 운영 전반을 검증하는 대표 IT 국가기술자격입니다.",
        "target_roles": ["백엔드 개발자", "프론트엔드 개발자", "시스템 엔지니어", "IT 기획자"],
        "subjects": ["소프트웨어 설계", "소프트웨어 개발", "데이터베이스 구축", "프로그래밍 언어 활용", "정보시스템 구축관리"],
        "tags": ["개발", "국가기술자격", "취업", "기사"],
    },
    {
        "slug": "computer-literacy",
        "name": "컴퓨터활용능력",
        "category": "사무/OA",
        "difficulty": 2,
        "required_weeks": 6,
        "min_weekly_hours": 5,
        "average_pass_rate": 48.0,
        "provider": "대한상공회의소",
        "exam_type": "필기 + 실기",
        "eligibility": "제한 없음",
        "schedule_summary": "상시 시험 중심",
        "description": "스프레드시트와 데이터베이스 활용 능력을 평가해 사무·행정 직무에서 범용적으로 쓰입니다.",
        "target_roles": ["사무직", "행정", "마케팅 운영", "회계 보조"],
        "subjects": ["컴퓨터 일반", "스프레드시트", "데이터베이스"],
        "tags": ["엑셀", "OA", "사무", "상시"],
    },
    {
        "slug": "sqld",
        "name": "SQLD",
        "category": "데이터",
        "difficulty": 3,
        "required_weeks": 8,
        "min_weekly_hours": 6,
        "average_pass_rate": 57.0,
        "provider": "한국데이터산업진흥원",
        "exam_type": "필기",
        "eligibility": "제한 없음",
        "schedule_summary": "연 4회 내외 정기 시험",
        "description": "SQL 작성과 데이터 모델링 기초를 검증해 데이터 분석, 백엔드, BI 직무 준비에 적합합니다.",
        "target_roles": ["데이터 분석가", "백엔드 개발자", "BI 분석가", "데이터 엔지니어"],
        "subjects": ["데이터 모델링의 이해", "SQL 기본 및 활용"],
        "tags": ["SQL", "데이터", "개발", "분석"],
    },
    {
        "slug": "adsp",
        "name": "ADsP",
        "category": "데이터",
        "difficulty": 3,
        "required_weeks": 7,
        "min_weekly_hours": 5,
        "average_pass_rate": 60.0,
        "provider": "한국데이터산업진흥원",
        "exam_type": "필기",
        "eligibility": "제한 없음",
        "schedule_summary": "연 4회 내외 정기 시험",
        "description": "데이터 이해, 분석 기획, 통계·머신러닝 기초를 폭넓게 다루는 데이터 분석 입문 자격입니다.",
        "target_roles": ["데이터 분석가", "마케팅 분석", "서비스 기획자", "BI 분석가"],
        "subjects": ["데이터 이해", "데이터 분석 기획", "데이터 분석"],
        "tags": ["통계", "데이터", "분석", "AI"],
    },
    {
        "slug": "gtq",
        "name": "GTQ",
        "category": "디자인",
        "difficulty": 2,
        "required_weeks": 5,
        "min_weekly_hours": 4,
        "average_pass_rate": 70.0,
        "provider": "한국생산성본부",
        "exam_type": "실기",
        "eligibility": "제한 없음",
        "schedule_summary": "월 1회 내외 정기 시험",
        "description": "포토샵 기반 그래픽 제작 역량을 검증해 디자인 포트폴리오와 실무 기초를 함께 준비할 수 있습니다.",
        "target_roles": ["그래픽 디자이너", "콘텐츠 디자이너", "마케팅 디자이너"],
        "subjects": ["사진 편집", "포스터 제작", "그래픽 합성", "출력물 구성"],
        "tags": ["포토샵", "디자인", "실기", "콘텐츠"],
    },
    {
        "slug": "network-manager",
        "name": "네트워크관리사",
        "category": "네트워크/인프라",
        "difficulty": 3,
        "required_weeks": 9,
        "min_weekly_hours": 6,
        "average_pass_rate": 55.0,
        "provider": "한국정보통신자격협회",
        "exam_type": "필기 + 실기",
        "eligibility": "2급 제한 없음, 1급은 관련 조건 확인 필요",
        "schedule_summary": "정기 시험 운영",
        "description": "TCP/IP, 라우팅, 서버·네트워크 운용 기초를 다뤄 인프라 직무 입문에 적합합니다.",
        "target_roles": ["네트워크 엔지니어", "시스템 엔지니어", "보안 관제"],
        "subjects": ["네트워크 일반", "TCP/IP", "NOS", "네트워크 운용기기"],
        "tags": ["네트워크", "인프라", "서버", "운영"],
    },
    {
        "slug": "linux-master",
        "name": "리눅스마스터",
        "category": "네트워크/인프라",
        "difficulty": 3,
        "required_weeks": 8,
        "min_weekly_hours": 5,
        "average_pass_rate": 62.0,
        "provider": "한국정보통신진흥협회",
        "exam_type": "필기 + 실기",
        "eligibility": "제한 없음",
        "schedule_summary": "정기 시험 운영",
        "description": "리눅스 명령어, 시스템 관리, 네트워크 서비스를 다루며 개발·인프라 공통 기초를 다집니다.",
        "target_roles": ["시스템 엔지니어", "백엔드 개발자", "클라우드 엔지니어", "DevOps"],
        "subjects": ["리눅스 일반", "리눅스 운영 및 관리", "리눅스 활용"],
        "tags": ["리눅스", "서버", "클라우드", "운영"],
    },
]


SCHEDULES = {
    "information-processing-engineer": [
        ("2026 정기 기사 2회", date(2026, 4, 13), date(2026, 4, 17), date(2026, 5, 10), date(2026, 6, 12)),
        ("2026 정기 기사 3회", date(2026, 7, 20), date(2026, 7, 24), date(2026, 8, 16), date(2026, 9, 18)),
    ],
    "computer-literacy": [
        ("상시 6월 시험", date(2026, 6, 1), date(2026, 6, 20), date(2026, 6, 27), date(2026, 7, 3)),
    ],
    "sqld": [
        ("제58회 SQLD", date(2026, 8, 3), date(2026, 8, 10), date(2026, 9, 5), date(2026, 10, 2)),
    ],
    "adsp": [
        ("제49회 ADsP", date(2026, 7, 6), date(2026, 7, 13), date(2026, 8, 8), date(2026, 9, 4)),
    ],
    "gtq": [
        ("GTQ 7월 정기시험", date(2026, 7, 1), date(2026, 7, 8), date(2026, 7, 25), date(2026, 8, 7)),
    ],
    "network-manager": [
        ("네트워크관리사 3회", date(2026, 8, 17), date(2026, 8, 24), date(2026, 9, 19), date(2026, 10, 9)),
    ],
    "linux-master": [
        ("리눅스마스터 3회", date(2026, 8, 10), date(2026, 8, 17), date(2026, 9, 12), date(2026, 10, 2)),
    ],
}


def seed_database(db: Session) -> None:
    if db.query(Certificate).count() > 0:
        return

    for item in CERTIFICATES:
        certificate = Certificate(
            slug=item["slug"],
            name=item["name"],
            category=item["category"],
            difficulty=item["difficulty"],
            required_weeks=item["required_weeks"],
            min_weekly_hours=item["min_weekly_hours"],
            average_pass_rate=item["average_pass_rate"],
            provider=item["provider"],
            exam_type=item["exam_type"],
            eligibility=item["eligibility"],
            schedule_summary=item["schedule_summary"],
            description=item["description"],
            target_roles_json=json.dumps(item["target_roles"], ensure_ascii=False),
            subjects_json=json.dumps(item["subjects"], ensure_ascii=False),
            tags_json=json.dumps(item["tags"], ensure_ascii=False),
        )
        db.add(certificate)
        db.flush()

        for schedule in SCHEDULES.get(item["slug"], []):
            db.add(
                ExamSchedule(
                    certificate_id=certificate.id,
                    exam_name=schedule[0],
                    registration_start=schedule[1],
                    registration_end=schedule[2],
                    exam_date=schedule[3],
                    result_date=schedule[4],
                    location="전국",
                    note="샘플 일정입니다. 실제 접수 전 공식 사이트 확인이 필요합니다.",
                )
            )

    db.commit()
