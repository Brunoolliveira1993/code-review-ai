const CodeChange = require('../../domain/models/CodeChange');

class DiffParser {
    parse(diffText) {
        const files = [];
        const lines = diffText.split('\n');

        let currentFile = null;

        for (let line of lines) {

        // Detecta novo arquivo
        if (line.startsWith('diff --git')) {
            if (currentFile) {
            files.push(currentFile);
            }

            // Extrai o caminho corretamente: "diff --git a/path b/path"
            const match = line.match(/^diff --git a\/(.+?) b\/.+/);
            const fileName = match ? match[1] : 'unknown';

            currentFile = new CodeChange({
            file: fileName,
            additions: [],
            deletions: []
            });
        }

        // Linhas adicionadas (proteger contra null reference)
        else if (line.startsWith('+') && !line.startsWith('+++')) {
            if (currentFile) {
                currentFile.additions.push(line.substring(1));
            }
        }

        // Linhas removidas (proteger contra null reference)
        else if (line.startsWith('-') && !line.startsWith('---')) {
            if (currentFile) {
                currentFile.deletions.push(line.substring(1));
            }
        }
        }

        if (currentFile) {
        files.push(currentFile);
        }

        return files;
    }
}

module.exports = DiffParser;