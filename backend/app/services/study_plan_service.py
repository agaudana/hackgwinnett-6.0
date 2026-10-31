from __future__ import annotations

from datetime import datetime, timezone
import json
import os
from pathlib import Path
import uuid

import httpx

from app.schemas import StudyPlanRequest


def _load_env_file() -> None:
    env_paths = [
        Path(__file__).resolve().parents[2] / ".env",
        Path(__file__).resolve().parents[2] / "backend" / ".env",
    ]
    for env_path in env_paths:
        if not env_path.exists():
            continue
        for line in env_path.read_text(encoding="utf-8").splitlines():
            line = line.strip()
            if not line or line.startswith("#") or "=" not in line:
                continue
            key, value = line.split("=", 1)
            os.environ.setdefault(key.strip(), value.strip().strip('"').strip("'"))


def _get_gemini_api_key() -> str | None:
    _load_env_file()
    return os.getenv("GEMINI_API_KEY") or os.getenv("GOOGLE_API_KEY")


def _build_plan_blocks(subject_area: str, topic: str, minutes: int) -> list[dict]:
    ratios = [0.4, 0.35, 0.25]
    block_templates = [
        {
            "title": "Build the foundation",
            "focus": f"Understand the core ideas behind {topic} in {subject_area} before trying harder tasks.",
            "tasks": [
                "Read a short overview of the key concept",
                "Write 3 notes in your own words",
            ],
        },
        {
            "title": "Practice the process",
            "focus": f"Apply {topic} to a few examples so you can recognize the pattern and explain it clearly.",
            "tasks": [
                "Work through 2 sample questions",
                "Explain the steps aloud without looking",
            ],
        },
        {
            "title": "Check recall",
            "focus": f"Use quick retrieval to confirm what you know and identify any gaps in {topic}.",
            "tasks": [
                "Answer a short quiz",
                "Review the explanations for any missed questions",
            ],
        },
    ]

    remaining = minutes
    blocks: list[dict] = []

    for index, template in enumerate(block_templates):
        if index == len(block_templates) - 1:
            block_minutes = remaining
        else:
            block_minutes = max(1, round(minutes * ratios[index]))
            remaining -= block_minutes
        blocks.append(
            {
                "title": template["title"],
                "minutes": block_minutes,
                "focus": template["focus"],
                "tasks": template["tasks"],
            }
        )

    return blocks


def _build_quiz(subject_area: str, topic: str) -> list[dict]:
    return [
        {
            "question": f"What is the best first move when studying {topic} in {subject_area}?",
            "options": [
                "Understand the core idea before memorizing details",
                "Skip straight to advanced examples",
                "Only focus on one random fact",
                "Ignore the topic summary entirely",
            ],
            "answerIndex": 0,
            "explanation": "Starting with the big idea gives you a mental map so later details make sense.",
        },
        {
            "question": f"Which method helps you retain {topic} most effectively during a short study session?",
            "options": [
                "Frequent recall and explanation in your own words",
                "Reading once without stopping",
                "Copying notes without thinking",
                "Leaving the hardest item for the end",
            ],
            "answerIndex": 0,
            "explanation": "Retrieval and explanation build real understanding instead of passive recognition.",
        },
        {
            "question": f"Why is a short practice quiz useful for {topic}?",
            "options": [
                "It checks what you actually know and reveals gaps",
                "It removes the need to review notes",
                "It lets you skip the study plan",
                "It replaces understanding with guessing",
            ],
            "answerIndex": 0,
            "explanation": "A quick quiz gives feedback on recall and points to the areas that need more attention.",
        },
    ]


def _strip_code_fence(text: str) -> str:
    cleaned = text.strip()
    if cleaned.startswith("```"):
        cleaned = cleaned.replace("```json", "", 1).replace("```JSON", "", 1).replace("```", "", 1).strip()
    return cleaned


def _normalize_model_payload(payload: dict, request: StudyPlanRequest) -> dict:
    study_plan = payload.get("studyPlan") or payload.get("study_plan") or []
    quiz = payload.get("quiz") or payload.get("quizQuestions") or payload.get("questions") or []

    normalized_study_plan = []
    for block in study_plan:
        if not isinstance(block, dict):
            continue
        normalized_study_plan.append(
            {
                "title": str(block.get("title") or "Review the key idea"),
                "minutes": int(block.get("minutes") or 0),
                "focus": str(block.get("focus") or f"Study {request.topic} in {request.subjectArea}."),
                "tasks": [str(task) for task in block.get("tasks") or []],
            }
        )

    normalized_quiz = []
    for question in quiz:
        if not isinstance(question, dict):
            continue
        options = question.get("options") or []
        normalized_quiz.append(
            {
                "question": str(question.get("question") or "What is the main idea?"),
                "options": [str(option) for option in options],
                "answerIndex": int(question.get("answerIndex") or 0),
                "explanation": str(question.get("explanation") or "Review the concept and try again."),
            }
        )

    if not normalized_study_plan:
        normalized_study_plan = _build_plan_blocks(request.subjectArea, request.topic, request.minutes)
    if not normalized_quiz:
        normalized_quiz = _build_quiz(request.subjectArea, request.topic)

    return {
        "studyPlan": normalized_study_plan,
        "quiz": normalized_quiz,
    }


