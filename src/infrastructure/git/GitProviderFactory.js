const GithubProvider = require('./GithubProvider');
const GitlabProvider = require('./GitlabProvider');

class GitProviderFactory {
    static create(url) {
    if (url.includes("github.com")) {
        return new GithubProvider();
    }

    if (url.includes("gitlab.com")) {
        return new GitlabProvider();
    }

    throw new Error("Provedor Git não suportado");
    }
}

module.exports = GitProviderFactory;