import type { StudyPlanRequest, StudyPlanResponse } from './types';

// MOCK DATA — used only when VITE_USE_MOCK is not "false". Shape matches API_CONTRACT.md.
export function buildMockResponse(req: StudyPlanRequest): StudyPlanResponse {
  const total = req.minutes;
  const review = Math.round(total * 0.25);
  const recall = Math.round(total * 0.3);
  const practice = total - review - recall;

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
        tasks: ['Make a one-page summary sheet', 'Explain it out loud as if teaching a friend'],
      },
      {
        title: 'Check your recall',
        minutes: recall,
        focus: 'Test understanding with a quick quiz.',
        tasks: ['Answer the practice questions', 'Review the explanation for each answer'],
      },
    ],
    quiz: [
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
    ],
    generatedAt: new Date().toISOString(),
  };
}
