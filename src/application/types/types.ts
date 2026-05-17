export type AnalyzeCodeRequest = {
  url: string;
  language: string;
  type?: string;
  model?: string;
};

export type ReviewIssue = {
  severity: 'LOW' | 'MEDIUM' | 'HIGH';
  type: 'BUG' | 'PERFORMANCE' | 'SECURITY' | 'STYLE' | 'ARCHITECTURE';
  message: string;
  file: string;
  line: number | null;
  language: string;
};

export type ReviewSuggestion = {
  message: string;
  file: string;
  line: number | null;
  category: 'OPTIMIZATION' | 'REFACTORING' | 'MODERNIZATION';
};

export type AnalysisResult = {
  issues: ReviewIssue[];
  suggestions: ReviewSuggestion[];
};
