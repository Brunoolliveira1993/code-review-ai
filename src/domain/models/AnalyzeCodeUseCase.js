class ReviewRequest {
  constructor({ url, type, model }) {
    this.url = url;
    this.type = type; // commit | merge | repo
    this.model = model;
  }
}

module.exports = ReviewRequest;