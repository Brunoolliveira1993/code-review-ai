import { AnalysisResultSchema } from '../types/schemas';
import type { AnalysisResult } from '../types/types';

export class AIResponseParser {
  parse(text: string): AnalysisResult {
    let data: unknown;

    try {
      data = JSON.parse(text);
    } catch {
      data = this.tryFix(text);
    }

    const normalized = this.normalize(data);
    const parsed = AnalysisResultSchema.safeParse(normalized);

    if (!parsed.success) {
      throw new Error(`Resposta de IA inválida: ${parsed.error.message}`);
    }

    return parsed.data;
  }

  private normalize(data: unknown): AnalysisResult {
    const parsed = data as {
      issues?: Array<Record<string, unknown>>;
      suggestions?: Array<Record<string, unknown>>;
    };

    return {
      issues: Array.isArray(parsed.issues)
        ? parsed.issues.map((issue) => ({
            severity: String(issue.severity ?? 'LOW') as AnalysisResult['issues'][number]['severity'],
            type: String(issue.type ?? 'STYLE') as AnalysisResult['issues'][number]['type'],
            message: String(issue.message ?? 'Sem descrição'),
            file: String(issue.file ?? 'desconhecido'),
            line: typeof issue.line === 'number' ? issue.line : null,
            language: String(issue.language ?? 'unknown')
          }))
        : [],
      suggestions: Array.isArray(parsed.suggestions)
        ? parsed.suggestions.map((suggestion) => ({
            message: String(suggestion.message ?? 'Sem descrição'),
            file: String(suggestion.file ?? 'desconhecido'),
            line: typeof suggestion.line === 'number' ? suggestion.line : null,
            category: String(suggestion.category ?? 'OPTIMIZATION') as AnalysisResult['suggestions'][number]['category']
          }))
        : []
    };
  }

  private tryFix(text: string): unknown {
    const cleaned = text.replace(/```json/g, '').replace(/```/g, '').trim();
    const match = cleaned.match(/\{[\s\S]*\}/);
    if (match) {
      try {
        return JSON.parse(match[0]);
      } catch {
        return { issues: [], suggestions: [] };
      }
    }
    return { issues: [], suggestions: [] };
  }
}
