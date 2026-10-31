# HealthLens API Contract

**Version:** 1.1 (adds `POST /identify`; `/analyze` unchanged)  
**Last Updated:** 2026-10-31  
**Status:** APPROVED - Do not change without team coordination

---

## Base URL
```
http://localhost:3000/api
```

---

## Endpoint: Analyze Medical Document

**Route:** `POST /analyze`

**Purpose:** Upload medical document image or text, receive simplified explanation with key actions and medical term definitions.

### Request Format

**Content-Type:** `multipart/form-data` (for image upload) OR `application/json` (for text input)

#### Option 1: Image Upload
```
POST /api/analyze
Content-Type: multipart/form-data

Field: "image" (file, required) - JPEG/PNG medical document photo
Field: "inputType" (string, optional) - set to "image" (default if image present)
```

#### Option 2: Text or Voice Transcription
```json
POST /api/analyze
Content-Type: application/json

{
  "text": "Patient should take amoxicillin 500mg PO BID...",
  "inputType": "text"
}
```

**Design note:** Supporting both image and text means frontend can handle photo uploads AND voice-to-text fallback (voice → transcription → send as text). Backend doesn't need to handle voice processing.

---

### Success Response (200 OK)

```json
{
  "success": true,
  "data": {
    "originalText": "Patient should take amoxicillin 500mg PO BID with food. Monitor for fever >101°F. Return to ED if SOB worsens. Follow up with PCP in 7-10 days.",
    
    "simplifiedText": "Take your antibiotic pill (amoxicillin) twice a day with food. Watch your temperature - if it goes above 101°F, that's important to note. Go back to the emergency room if your breathing gets worse. Schedule an appointment with your regular doctor within 7 to 10 days.",
    
    "keyActions": [
      {
        "action": "Take amoxicillin 500mg twice daily with food",
        "priority": "critical",
        "icon": "medication"
      },
      {
        "action": "Watch for fever above 101°F",
        "priority": "important",
        "icon": "thermometer"
      },
      {
        "action": "Return to emergency room if breathing worsens",
        "priority": "critical",
        "icon": "emergency"
      },
      {
        "action": "Schedule follow-up with your doctor in 7-10 days",
        "priority": "normal",
        "icon": "calendar"
      }
    ],
    
    "medicalTerms": [
      {
        "term": "amoxicillin",
        "definition": "An antibiotic medicine that fights bacterial infections",
        "category": "medication"
      },
      {
        "term": "PO BID",
        "definition": "By mouth, two times per day",
        "category": "instruction"
      },
      {
        "term": "SOB",
        "definition": "Shortness of breath - difficulty breathing",
        "category": "symptom"
      },
      {
        "term": "PCP",
        "definition": "Primary Care Provider - your regular doctor",
        "category": "provider"
      }
    ]
  }
}
```

**Field definitions:**
- `originalText`: Raw OCR output or submitted text (shows user what was read)
- `simplifiedText`: Plain language version for main display
- `keyActions[]`: Actionable items with priority levels
  - `priority`: "critical" (red), "important" (yellow), or "normal" (blue) - frontend should color-code for accessibility
  - `icon`: Suggested icon name (frontend chooses actual icon from its library)
- `medicalTerms[]`: Terms user can tap for definitions, grouped by category

---

### Error Responses

All errors follow this structure:
```json
{
  "success": false,
  "error": {
    "code": "ERROR_CODE",
    "message": "User-friendly message that frontend can display directly"
  }
}
```

#### 400 Bad Request - Missing Input
```json
{
  "success": false,
  "error": {
    "code": "MISSING_INPUT",
    "message": "Please provide either an image file or text to analyze"
  }
}
```

#### 400 Bad Request - Invalid Image
```json
{
  "success": false,
  "error": {
    "code": "INVALID_IMAGE",
    "message": "Unable to read image. Please ensure it's a clear JPEG or PNG photo"
  }
}
```

#### 500 Internal Server Error - OCR Failure
```json
{
  "success": false,
  "error": {
    "code": "OCR_FAILED",
    "message": "Could not extract text from image. Try retaking photo with better lighting"
  }
}
```

