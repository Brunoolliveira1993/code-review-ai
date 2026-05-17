import { AnalyzeCodeRequestSchema } from '../types/schemas';
import { ReviewResult } from '../../domain/models/ReviewResult';
import { GitProviderFactory } from '../../infrastructure/git/GitProviderFactory';
import { DiffParser } from '../services/DiffParser';
import { OpenRouterService } from '../../infrastructure/ai/OpenRouterService';
import { AIResponseParser } from '../services/AIResponseParser';
import { DiffChunker } from '../services/DiffChunker';
import { PromisePool } from '../utils/PromisePool';
import type { AnalysisResult } from '../types/types';

export class AnalyzeCodeUseCase {
  constructor(
    private readonly gitProviderFactory = GitProviderFactory,
    private readonly aiService = new OpenRouterService(),
    private readonly aiParser = new AIResponseParser(),
    private readonly promisePool = new PromisePool()
  ) {}

  async execute(request: unknown, onProgress: (status: string) => void): Promise<ReviewResult> {
    const parsedRequest = AnalyzeCodeRequestSchema.safeParse(request);
    if (!parsedRequest.success) {
      throw new Error(`Requisição inválida: ${parsedRequest.error.message}`);
    }

    const { url, language } = parsedRequest.data;

    onProgress('🔍 Buscando diff...');

    const provider = this.gitProviderFactory.create(url);
    const diff = await provider.getDiff(url);

    onProgress('⚙️ Processando alterações...');

    const parser = new DiffParser();
    const parsed = parser.parse(diff);

    const chunker = new DiffChunker();
    const chunks = chunker.chunkByFile(parsed);

    onProgress(`🤖 Analisando ${chunks.length} arquivos em ${language}...`);

    const tasks = chunks.map((chunk, index) => {
      return async (): Promise<AnalysisResult> => {
        onProgress(`🤖 Analisando arquivo ${index + 1}/${chunks.length}...`);
        const raw = await this.aiService.analyzeCode(chunk, language);
        return this.aiParser.parse(raw);
      };
    });

    const results = await this.promisePool.execute(tasks, 3);
    const allIssues = results.flatMap((result) => ('issues' in result ? result.issues : []));
    const allSuggestions = results.flatMap((result) => ('suggestions' in result ? result.suggestions : []));

    const failedAnalyses = results.filter((result): result is { error: string } => 'error' in result);
    if (failedAnalyses.length > 0) {
      onProgress(`⚠️ ${failedAnalyses.length} arquivo(s) falharam na análise, mas continuando com resultados parciais...`);
    }

    onProgress('✅ Finalizado');

    return new ReviewResult({
      issues: allIssues,
      suggestions: allSuggestions
    });
  }
}
