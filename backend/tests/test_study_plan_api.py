import sys
from types import ModuleType, SimpleNamespace

from fastapi.testclient import TestClient

from app.main import app
from app.schemas import StudyPlanRequest
from app.services.study_plan_service import generate_study_plan

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


def test_generate_study_plan_uses_gemini_when_configured(monkeypatch):
    captured = {}

    class FakeGeminiClient:
        def __init__(self, api_key):
            captured["api_key"] = api_key

        class models:
            @staticmethod
            def generate_content(model, contents):
                captured["model"] = model
                captured["contents"] = contents
                return SimpleNamespace(
                    text=(
                        '{'
                        '"studyPlan": ['
                        '{"title": "Build the core idea", "minutes": 20, "focus": "Understand the key concept.", "tasks": ["Read the overview", "Summarize it in your own words"]},'
                        '{"title": "Practice it", "minutes": 15, "focus": "Work through examples.", "tasks": ["Solve one problem", "Check the reason"]}'
                        '],'
                        '"quiz": ['
                        '{"question": "What is the main idea?", "options": ["A", "B", "C", "D"], "answerIndex": 0, "explanation": "Because it matches the key concept."}'
                        ']' 
                        '}'
                    )
                )

    fake_google_module = ModuleType("google")
    fake_genai_module = ModuleType("google.genai")
    fake_genai_module.Client = FakeGeminiClient
    fake_google_module.genai = fake_genai_module

    monkeypatch.setitem(sys.modules, "google", fake_google_module)
    monkeypatch.setitem(sys.modules, "google.genai", fake_genai_module)
    monkeypatch.setenv("GEMINI_API_KEY", "test-key")

    payload = generate_study_plan(StudyPlanRequest(subjectArea="Biology", topic="Cell respiration", minutes=35, difficulty="beginner"))

    assert captured["api_key"] == "test-key"
    assert captured["model"] == "gemini-3.8-flash"
    assert payload["subjectArea"] == "Biology"
    assert payload["studyPlan"][0]["title"] == "Build the core idea"
    assert payload["quiz"][0]["question"] == "What is the main idea?"
