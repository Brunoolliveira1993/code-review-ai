import type { ReviewIssue, ReviewSuggestion } from '../../application/types/types';

type ReviewResultPayload = {
  issues?: ReviewIssue[];
  suggestions?: ReviewSuggestion[];
};

export class ReviewResult {
  public readonly issues: ReviewIssue[];
  public readonly suggestions: ReviewSuggestion[];

  constructor({ issues = [], suggestions = [] }: ReviewResultPayload) {
    this.issues = issues;
    this.suggestions = suggestions;
  }
}
