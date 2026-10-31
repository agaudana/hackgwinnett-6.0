import type { Difficulty, QuizQuestion, StudyPlanRequest, StudyPlanResponse } from './types';

// MOCK DATA — used only when NEXT_PUBLIC_USE_MOCK is not "false". Shape matches API_CONTRACT.md.

const PRACTICE_TASKS: Record<Difficulty, string[]> = {
  beginner: ['Make a one-page summary sheet', 'Explain it out loud as if teaching a friend'],
  intermediate: ['Sketch a diagram connecting the key ideas', 'Work 3 practice problems without notes'],
  advanced: ['Solve a challenge problem and check each step', 'Write a short explanation of a common misconception'],
};

const CELL_RESPIRATION_QUIZ: QuizQuestion[] = [
  {
    question: 'What is the main purpose of cellular respiration?',
    options: ['To make proteins', 'To release energy from glucose', 'To store water in cells', 'To build DNA'],
    answerIndex: 1,
    explanation: 'Cellular respiration breaks down glucose to release usable energy in the form of ATP.',
  },
  {
    question: 'Where does most ATP production happen in the cell?',
    options: ['Nucleus', 'Ribosome', 'Mitochondria', 'Cell wall'],
    answerIndex: 2,
    explanation: 'The electron transport chain in the mitochondria produces most of the ATP.',
  },
  {
    question: 'Which gas is released as a waste product of cellular respiration?',
    options: ['Oxygen', 'Carbon dioxide', 'Nitrogen', 'Hydrogen'],
    answerIndex: 1,
    explanation: 'Carbon dioxide is released when glucose is broken down in the Krebs cycle.',
  },
];

// Topic-neutral questions so a demo with any topic still reads naturally.
function genericQuiz(topic: string): QuizQuestion[] {
  return [
    {
      question: `You have one night left before your ${topic} test. What is the most effective way to review?`,
      options: [
        'Re-read your notes several times',
        'Quiz yourself and check what you missed',
        'Highlight the textbook chapter',
        'Watch a long video at 2x speed',
      ],
      answerIndex: 1,
      explanation: 'Retrieval practice — pulling answers from memory — builds stronger recall than re-reading.',
    },
    {
      question: `What is a good sign that you really understand ${topic}?`,
      options: [
        'The notes look familiar',
        'You can explain it simply in your own words',
        'You copied the definitions word-for-word',
        'You studied it for a long time',
      ],
      answerIndex: 1,
      explanation: 'If you can teach it simply without notes, you understand it — familiarity alone can be misleading.',
    },
    {
      question: 'You got a practice question wrong. What should you do next?',
      options: [
        'Skip it and move on',
        'Memorize the correct letter',
        'Read the explanation and retry a similar question',
        'Start the whole topic over',
      ],
      answerIndex: 2,
      explanation: 'Understanding why the answer is right, then retrying, turns a mistake into a lasting fix.',
    },
  ];
}

export function buildMockResponse(req: StudyPlanRequest): StudyPlanResponse {
  const total = req.minutes;
  const review = Math.round(total * 0.25);
  const recall = Math.round(total * 0.3);
  const practice = total - review - recall;
  const difficulty = req.difficulty ?? 'beginner';
  const isCellRespiration = /respiration/i.test(req.topic);

  return {
    planId: `sp_mock_${Date.now()}`,
    subjectArea: req.subjectArea,
    topic: req.topic,
    minutes: total,
    studyPlan: [
      {
        title: 'Review the big idea',
        minutes: review,
        focus: `Understand what ${req.topic} is and why it matters in ${req.subjectArea}.`,
        tasks: ['Read a short overview', 'Write 3 key facts in your own words'],
      },
      {
        title: 'Practice the process',
        minutes: practice,
        focus: `Work through the core steps and vocabulary of ${req.topic}.`,
        tasks: PRACTICE_TASKS[difficulty],
      },
      {
        title: 'Check your recall',
        minutes: recall,
        focus: 'Test understanding with a quick quiz.',
        tasks: ['Answer the practice questions', 'Review the explanation for each answer'],
      },
    ],
    quiz: isCellRespiration ? CELL_RESPIRATION_QUIZ : genericQuiz(req.topic),
    generatedAt: new Date().toISOString(),
  };
}
