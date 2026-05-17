import { CodeChange } from '../../domain/models/CodeChange';

export class DiffParser {
  parse(diffText: string): CodeChange[] {
    const files: CodeChange[] = [];
    const lines = diffText.split(/\r?\n/);

    let currentFile: CodeChange | null = null;

    for (const line of lines) {
      if (line.startsWith('diff --git')) {
        if (currentFile) {
          files.push(currentFile);
        }

        const match = line.match(/^diff --git a\/(.+?) b\/.+/);
        const fileName = match ? match[1] : 'unknown';

        currentFile = new CodeChange({
          file: fileName,
          additions: [],
          deletions: []
        });
      } else if (line.startsWith('+') && !line.startsWith('+++')) {
        currentFile?.additions.push(line.substring(1));
      } else if (line.startsWith('-') && !line.startsWith('---')) {
        currentFile?.deletions.push(line.substring(1));
      }
    }

    if (currentFile) {
      files.push(currentFile);
    }

    return files;
  }
}
