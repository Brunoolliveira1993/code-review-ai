export abstract class GitProvider {
  abstract getDiff(url: string): Promise<string>;
  abstract postComment(url: string, comment: string): Promise<void>;
}
