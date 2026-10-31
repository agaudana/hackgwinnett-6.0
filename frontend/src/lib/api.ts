import { buildMockResponse } from './mock';
import type { ApiErrorBody, StudyPlanRequest, StudyPlanResponse } from './types';

// Mock is OFF by default. Set NEXT_PUBLIC_USE_MOCK=true only when you explicitly want sample data.
export const USE_MOCK = process.env.NEXT_PUBLIC_USE_MOCK === 'true';

export class ApiError extends Error {
  code: string;
  field?: string;
  constructor(code: string, message: string, field?: string) {
    super(message);
    this.code = code;
    this.field = field;
  }
}

export async function createStudyPlan(req: StudyPlanRequest): Promise<StudyPlanResponse> {
  if (USE_MOCK) {
    await new Promise((r) => setTimeout(r, 3500)); // simulate model latency so the loading state is visible
    return buildMockResponse(req);
  }

  let res: Response;
  try {
    res = await fetch('/api/study-plan', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(req),
    });
  } catch {
    throw new ApiError('NETWORK_ERROR', "Couldn't reach the server. Check that the backend is running and try again.");
  }

  const body = await res.json().catch(() => null);
  if (!res.ok) {
    const err = (body as ApiErrorBody | null)?.error;
    throw new ApiError(err?.code ?? 'INTERNAL_ERROR', err?.message ?? 'Something went wrong. Please try again.', err?.field);
  }
  return body as StudyPlanResponse;
}
