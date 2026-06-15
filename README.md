# CertFit

CertFit은 사용자 목표, 준비 기간, 주당 학습 시간, 관심 직무, 기초 지식 수준을 바탕으로 자격증 추천과 합격 가능성, 학습 로드맵을 제공하는 풀스택 MVP입니다.

## Stack

- Frontend: React, TypeScript, Vite, Tailwind CSS, Chart.js
- Backend: FastAPI, SQLAlchemy, SQLite
- Scope: 회원가입, 사용자 프로필 저장, 추천 결과 저장, 행동 로그, 로드맵 저장/진행률, 시험 일정 표시, 공공데이터 import 어댑터 자리

## Run

```powershell
npm install
python -m venv .venv
.\.venv\Scripts\python -m pip install -r backend\requirements.txt
.\.venv\Scripts\python -m uvicorn backend.app.main:app --reload
npm run dev
```

Frontend: `http://localhost:5173`

API: `http://127.0.0.1:8000`

Pages:

- `/login`: 로그인
- `/register`: 회원가입
- `/main`: 자격증 추천 메인
- `/mypage`: 추천 기록, 저장 로드맵, 진행률 관리

## Test

```powershell
.\.venv\Scripts\python -m pytest backend
npm run build
```

`PUBLIC_DATA_API_KEY`가 없으면 샘플 자격증 데이터를 유지합니다.
