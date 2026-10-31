# API Contract

This document defines the minimum backend contract for the study-planning MVP.

## Base URL

`/api`

## Endpoint

### POST `/api/study-plan`

Generate a study plan and a short practice quiz based on a subject area, topic, and total study time.

#### Request body

```json
{
  "subjectArea": "Biology",
  "topic": "Cell respiration",
  "minutes": 45,
  "difficulty": "beginner"
}
```

#### Request fields

| Field | Type | Required | Description |
| --- | --- | --- | --- |
| `subjectArea` | string | Yes | The broad subject area being studied, such as Biology or Algebra. |
| `topic` | string | Yes | The specific topic to focus on. |
| `minutes` | integer | Yes | Total study time in minutes. Must be between 15 and 180. |
| `difficulty` | string | No | Optional learner level. Allowed values: `beginner`, `intermediate`, `advanced`. Default: `beginner`. |

#### Validation rules

- `subjectArea` must be a non-empty string.
- `topic` must be a non-empty string.
- `minutes` must be an integer between 15 and 180.
- `difficulty` must be one of `beginner`, `intermediate`, or `advanced` if provided.

#### Success response

Status: `200 OK`

```json
{
  "planId": "sp_12345",
  "subjectArea": "Biology",
  "topic": "Cell respiration",
  "minutes": 45,
  "studyPlan": [
    {
      "title": "Review the big idea",
      "minutes": 10,
      "focus": "Understand the purpose of cellular respiration and where it happens.",
      "tasks": [
        "Read a short overview",
        "Write 3 key facts in your own words"
      ]
    },
    {
      "title": "Practice the process",
      "minutes": 20,
      "focus": "Map glycolysis, Krebs cycle, and electron transport chain.",
      "tasks": [
        "Label the stages",
        "Match inputs and outputs"
      ]
    },
    {
      "title": "Check your recall",
      "minutes": 15,
      "focus": "Test understanding with a quick quiz.",
      "tasks": [
        "Answer 3 multiple-choice questions",
        "Review the explanation for each answer"
      ]
    }
  ],
  "quiz": [
    {
      "question": "What is the main purpose of cellular respiration?",
      "options": [
        "To make proteins",
        "To release energy from glucose",
        "To store water in cells",
        "To build DNA"
      ],
      "answerIndex": 1,
      "explanation": "Cellular respiration breaks down glucose to release usable energy in the form of ATP."
    }
  ],
  "generatedAt": "2026-10-30T15:22:00Z"
}
```

#### Response fields

| Field | Type | Description |
| --- | --- | --- |
| `planId` | string | Unique identifier for the generated plan. |
| `subjectArea` | string | The submitted subject area. |
| `topic` | string | The submitted topic. |
| `minutes` | integer | Final minutes requested. |
| `studyPlan` | array | Ordered list of study blocks. |
| `studyPlan[].title` | string | Block heading. |
| `studyPlan[].minutes` | integer | Time allocated to the block. |
| `studyPlan[].focus` | string | Short explanation of what the student should learn. |
| `studyPlan[].tasks` | array | Actionable tasks for the study block. |
| `quiz` | array | Short multiple-choice quiz. |
| `quiz[].question` | string | Question prompt. |
| `quiz[].options` | array | Multiple choice answers. |
| `quiz[].answerIndex` | integer | Index of the correct option. |
| `quiz[].explanation` | string | Explanation for the correct answer. |
| `generatedAt` | string | ISO-8601 timestamp for when the plan was generated. |

#### Error response

Status: `400 Bad Request`, `422 Unprocessable Entity`, or `500 Internal Server Error`

```json
{
  "error": {
    "code": "INVALID_REQUEST",
    "message": "Topic is required.",
    "field": "topic"
  }
}
```

#### Error object fields

| Field | Type | Description |
| --- | --- | --- |
| `code` | string | Machine-friendly error code. |
| `message` | string | Human-readable summary of the issue. |
| `field` | string | Optional field name related to the error. |

#### Common error codes

- `INVALID_REQUEST`: required or malformed request fields
- `UNSUPPORTED_DIFFICULTY`: invalid difficulty value
- `INVALID_TIME_RANGE`: minutes outside allowed range
- `AI_GENERATION_FAILED`: model or generation service failed
- `INTERNAL_ERROR`: unexpected backend failure

## Notes

- The frontend may mock this response until the backend is implemented.
- The backend must test this endpoint independently of the UI.
- This contract is intentionally minimal to match the MVP goal and the available sprint timeline.
