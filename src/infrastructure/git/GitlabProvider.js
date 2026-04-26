const GitProvider = require('../../application/ports/GitProvider');

class GitlabProvider extends GitProvider {
    async getDiff(url) {
    // GitLab também suporta .diff
        const diffUrl = url + ".diff";

        const response = await fetch(diffUrl);
        const diff = await response.text();

        return diff;
    }
}

module.exports = GitlabProvider;