const GitProvider = require('../../application/ports/GitProvider');

class GithubProvider extends GitProvider {
    async getDiff(url) {
    // Exemplo:
    // https://github.com/user/repo/pull/123

        const diffUrl = url + ".diff";

        const response = await fetch(diffUrl);
        const diff = await response.text();

        return diff;
    }
}

module.exports = GithubProvider;