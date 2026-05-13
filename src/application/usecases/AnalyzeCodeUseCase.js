const credentialService = require('../../infrastructure/security/CredentialService');
const ReviewResult = require('../../domain/models/ReviewResult');
const GitProviderFactory = require('../../infrastructure/git/GitProviderFactory');
const DiffParser = require('../services/DiffParser');
const OpenRouterService = require('../../infrastructure/ai/OpenRouterService');
const AIResponseParser = require('../services/AIResponseParser');
const DiffChunker = require('../services/DiffChunker');
const PromisePool = require('../utils/PromisePool');


class AnalyzeCodeUseCase {
    async execute(request, onProgress) {

        onProgress("🔍 Buscando diff...");

        const provider = GitProviderFactory.create(request.url);
        const diff = await provider.getDiff(request.url);

        onProgress("⚙️ Processando alterações...");

        const parser = new DiffParser();
        const parsed = parser.parse(diff);

        const chunker = new DiffChunker();
        const chunks = chunker.chunkByFile(parsed);

        const language = request.language || 'javascript';
        onProgress(`🤖 Analisando ${chunks.length} arquivos em ${language}...`);

        const aiService = new OpenRouterService();
        const aiParser = new AIResponseParser();
        const pool = new PromisePool();
        
        const tasks = chunks.map((chunk, index) => {

            return async () => {

                onProgress(`🤖 Analisando arquivo ${index + 1}/${chunks.length}...`);

                const raw = await aiService.analyzeCode(chunk, language);
                return aiParser.parse(raw);
            };
        });

        const results = await pool.execute(tasks, 3); 
        const allIssues = results.flatMap(r => r?.issues || []);
        const allSuggestions = results.flatMap(r => r?.suggestions || []);

        // Verificar se houve análises que falharam
        const failedAnalyses = results.filter(r => r?.error);
        if (failedAnalyses.length > 0) {
            onProgress(`⚠️ ${failedAnalyses.length} arquivo(s) falharam na análise, mas continuando com resultados parciais...`);
        }

        onProgress("✅ Finalizado");

        return new ReviewResult({
            issues: allIssues,
            suggestions: allSuggestions
            });
    }
}

module.exports = AnalyzeCodeUseCase;