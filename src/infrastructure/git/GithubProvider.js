const GitProvider = require('../../application/ports/GitProvider');
const credentialService = require('../security/CredentialService');

class GithubProvider extends GitProvider {
    async getDiff(url) {
    // Exemplo:
    // https://github.com/user/repo/pull/123

        const token = await credentialService.get('GITHUB_TOKEN');

        const headers = {
            'Accept': 'application/vnd.github.v3.diff'
        };

        if (token) {
            headers['Authorization'] = `Bearer ${token}`;
        }

        const diffUrl = url + ".diff";

        const response =  await fetch(diffUrl, { headers });
        const diff = await response.text();

        return diff;
    }
    
}

module.exports = GithubProvider;