const GitProvider = require('../../application/ports/GitProvider');
const credentialService = require('../security/CredentialService');

class GitlabCISSProvider extends GitProvider {
    async getDiff(url) {
        const token = await credentialService.get('GITLAB_TOKEN');

        let apiUrl;

        // Merge Request
        const mrMatch = url.match(/gitlab\.ciss\.com\.br\/(.+?)\/-\/merge_requests\/(\d+)/);

        // Commit
        const commitMatch = url.match(/gitlab\.ciss\.com\.br\/(.+?)\/-\/commit\/([a-f0-9]+)/);

        if (!mrMatch && !commitMatch) {
            throw new Error('URL do GitLab CISS inválida');
        }

        let projectPath, iidOrSha;

        if (mrMatch) {
            [, projectPath, iidOrSha] = mrMatch;

            const encodedProject = encodeURIComponent(projectPath);
            apiUrl = `https://gitlab.ciss.com.br/api/v4/projects/${encodedProject}/merge_requests/${iidOrSha}/changes`;
        }

        if (commitMatch) {
            [, projectPath, iidOrSha] = commitMatch;

            const encodedProject = encodeURIComponent(projectPath);
            apiUrl = `https://gitlab.ciss.com.br/api/v4/projects/${encodedProject}/repository/commits/${iidOrSha}/diff`;
        }

        const headers = {};

        if (token) {
            headers['PRIVATE-TOKEN'] = token;
        }

        const response = await fetch(apiUrl, { headers });

        console.log(`GitLab CISS API response status: ${response.status} for URL: ${apiUrl}`);

        if (!response.ok) {
            const body = await response.text();
            throw new Error(`Erro ao obter diff (${response.status}): ${body}`);
        }

        const data = await response.json();

        // GitLab retorna JSON estruturado, então vamos converter para diff texto
        if (Array.isArray(data)) {
            // commit diff - assuming it already has headers
            return data.map(f => f.diff).join('\n');
        }

        if (data.changes) {
            // MR diff - add diff --git headers
            return data.changes.map(f => `diff --git a/${f.old_path} b/${f.new_path}\n${f.diff}`).join('\n');
        }

        return '';
    }

    async validateMerge(url) {
        const token = await credentialService.get('GITLAB_TOKEN');

        const mrMatch = url.match(/gitlab\.ciss\.com\.br\/(.+?)\/-\/merge_requests\/(\d+)/);

        if (!mrMatch) {
            throw new Error('URL do GitLab CISS inválida para validação de merge');
        }

        const [, projectPath, iid] = mrMatch;
        const encodedProject = encodeURIComponent(projectPath);
        const apiUrl = `https://gitlab.ciss.com.br/api/v4/projects/${encodedProject}/merge_requests/${iid}`;

        const headers = {};

        if (token) {
            headers['PRIVATE-TOKEN'] = token;
        }

        const response = await fetch(apiUrl, { headers });

        console.log(`GitLab CISS API response status: ${response.status} for URL: ${apiUrl}`);

        if (!response.ok) {
            const body = await response.text();
            throw new Error(`Erro ao obter detalhes do merge request (${response.status}): ${body}`);
        }

        const data = await response.json();

        // Verificar se o merge pode ser realizado
        const isMergeable = data.merge_status === 'can_be_merged' && !data.has_conflicts;

        return {
            mergeable: isMergeable,
            status: data.merge_status,
            hasConflicts: data.has_conflicts,
            pipelineStatus: data.pipeline ? data.pipeline.status : null
        };
    }
}

module.exports = GitlabCISSProvider;