import { credentialService } from '../security/CredentialService';
import { CodeChange } from '../../domain/models/CodeChange';
import languagePrompts from '../../application/config/LanguagePrompts.json';

type LanguageConfig = {
  id: string;
  name: string;
  analysisPrompt: {
    system: string;
    contextInstructions: string;
    analysisStrategy?: unknown;
    rulesEngine?: unknown;
  };
};

type LanguagePromptsConfig = {
  languages: LanguageConfig[];
  analysisTemplate: {
    instructions: string;
    rules: string[];
    outputFormat: unknown;
    severityGuidelines: unknown;
  };
};

const promptConfig = languagePrompts as LanguagePromptsConfig;

export class OpenRouterService {
  constructor(private readonly endpoint = 'https://openrouter.ai/api/v1/chat/completions', private readonly timeoutMs = 60000) {}

  async analyzeCode(changes: CodeChange[], language = 'javascript'): Promise<string> {
    const sanitizedLanguage = String(language || 'javascript').trim().toLowerCase();
    const { systemPrompt, userPrompt } = this.buildPrompt(changes, sanitizedLanguage);

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), this.timeoutMs);

    try {
      const apiKey = await credentialService.get('OPENROUTER_API_KEY');
      if (!apiKey) {
        throw new Error('Chave OPENROUTER_API_KEY não encontrada');
      }

      const response = await fetch(this.endpoint, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${apiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          model: 'openai/gpt-oss-120b:free',
          temperature: 0.1,
          messages: [
            {
              role: 'system',
              content: systemPrompt
            },
            {
              role: 'user',
              content: userPrompt
            }
          ]
        }),
        signal: controller.signal
      });

      if (!response.ok) {
        throw new Error(`Erro API OpenRouter (${response.status}): ${response.statusText}`);
      }

      const data: any = await response.json();
      return data?.choices?.[0]?.message?.content ?? 'Sem resposta da IA';
    } finally {
      clearTimeout(timeoutId);
    }
  }

  private buildPrompt(changes: CodeChange[], language: string) {
    const langConfig = promptConfig.languages.find((l) => l.id === language) || promptConfig.languages[0];
    const template = promptConfig.analysisTemplate;

    const systemPrompt = `
${template.instructions.replace('{LANGUAGE}', langConfig.name)}

${langConfig.analysisPrompt.system}

${langConfig.analysisPrompt.contextInstructions}

${langConfig.analysisPrompt.analysisStrategy ? JSON.stringify(langConfig.analysisPrompt.analysisStrategy, null, 2) : ''}

${langConfig.analysisPrompt.rulesEngine ? JSON.stringify(langConfig.analysisPrompt.rulesEngine, null, 2) : ''}

REGRAS OBRIGATÓRIAS:
${template.rules.join('\n')}

FORMATO DE RESPOSTA (OBRIGATÓRIO JSON):
${JSON.stringify(template.outputFormat, null, 2)}

DIRETRIZES DE SEVERIDADE:
${JSON.stringify(template.severityGuidelines, null, 2)}

IMPORTANTE:
- Não escreva nada fora do JSON
- Não use markdown
- Não invente dados
- Seja determinístico
`;

    const userPrompt = `
Analise o código abaixo:

${this.sanitizeText(JSON.stringify(changes, null, 2))}
`;

    return { systemPrompt, userPrompt };
  }

  private sanitizeText(text: string): string {
    return text.replace(/[\u0000-\u001F\u007F]/g, '');
  }
}
