require('dotenv').config();
const credentialService = require('../security/CredentialService');
const languagePrompts = require('../../application/config/LanguagePrompts.json');

class OpenRouterService {

    async analyzeCode(changes, language = 'javascript') {

        const prompt = this.buildPrompt(changes, language);

        // Implementar timeout de 30 segundos
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 30000);

        try {
            const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${await credentialService.get('OPENROUTER_API_KEY')}`,
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                model: "openai/gpt-oss-120b:free",
                messages: [
                {
                    role: "system",
                    content: "Você é um revisor de código sênior especializado."
                },
                {
                    role: "user",
                    content: prompt
                }
                ]
            }),
            signal: controller.signal
            });

            // Validar status HTTP antes de fazer parse
            if (!response.ok) {
                throw new Error(`Erro API OpenRouter (${response.status}): ${response.statusText}`);
            }

            const data = await response.json();
            return data.choices?.[0]?.message?.content || "Sem resposta da IA";
        } finally {
            clearTimeout(timeoutId);
        }
    }

    buildPrompt(changes, language = 'javascript') {
    // Obter configuração da linguagem
    const langConfig = languagePrompts.languages.find(l => l.id === language) || languagePrompts.languages[0];
    const template = languagePrompts.analysisTemplate;
    
    const systemMessage = langConfig.analysisPrompt.system;
    const contextInstructions = langConfig.analysisPrompt.contextInstructions;
    const documentation = langConfig.analysisPrompt.documentation;
    
    return `
${systemMessage}

${contextInstructions}

Analise as alterações e retorne APENAS JSON válido.

REGRAS:
- Responda em português do Brasil
- NÃO use markdown
- NÃO escreva texto fora do JSON
- Análise focada em ${langConfig.name}

REFERÊNCIAS TÉCNICAS:
${langConfig.sources.map(s => `- ${s}`).join('\n')}

${documentation}

FORMATO OBRIGATÓRIO (JSON):

{
  "issues": [
    {
      "severity": "LOW | MEDIUM | HIGH",
      "type": "BUG | PERFORMANCE | SECURITY | STYLE | ARCHITECTURE",
      "message": "descrição clara e acionável",
      "file": "nome do arquivo",
      "line": número ou null,
      "language": "${language}"
    }
  ],
  "suggestions": [
    {
      "message": "descrição clara",
      "file": "nome do arquivo",
      "line": número ou null,
      "category": "OPTIMIZATION | REFACTORING | MODERNIZATION"
    }
  ]
}

DIRETRIZES DE SEVERIDADE:
- HIGH: Erro crítico, bug, ou vulnerabilidade que afeta produção
- MEDIUM: Melhoria importante em performance, manutenibilidade ou segurança
- LOW: Melhoria leve ou sugestão de estilo

Código a analisar:
${JSON.stringify(changes, null, 2)}
    `;
    }
}

module.exports = OpenRouterService;