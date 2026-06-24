from __future__ import annotations

from uuid import uuid4

from fastapi.testclient import TestClient

from backend.app.main import app


def test_cors_allows_vite_fallback_dev_port():
    with TestClient(app) as client:
        response = client.options(
            "/auth/register",
            headers={
                "Origin": "http://localhost:5174",
                "Access-Control-Request-Method": "POST",
            },
        )

        assert response.status_code == 200
        assert response.headers["access-control-allow-origin"] == "http://localhost:5174"


def test_register_recommend_and_create_roadmap_flow():
    with TestClient(app) as client:
        email = f"tester-{uuid4().hex}@example.com"
        auth = client.post(
            "/auth/register",
            json={"email": email, "password": "secret123", "name": "테스터"},
        )
        assert auth.status_code == 200
        token = auth.json()["token"]
        headers = {"Authorization": f"Bearer {token}"}

        recommendations = client.post(
            "/recommendations",
            headers=headers,
            json={
                "target_field": "IT/개발",
                "current_status": "대학생",
                "available_weeks": 12,
                "weekly_hours": 8,
                "interested_role": "백엔드 개발자",
                "knowledge_level": "basic",
                "has_related_major": True,
                "has_work_experience": False,
            },
        )
        assert recommendations.status_code == 200
        item = recommendations.json()["items"][0]
        assert item["certificate"]["learning_resources"]
        assert {"name", "provider_type", "delivery", "fit", "note"} <= set(item["certificate"]["learning_resources"][0])

        owned = client.post("/my-certificates", headers=headers, json={"certificate_id": item["certificate"]["id"]})
        assert owned.status_code == 201
        assert owned.json()["certificate"]["id"] == item["certificate"]["id"]

        listed = client.get("/my-certificates", headers=headers)
        assert listed.status_code == 200
        assert len(listed.json()) == 1

        removed = client.delete(f"/my-certificates/{owned.json()['id']}", headers=headers)
        assert removed.status_code == 204

        roadmap = client.post("/roadmaps", headers=headers, json={"certificate_id": item["certificate"]["id"]})
        assert roadmap.status_code == 200
        body = roadmap.json()
        assert body["steps"]

        first_step = body["steps"][0]
        patched = client.patch(
            f"/roadmaps/{body['id']}/steps/{first_step['id']}",
            headers=headers,
            json={"checked": True},
        )
        assert patched.status_code == 200
        assert patched.json()["progress"] > 0
