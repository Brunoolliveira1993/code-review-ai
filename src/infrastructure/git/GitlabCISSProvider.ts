import { GitProvider } from '../../application/ports/GitProvider';
import { credentialService } from '../security/CredentialService';

type MergeRequestStatus = {
  merge_status: string;
  has_conflicts: boolean;
  pipeline?: { status: string } | null;
};

export class GitlabCISSProvider extends GitProvider {
  async getDiff(url: string): Promise<string> {
    const token = await credentialService.get('GITLAB_TOKEN');

    const mrMatch = url.match(/gitlab\.ciss\.com\.br\/(.+?)\/-\/merge_requests\/(\d+)/);
    const commitMatch = url.match(/gitlab\.ciss\.com\.br\/(.+?)\/-\/commit\/([a-f0-9]+)/);

    if (!mrMatch && !commitMatch) {
      throw new Error('URL do GitLab CISS inválida');
    }

    let projectPath: string;
    let iidOrSha: string;
    let apiUrl: string;

    if (mrMatch) {
      [, projectPath, iidOrSha] = mrMatch;
      const encodedProject = encodeURIComponent(projectPath);
      apiUrl = `https://gitlab.ciss.com.br/api/v4/projects/${encodedProject}/merge_requests/${iidOrSha}/changes`;
    } else {
      [, projectPath, iidOrSha] = commitMatch as RegExpMatchArray;
      const encodedProject = encodeURIComponent(projectPath);
      apiUrl = `https://gitlab.ciss.com.br/api/v4/projects/${encodedProject}/repository/commits/${iidOrSha}/diff`;
    }

    const headers: Record<string, string> = {};
    if (token) {
      headers['PRIVATE-TOKEN'] = token;
    }

    const response = await fetch(apiUrl, { headers });

    if (!response.ok) {
      const body = await response.text();
      throw new Error(`Erro ao obter diff (${response.status}): ${body}`);
    }

    const data: any = await response.json();

    if (Array.isArray(data)) {
      return data.map((file: { diff: string }) => file.diff).join('\n');
    }

    if (data?.changes) {
      return data.changes
        .map((file: { old_path: string; new_path: string; diff: string }) => `diff --git a/${file.old_path} b/${file.new_path}\n${file.diff}`)
        .join('\n');
    }

    return '';
  }

  async postComment(url: string, comment: string): Promise<void> {
    const token = await credentialService.get('GITLAB_TOKEN');
    if (!token) {
      throw new Error('Token do GitLab não está configurado. Configure-o nas configurações.');
    }

    const mrMatch = url.match(/gitlab\.ciss\.com\.br\/(.+?)\/-\/merge_requests\/(\d+)/);
    if (!mrMatch) {
      throw new Error('URL inválida do GitLab CISS para comentário de MR');
    }

    const [, projectPath, iid] = mrMatch;
    const encodedProject = encodeURIComponent(projectPath);
    const apiUrl = `https://gitlab.ciss.com.br/api/v4/projects/${encodedProject}/merge_requests/${iid}/notes`;

    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'PRIVATE-TOKEN': token,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ body: comment })
    });

    if (!response.ok) {
      const body = await response.text();
      throw new Error(`Erro ao postar comentário no GitLab CISS (${response.status}): ${body}`);
    }
  }

  async validateMerge(url: string): Promise<MergeRequestStatus & { pipelineStatus: string | null }> {
    const token = await credentialService.get('GITLAB_TOKEN');

    const mrMatch = url.match(/gitlab\.ciss\.com\.br\/(.+?)\/-\/merge_requests\/(\d+)/);

    if (!mrMatch) {
      throw new Error('URL do GitLab CISS inválida para validação de merge');
    }

    const [, projectPath, iid] = mrMatch;
    const encodedProject = encodeURIComponent(projectPath);
    const apiUrl = `https://gitlab.ciss.com.br/api/v4/projects/${encodedProject}/merge_requests/${iid}`;

    const headers: Record<string, string> = {};
    if (token) {
      headers['PRIVATE-TOKEN'] = token;
    }

    const response = await fetch(apiUrl, { headers });

    if (!response.ok) {
      const body = await response.text();
      throw new Error(`Erro ao obter detalhes do merge request (${response.status}): ${body}`);
    }

    const data: any = await response.json();

    return {
      merge_status: data.merge_status,
      has_conflicts: data.has_conflicts,
      pipeline: data.pipeline,
      pipelineStatus: data.pipeline ? data.pipeline.status : null
    };
  }
}
