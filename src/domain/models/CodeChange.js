class CodeChange {
    constructor({ file, additions = [], deletions = [] }) {
        this.file = file;
        this.additions = additions;
        this.deletions = deletions;
    }
}

module.exports = CodeChange;