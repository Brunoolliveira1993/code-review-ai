export type CodeChangePayload = {
  file: string;
  additions?: string[];
  deletions?: string[];
};

export class CodeChange {
  public readonly file: string;
  public readonly additions: string[];
  public readonly deletions: string[];

  constructor({ file, additions = [], deletions = [] }: CodeChangePayload) {
    this.file = file;
    this.additions = additions;
    this.deletions = deletions;
  }
}
