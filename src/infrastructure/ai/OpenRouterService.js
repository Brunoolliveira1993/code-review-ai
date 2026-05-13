require('dotenv').config();
const credentialService = require('../security/CredentialService');
const languagePrompts = require('../../application/config/LanguagePrompts.json');

class OpenRouterService {

    async analyzeCode(changes, language = 'javascript') {

        const { systemPrompt, userPrompt } = this.buildPrompt(changes, language);

        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 60000);

        console.log("prompts:", { systemPrompt, userPrompt });
        try {
            const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
                method: "POST",
                headers: {
                    "Authorization": `Bearer ${await credentialService.get('OPENROUTER_API_KEY')}`,
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    model: "openai/gpt-oss-120b:free",
                    temperature: 0.1, 
                    messages: [
                        {
                            role: "system",
                            content: systemPrompt
                        },
                        {
                            role: "user",
                            content: userPrompt
                        }
                    ]
                }),
                signal: controller.signal
            });

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

        const langConfig = languagePrompts.languages.find(l => l.id === language)
            || languagePrompts.languages[0];

        const template = languagePrompts.analysisTemplate;

        // 🔥 SYSTEM = inteligência
        const systemPrompt = `
${template.instructions.replace('{LANGUAGE}', langConfig.name)}

${langConfig.analysisPrompt.system}

${langConfig.analysisPrompt.contextInstructions}

${langConfig.analysisPrompt.analysisStrategy 
    ? JSON.stringify(langConfig.analysisPrompt.analysisStrategy, null, 2) 
    : ''}

${langConfig.analysisPrompt.rulesEngine 
    ? JSON.stringify(langConfig.analysisPrompt.rulesEngine, null, 2) 
    : ''}

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

        // 🔥 USER = apenas código
        const userPrompt = `
Analise o código abaixo:

${JSON.stringify(changes, null, 2)}
`;

        return { systemPrompt, userPrompt };
    }
}

module.exports = OpenRouterService;