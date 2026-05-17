export type ReviewRequestType = 'commit' | 'merge' | 'repo';

export type ReviewRequest = {
  url: string;
  type: ReviewRequestType;
  model: string;
};
