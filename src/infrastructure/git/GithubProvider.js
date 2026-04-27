const GitProvider = require('../../application/ports/GitProvider');
const credentialService = require('../security/CredentialService');

class GithubProvider extends GitProvider {
    async getDiff(url) {
        const token = await credentialService.get('GITHUB_TOKEN');

        let apiUrl;

        // PR
        let prMatch = url.match(/github\.com\/([^\/]+)\/([^\/]+)\/pull\/(\d+)/);

        // Commit
        let commitMatch = url.match(/github\.com\/([^\/]+)\/([^\/]+)\/commit\/([a-f0-9]+)/);

        if (prMatch) {
            const [, owner, repo, prNumber] = prMatch;
            apiUrl = `https://api.github.com/repos/${owner}/${repo}/pulls/${prNumber}`;
        } else if (commitMatch) {
            const [, owner, repo, sha] = commitMatch;
            apiUrl = `https://api.github.com/repos/${owner}/${repo}/commits/${sha}`;
        } else {
            throw new Error('URL inválida do GitHub');
        }

        const headers = {
            'Accept': 'application/vnd.github.v3.diff'
        };

        if (token) {
            headers['Authorization'] = `Bearer ${token}`;
        }

        const response = await fetch(apiUrl, { headers });

        console.log(`GitHub API response status: ${response.status} for URL: ${apiUrl}`);

        if (!response.ok) {
            const body = await response.text();
            throw new Error(`Erro ao obter diff (${response.status}): ${body}`);
        }

        return await response.text();
    }
}

module.exports = GithubProvider;