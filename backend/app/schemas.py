from typing import Literal

from pydantic import BaseModel, ConfigDict, field_validator

Difficulty = Literal["beginner", "intermediate", "advanced"]


class StudyPlanRequest(BaseModel):
    model_config = ConfigDict(extra="forbid")

    subjectArea: str
    topic: str
    minutes: int
    difficulty: Difficulty | None = "beginner"

    @field_validator("subjectArea", "topic")
    @classmethod
    def validate_required_text(cls, value: str) -> str:
        if not isinstance(value, str) or not value.strip():
            raise ValueError("must be a non-empty string")
        return value.strip()

    @field_validator("minutes")
    @classmethod
    def validate_minutes(cls, value: int) -> int:
        if not isinstance(value, int):
            raise ValueError("minutes must be an integer")
        if value < 15 or value > 180:
            raise ValueError("minutes must be between 15 and 180")
        return value

    @field_validator("difficulty")
    @classmethod
    def validate_difficulty(cls, value: Difficulty | None) -> Difficulty:
        allowed = {"beginner", "intermediate", "advanced"}
        if value is None:
            return "beginner"
        normalized = str(value).strip().lower()
        if normalized not in allowed:
            raise ValueError("difficulty must be beginner, intermediate, or advanced")
        return normalized
