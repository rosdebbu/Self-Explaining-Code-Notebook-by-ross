export interface DataFrame {
  columns: string[];
  rows: string[][]; // All values are strings for schema compatibility
}

export interface ExplanationStep {
  title: string;
  explanation: string;
  data: DataFrame;
  groups?: Array<{ key: string; indices: number[] }>; // Optional grouping info for visualization
}

export interface ExplanationResponse {
  overallExplanation: string;
  steps: ExplanationStep[];
}

export interface CodeExplanationPart {
  segment: string;
  explanation: string;
  purpose: string;
}

export type CodeExplanationResponse = CodeExplanationPart[];

export interface QuizFeedback {
  isCorrect: boolean;
  explanation: string;
}

export interface UseCase {
  title: string;
  description: string;
  icon: string;
}
