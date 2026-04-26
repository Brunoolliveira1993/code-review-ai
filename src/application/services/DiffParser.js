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

            const fileName = line.split(' ')[2].replace('a/', '');

            currentFile = new CodeChange({
            file: fileName,
            additions: [],
            deletions: []
            });
        }

        // Linhas adicionadas
        else if (line.startsWith('+') && !line.startsWith('+++')) {
            currentFile?.additions.push(line.substring(1));
        }

        // Linhas removidas
        else if (line.startsWith('-') && !line.startsWith('---')) {
            currentFile?.deletions.push(line.substring(1));
        }
        }

        if (currentFile) {
        files.push(currentFile);
        }

        return files;
    }
}

module.exports = DiffParser;