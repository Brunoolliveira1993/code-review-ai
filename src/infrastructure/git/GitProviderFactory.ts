import { GithubProvider } from './GithubProvider';
import { GitlabProvider } from './GitlabProvider';
import { GitlabCISSProvider } from './GitlabCISSProvider';
import { GitProvider } from '../../application/ports/GitProvider';

export class GitProviderFactory {
  static create(url: string): GitProvider {
    try {
      const urlObj = new URL(url);
      const hostname = String(urlObj.hostname).toLowerCase();

      if (hostname.endsWith('github.com')) {
        return new GithubProvider();
      }

      if (hostname.endsWith('gitlab.com')) {
        return new GitlabProvider();
      }

      if (hostname === 'gitlab.ciss.com.br') {
        return new GitlabCISSProvider();
      }

      throw new Error('Provedor Git não suportado');
    } catch (err) {
      if (err instanceof Error && err.message === 'Provedor Git não suportado') {
        throw err;
      }
      throw new Error(`URL inválida: ${err instanceof Error ? err.message : String(err)}`);
    }
  }
}
