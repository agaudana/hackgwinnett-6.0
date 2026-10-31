from fastapi.testclient import TestClient

from app.main import app

client = TestClient(app)


def test_study_plan_success_response():
    response = client.post(
        "/api/study-plan",
        json={
            "subjectArea": "Biology",
            "topic": "Cell respiration",
            "minutes": 45,
            "difficulty": "beginner",
        },
    )

    assert response.status_code == 200
    payload = response.json()
    assert payload["subjectArea"] == "Biology"
    assert payload["topic"] == "Cell respiration"
    assert payload["minutes"] == 45
    assert payload["planId"].startswith("sp_")
    assert len(payload["studyPlan"]) >= 2
    assert len(payload["quiz"]) >= 1
    assert "generatedAt" in payload


def test_invalid_topic_returns_contract_error():
    response = client.post(
        "/api/study-plan",
        json={
            "subjectArea": "Biology",
            "topic": "",
            "minutes": 45,
        },
    )

    assert response.status_code == 400
    payload = response.json()
    assert payload["error"]["code"] == "INVALID_REQUEST"
    assert payload["error"]["field"] == "topic"


def test_invalid_minutes_returns_time_range_error():
    response = client.post(
        "/api/study-plan",
        json={
            "subjectArea": "Biology",
            "topic": "Cell respiration",
            "minutes": 5,
        },
    )

    assert response.status_code == 400
    payload = response.json()
    assert payload["error"]["code"] == "INVALID_TIME_RANGE"
    assert payload["error"]["field"] == "minutes"


def test_unsupported_difficulty_returns_error():
    response = client.post(
        "/api/study-plan",
        json={
            "subjectArea": "Biology",
            "topic": "Cell respiration",
            "minutes": 30,
            "difficulty": "expert",
        },
    )

    assert response.status_code == 400
    payload = response.json()
    assert payload["error"]["code"] == "UNSUPPORTED_DIFFICULTY"
    assert payload["error"]["field"] == "difficulty"
