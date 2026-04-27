const GitProvider = require('../../application/ports/GitProvider');
const credentialService = require('../security/CredentialService');

class GitlabProvider extends GitProvider {
    async getDiff(url) {
        const token = await credentialService.get('GITLAB_TOKEN');

        let apiUrl;

        // Merge Request
        const mrMatch = url.match(/gitlab\.com\/(.+?)\/-\/merge_requests\/(\d+)/);

        // Commit
        const commitMatch = url.match(/gitlab\.com\/(.+?)\/-\/commit\/([a-f0-9]+)/);

        if (!mrMatch && !commitMatch) {
            throw new Error('URL do GitLab inválida');
        }

        let projectPath, iidOrSha;

        if (mrMatch) {
            [, projectPath, iidOrSha] = mrMatch;

            const encodedProject = encodeURIComponent(projectPath);
            apiUrl = `https://gitlab.com/api/v4/projects/${encodedProject}/merge_requests/${iidOrSha}/changes`;
        }

        if (commitMatch) {
            [, projectPath, iidOrSha] = commitMatch;

            const encodedProject = encodeURIComponent(projectPath);
            apiUrl = `https://gitlab.com/api/v4/projects/${encodedProject}/repository/commits/${iidOrSha}/diff`;
        }

        const headers = {};

        if (token) {
            headers['PRIVATE-TOKEN'] = token;
        }

        const response = await fetch(apiUrl, { headers });

        console.log(`GitLab API response status: ${response.status} for URL: ${apiUrl}`);

        if (!response.ok) {
            const body = await response.text();
            throw new Error(`Erro ao obter diff (${response.status}): ${body}`);
        }

        const data = await response.json();

        // GitLab retorna JSON estruturado, então vamos converter para diff texto
        if (Array.isArray(data)) {
            // commit diff
            return data.map(f => f.diff).join('\n');
        }

        if (data.changes) {
            // MR diff
            return data.changes.map(f => f.diff).join('\n');
        }

        return '';
    }
}

module.exports = GitlabProvider;