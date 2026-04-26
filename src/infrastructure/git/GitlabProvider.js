const GitProvider = require('../../application/ports/GitProvider');
const credentialService = require('../security/CredentialService');

class GitlabProvider extends GitProvider {
    async getDiff(url) {
    
        
        const token = await credentialService.get('GITLAB_TOKEN');

        const headers = {};

        if (token) {
            headers['PRIVATE-TOKEN'] = token;
        }

        const diffUrl = url + ".diff";
        const response = await fetch(diffUrl, { headers });
        const diff = await response.text();

        return diff;
    }
}

module.exports = GitlabProvider;