def _generate_with_gemini(request: StudyPlanRequest) -> dict | None:
    api_key = _get_gemini_api_key()
    if not api_key:
        return None

    prompt = (
        "You are a supportive study coach. Generate a short, personalized study plan for a student studying "
        f"{request.subjectArea} -> {request.topic}. "
        f"The student has {request.minutes} minutes and is at a {request.difficulty or 'beginner'} level. "
        "Return valid JSON only with the exact shape: {\"studyPlan\": [{\"title\": string, \"minutes\": number, \"focus\": string, \"tasks\": [string, ...]}], \"quiz\": [{\"question\": string, \"options\": [string, string, string, string], \"answerIndex\": number, \"explanation\": string}]}. "
        "Keep the tone practical, encouraging, and specific to the subject and topic."
    )

    try:
        from google import genai

        client = genai.Client(api_key=api_key)
        response = client.models.generate_content(model="gemini-3.8-flash", contents=prompt)
        model_text = getattr(response, "text", None)
        if not model_text and hasattr(response, "candidates"):
            candidates = response.candidates or []
            if candidates:
                content = getattr(candidates[0], "content", None)
                if content is not None:
                    parts = getattr(content, "parts", []) or []
                    model_text = "".join(getattr(part, "text", "") for part in parts if getattr(part, "text", None))
        if not model_text:
            raise ValueError("Gemini response did not include text content")
    except Exception:
        response = httpx.post(
            "https://generativelanguage.googleapis.com/v1beta/models/gemini-3.8-flash:generateContent",
            params={"key": api_key},
            json={
                "contents": [{"parts": [{"text": prompt}]}],
                "generationConfig": {"response_mime_type": "application/json", "temperature": 0.7},
            },
            timeout=30.0,
        )
        response.raise_for_status()

        payload = response.json()
        candidates = payload.get("candidates") or []
        if not candidates:
            raise ValueError("No Gemini candidates returned")

        content = candidates[0].get("content", {})
        parts = content.get("parts") or []
        model_text = "".join(str(part.get("text") or "") for part in parts if isinstance(part, dict))
        if not model_text:
            raise ValueError("Gemini response did not include text content")

    cleaned = _strip_code_fence(model_text)
    parsed = json.loads(cleaned)
    normalized = _normalize_model_payload(parsed, request)
    total_minutes = int(request.minutes)
    study_plan = normalized["studyPlan"]
    quiz = normalized["quiz"]

    if not study_plan or not quiz:
        raise ValueError("Gemini returned incomplete study plan data")

    for block in study_plan:
        block["minutes"] = max(5, int(block.get("minutes", 0)))
    total_assigned = sum(int(block["minutes"]) for block in study_plan)
    if total_assigned > total_minutes:
        ratio = total_minutes / total_assigned if total_assigned else 1
        for block in study_plan:
            block["minutes"] = max(5, int(round(int(block["minutes"]) * ratio)))

    plan = {
        "planId": f"sp_{uuid.uuid4().hex[:8]}",
        "subjectArea": request.subjectArea,
        "topic": request.topic,
        "minutes": request.minutes,
        "studyPlan": study_plan,
        "quiz": quiz,
        "generatedAt": datetime.now(timezone.utc).replace(microsecond=0).isoformat().replace("+00:00", "Z"),
    }
    return plan


def generate_study_plan(request: StudyPlanRequest) -> dict:
    try:
        gemini_plan = _generate_with_gemini(request)
        if gemini_plan is not None:
            return gemini_plan
    except Exception:
        pass

    study_plan = _build_plan_blocks(request.subjectArea, request.topic, request.minutes)
    quiz = _build_quiz(request.subjectArea, request.topic)

    return {
        "planId": f"sp_{uuid.uuid4().hex[:8]}",
        "subjectArea": request.subjectArea,
        "topic": request.topic,
        "minutes": request.minutes,
        "studyPlan": study_plan,
        "quiz": quiz,
        "generatedAt": datetime.now(timezone.utc).replace(microsecond=0).isoformat().replace("+00:00", "Z"),
    }
