class AIResponseParser {

    parse(text) {
        let data;

        try {
        data = JSON.parse(text);
        } catch {
        data = this.tryFix(text);
        }

        return this.normalize(data);
    }

    normalize(data) {
        return {
        issues: (data.issues || []).map(i => ({
            severity: i.severity || "LOW",
            type: i.type || "STYLE",
            message: i.message || "Sem descrição",
            file: i.file || "desconhecido",
            line: i.line ?? null
        })),
        suggestions: (data.suggestions || []).map(s => ({
            message: s.message || "Sem descrição",
            file: s.file || "desconhecido",
            line: s.line ?? null
        }))
        };
    }

    tryFix(text) {
        const cleaned = text
        .replace(/```json/g, '')
        .replace(/```/g, '')
        .trim();

        const match = cleaned.match(/\{[\s\S]*\}/);

        if (match) {
        return JSON.parse(match[0]);
        }

        return { issues: [], suggestions: [] };
    }
}

module.exports = AIResponseParser;