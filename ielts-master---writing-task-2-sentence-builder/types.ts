
export interface TaskTopic {
  id: string;
  category: string;
  question: string;
}

export interface PracticeExercise {
  topic: TaskTopic;
  fullParagraph: string;
  slashVersion: string;
}

export interface EvaluationResult {
  accuracy: number;
  grammarScore: number;
  vocabularyScore: number;
  originalText: string;
  userText: string;
  feedback: string;
  corrections: string;
}

export enum AppState {
  DASHBOARD = 'DASHBOARD',
  PRACTICE = 'PRACTICE',
  RESULT = 'RESULT'
}
