from __future__ import annotations

from datetime import datetime, timezone
import uuid

from app.schemas import StudyPlanRequest


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


def generate_study_plan(request: StudyPlanRequest) -> dict:
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
