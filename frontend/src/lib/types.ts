// Types mirror API_CONTRACT.md exactly. Do not rename fields without team approval.

export type Difficulty = 'beginner' | 'intermediate' | 'advanced';

export interface StudyPlanRequest {
  subjectArea: string;
  topic: string;
  minutes: number;
  difficulty?: Difficulty;
}

export interface StudyBlock {
  title: string;
  minutes: number;
  focus: string;
  tasks: string[];
}

export interface QuizQuestion {
  question: string;
  options: string[];
  answerIndex: number;
  explanation: string;
}

export interface StudyPlanResponse {
  planId: string;
  subjectArea: string;
  topic: string;
  minutes: number;
  studyPlan: StudyBlock[];
  quiz: QuizQuestion[];
  generatedAt: string;
}

export type ErrorCode =
  | 'INVALID_REQUEST'
  | 'UNSUPPORTED_DIFFICULTY'
  | 'INVALID_TIME_RANGE'
  | 'AI_GENERATION_FAILED'
  | 'INTERNAL_ERROR';

export interface ApiErrorBody {
  error: {
    code: ErrorCode | string;
    message: string;
    field?: string;
  };
}
