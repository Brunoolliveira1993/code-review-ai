import { CodeChange } from '../../domain/models/CodeChange';

export class DiffChunker {
  chunkByFile(changes: CodeChange[]): CodeChange[][] {
    return changes.map((change) => [change]);
  }
}
