# Deployment setup

This app should be deployed as two services:

1. Backend: FastAPI + Gemini access, private-only environment.
2. Frontend: Next.js app, no Gemini key or secret in browser code.

## Recommended hosting

- Frontend: Vercel
- Backend: Render

## Why this is the correct pattern

- Gemini API keys must stay on the server only.
- The browser should call `/api/...` and never receive the key.
- The Next.js rewrite layer forwards browser calls to the backend service URL.

## Required environment variables

### Backend (server-side only)

- `GEMINI_API_KEY=...`
- optional: `PORT=10000`

### Frontend

- `NEXT_PUBLIC_USE_MOCK=false`
- `API_TARGET=https://your-backend-service-url.example.com`

## Vercel frontend setup

1. Import the repo into Vercel.
2. Set the root directory to `frontend`.
3. Add environment variables:
   - `NEXT_PUBLIC_USE_MOCK=false`
   - `API_TARGET=https://your-backend-service-url.example.com`
4. Deploy.

## Render backend setup

1. Create a new Web Service from the repo.
2. Set the root directory to the repo root or configure the backend start command manually.
3. Add environment variable:
   - `GEMINI_API_KEY=...`
4. Start command example:
   ```bash
   cd backend && python -m uvicorn app.main:app --host 0.0.0.0 --port 10000
   ```
5. Set the backend service URL as the frontend `API_TARGET` value.

## Important

Do not commit real env files. Keep `.env` and `.env.local` local-only.
