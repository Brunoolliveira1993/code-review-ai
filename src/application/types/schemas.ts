import { z } from 'zod';

export const AnalyzeCodeRequestSchema = z.object({
  url: z.string().url(),
  language: z.string().min(1).default('javascript'),
  type: z.string().optional(),
  model: z.string().optional()
});

const ReviewIssueSchema = z.object({
  severity: z.enum(['LOW', 'MEDIUM', 'HIGH']).default('LOW'),
  type: z.enum(['BUG', 'PERFORMANCE', 'SECURITY', 'STYLE', 'ARCHITECTURE']).default('STYLE'),
  message: z.string().min(1),
  file: z.string().min(1),
  line: z.number().int().nonnegative().nullable().default(null),
  language: z.string().min(1).default('unknown')
});

const ReviewSuggestionSchema = z.object({
  message: z.string().min(1),
  file: z.string().min(1),
  line: z.number().int().nonnegative().nullable().default(null),
  category: z.enum(['OPTIMIZATION', 'REFACTORING', 'MODERNIZATION']).default('OPTIMIZATION')
});

export const AnalysisResultSchema = z.object({
  issues: z.array(ReviewIssueSchema).default([]),
  suggestions: z.array(ReviewSuggestionSchema).default([])
});

export type AnalysisResult = z.infer<typeof AnalysisResultSchema>;
