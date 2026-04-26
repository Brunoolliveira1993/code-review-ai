require('dotenv').config();
const credentialService = require('../security/CredentialService');

class OpenRouterService {

    async analyzeCode(changes) {

        const prompt = this.buildPrompt(changes);

        const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
        method: "POST",
        headers: {
            "Authorization": `Bearer ${await credentialService.get('OPENROUTER_API_KEY')}`,
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            model: "openai/gpt-oss-120b:free", // pode trocar depois
            messages: [
            {
                role: "system",
                content: "Você é um revisor de código senior."
            },
            {
                role: "user",
                content: prompt
            }
            ]
        })
        });

        const data = await response.json();

        return data.choices?.[0]?.message?.content || "Sem resposta da IA";
    }

    buildPrompt(changes) {
    return `
    Você é um revisor de código sênior.

    Analise as alterações e retorne APENAS JSON válido.

    REGRAS:
    - Responda em português do Brasil
    - NÃO use markdown
    - NÃO escreva texto fora do JSON

    Formato obrigatório:

    {
    "issues": [
        {
        "severity": "LOW | MEDIUM | HIGH",
        "type": "BUG | PERFORMANCE | SECURITY | STYLE",
        "message": "descrição clara",
        "file": "nome do arquivo",
        "line": número ou null
        }
    ],
    "suggestions": [
        {
        "message": "descrição clara",
        "file": "nome do arquivo",
        "line": número ou null
        }
    ]
    }

    REGRAS IMPORTANTES:
    - severity HIGH = erro crítico ou bug
    - MEDIUM = melhoria importante
    - LOW = melhoria leve
    - type:
    - BUG → erro funcional
    - PERFORMANCE → performance
    - SECURITY → vulnerabilidade
    - STYLE → código/organização

    Código:
    ${JSON.stringify(changes, null, 2)}
    `;
    }
}

module.exports = OpenRouterService;