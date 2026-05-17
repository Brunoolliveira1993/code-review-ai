import { GitProvider } from '../../application/ports/GitProvider';
import { credentialService } from '../security/CredentialService';

const GITHUB_DIFF_ACCEPT_HEADER = 'application/vnd.github.v3.diff';

export class GithubProvider extends GitProvider {
  async getDiff(url: string): Promise<string> {
    const token = await credentialService.get('GITHUB_TOKEN');

    const prMatch = url.match(/github\.com\/([^\/]+)\/([^\/]+)\/pull\/(\d+)/);
    const commitMatch = url.match(/github\.com\/([^\/]+)\/([^\/]+)\/commit\/([a-f0-9]+)/);

    let apiUrl: string;

    if (prMatch) {
      const [, owner, repo, prNumber] = prMatch;
      apiUrl = `https://api.github.com/repos/${owner}/${repo}/pulls/${prNumber}`;
    } else if (commitMatch) {
      const [, owner, repo, sha] = commitMatch;
      apiUrl = `https://api.github.com/repos/${owner}/${repo}/commits/${sha}`;
    } else {
      throw new Error('URL inválida do GitHub');
    }

    const headers: Record<string, string> = {
      Accept: GITHUB_DIFF_ACCEPT_HEADER
    };

    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }

    const response = await fetch(apiUrl, { headers });

    if (!response.ok) {
      const body = await response.text();
      throw new Error(`Erro ao obter diff (${response.status}): ${body}`);
    }

    return response.text();
  }

  async postComment(url: string, comment: string): Promise<void> {
    const token = await credentialService.get('GITHUB_TOKEN');
    if (!token) {
      throw new Error('Token do GitHub não está configurado. Configure-o nas configurações.');
    }

    const prMatch = url.match(/github\.com\/([^\/]+)\/([^\/]+)\/pull\/(\d+)/);
    if (!prMatch) {
      throw new Error('URL inválida do GitHub para comentário de PR');
    }

    const [, owner, repo, prNumber] = prMatch;
    const apiUrl = `https://api.github.com/repos/${owner}/${repo}/issues/${prNumber}/comments`;

    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        Accept: 'application/vnd.github+json',
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ body: comment })
    });

    if (!response.ok) {
      const body = await response.text();
      throw new Error(`Erro ao postar comentário no GitHub (${response.status}): ${body}`);
    }
  }
}
