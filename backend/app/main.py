from __future__ import annotations

from fastapi import FastAPI, Request
from fastapi.exceptions import RequestValidationError
from fastapi.responses import JSONResponse

from app.schemas import StudyPlanRequest
from app.services.study_plan_service import generate_study_plan

app = FastAPI(title="Study Plan API", version="0.1.0")


@app.exception_handler(RequestValidationError)
async def validation_exception_handler(request: Request, exc: RequestValidationError):
    errors = exc.errors()
    if not errors:
        return JSONResponse(
            status_code=400,
            content={"error": {"code": "INVALID_REQUEST", "message": "Invalid request.", "field": None}},
        )

    first_error = errors[0]
    loc = first_error.get("loc", [])
    field = loc[-1] if loc else None
    msg = first_error.get("msg", "Invalid request.")

    if field == "difficulty":
        code = "UNSUPPORTED_DIFFICULTY"
        message = "Difficulty must be one of beginner, intermediate, or advanced."
    elif field == "minutes":
        code = "INVALID_TIME_RANGE"
        message = "Minutes must be between 15 and 180."
    elif field in {"subjectArea", "topic"}:
        code = "INVALID_REQUEST"
        message = f"{field.replace('subjectArea', 'Subject area').replace('topic', 'Topic')} is required."
    else:
        code = "INVALID_REQUEST"
        message = msg if msg else "Invalid request."

    return JSONResponse(
        status_code=400,
        content={"error": {"code": code, "message": message, "field": field}},
    )


@app.post("/api/study-plan")
def create_study_plan(payload: StudyPlanRequest):
    return generate_study_plan(payload)
