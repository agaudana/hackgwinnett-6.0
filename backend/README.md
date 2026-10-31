# Study Plan Backend

This backend powers the MVP study-plan flow.

## Endpoint

POST /api/study-plan

### Example request

```json
{
  "subjectArea": "Biology",
  "topic": "Cell respiration",
  "minutes": 45,
  "difficulty": "beginner"
}
```

### Example response

```json
{
  "planId": "sp_12345",
  "subjectArea": "Biology",
  "topic": "Cell respiration",
  "minutes": 45,
  "studyPlan": [
    {
      "title": "Build the foundation",
      "minutes": 18,
      "focus": "Understand the core ideas behind Cell respiration in Biology before trying harder tasks.",
      "tasks": [
        "Read a short overview of the key concept",
        "Write 3 notes in your own words"
      ]
    }
  ],
  "quiz": [
    {
      "question": "What is the best first move when studying Cell respiration in Biology?",
      "options": [
        "Understand the core idea before memorizing details",
        "Skip straight to advanced examples",
        "Only focus on one random fact",
        "Ignore the topic summary entirely"
      ],
      "answerIndex": 0,
      "explanation": "Starting with the big idea gives you a mental map so later details make sense."
    }
  ],
  "generatedAt": "2026-10-31T03:01:41Z"
}
```

## Run locally

```bash
cd backend
python -m pip install -r requirements.txt
python -m uvicorn app.main:app --reload --host 127.0.0.1 --port 8001
```

Alternatively:

```bash
cd backend
python -m app
```

## Tests

```bash
cd backend
python -m pytest -q
```

## Notes

- This is the minimal MVP endpoint required by the project contract.
- Validation is strict and matches the documented error shapes.
- The generator is deterministic and safe for demo use when external AI access is unavailable.
