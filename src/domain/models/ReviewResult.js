class ReviewResult {
    constructor({ issues = [], suggestions = [] }) {
        this.issues = issues;
        this.suggestions = suggestions;
    }
}

module.exports = ReviewResult;