#### 500 Internal Server Error - AI Processing Failure
```json
{
  "success": false,
  "error": {
    "code": "AI_PROCESSING_FAILED",
    "message": "Unable to simplify document at this time. Please try again"
  }
}
```

#### 413 Payload Too Large
```json
{
  "success": false,
  "error": {
    "code": "FILE_TOO_LARGE",
    "message": "Image must be under 10MB"
  }
}
```

---

## Endpoint: Identify Pill (v1.1)

**Route:** `POST /identify`

**Purpose:** Upload a photo of a loose pill or a prescription bottle, receive what the medicine is in plain language.
Uses a vision model (Claude on Amazon Bedrock, Converse API). Same Bedrock key as `/analyze` by default.

### Request Format
```
POST /api/identify
Content-Type: multipart/form-data

Field: "image" (file, required) - JPEG/PNG photo of a pill or medicine bottle, under 10MB
```

### Success Response (200 OK)
```json
{
  "success": true,
  "data": {
    "identified": true,
    "kind": "bottle",
    "medicationName": "Metformin HCl",
    "strength": "500 mg",
    "purpose": "Metformin is usually used to help control blood sugar in people with type 2 diabetes.",
    "howToTake": "Take 1 tablet by mouth 2 times a day with meals.",
    "appearance": "A pharmacy label with black text on a white background.",
    "imprint": "",
    "warnings": ["May cause stomach upset.", "Avoid alcohol."],
    "confidence": "high",
    "summary": "This is metformin, 500 mg. It helps control blood sugar. Take 1 tablet 2 times a day with meals."
  }
}
```

**Field definitions:** every field is always present; unknown strings are `""`.
- `identified`: `false` when the medicine could not be named. Then `medicationName`, `strength`, `purpose`, `howToTake` are `""` and `warnings` is `[]`.
- `kind`: `"bottle"` (label visible), `"pill"` (loose pill), or `"unknown"` (not medicine / unclear).
- `confidence`: `"high"` | `"medium"` | `"low"`. Server policy: a loose pill is never `"high"`; not identified is always `"low"`. Frontend should show medium/low as "possible match" / "not sure".
- `howToTake`: only from directions printed on a visible label, never inferred.
- `imprint`: letters/numbers stamped on the pill.
- `summary`: always non-empty; written to be read aloud.

### Errors
Same error body format and the same codes/messages as `/analyze`: `MISSING_INPUT` (400, no image),
`INVALID_IMAGE` (400), `FILE_TOO_LARGE` (413), `AI_PROCESSING_FAILED` (500). The frontend may show
pill-specific wording for `MISSING_INPUT` and `AI_PROCESSING_FAILED`.

### Demo mode
With `MOCK_AI=1` or no Bedrock key, returns a fixed lisinopril sample whose `summary` starts with `DEMO MODE:`.

---

## Health Check Endpoint (Optional)

**Route:** `GET /health`

**Purpose:** Verify backend is running and AI/OCR dependencies are configured.

**Response (200 OK):**
```json
{
  "status": "ok",
  "services": {
    "ocr": "ready",
    "ai": "ready"
  }
}
```

---

## Mock Response for Frontend Development

Frontend can use this mock until backend is ready:

```json
{
  "success": true,
  "data": {
    "originalText": "Take medication as prescribed. Follow up in 2 weeks.",
    "simplifiedText": "Take your medicine exactly as your doctor told you. Come back for another appointment in 2 weeks.",
    "keyActions": [
      {
        "action": "Take your prescribed medication",
        "priority": "critical",
        "icon": "medication"
      },
      {
        "action": "Schedule follow-up appointment in 2 weeks",
        "priority": "normal",
        "icon": "calendar"
      }
    ],
    "medicalTerms": [
      {
        "term": "prescribed",
        "definition": "Ordered by your doctor",
        "category": "instruction"
      }
    ]
  }
}
```

---

## Contract Change Protocol

⚠️ **DO NOT change this contract without team coordination**

If you need to change field names, add fields, or modify structure:
1. Propose change to integration owner
2. Get approval from both frontend and backend owners
3. Update this document with new version number
4. Announce change in team chat before merging

Silently changing the contract WILL break parallel development.
