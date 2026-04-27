const GithubProvider = require('./GithubProvider');
const GitlabProvider = require('./GitlabProvider');

class GitProviderFactory {
    static create(url) {
    try {
        // Validar e parsejar URL corretamente
        const urlObj = new URL(url);
        const hostname = urlObj.hostname || '';
        
        if (hostname.endsWith('github.com')) {
            return new GithubProvider();
        }
        
        if (hostname.endsWith('gitlab.com')) {
            return new GitlabProvider();
        }
        
        throw new Error("Provedor Git não suportado");
    } catch (err) {
        if (err.message === "Provedor Git não suportado") {
            throw err;
        }
        throw new Error(`URL inválida: ${err.message}`);
    }
    }
}

module.exports = GitProviderFactory;