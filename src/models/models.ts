import { DateTime } from 'luxon';

export type Environment = {
  dependencies: {
    ghClient: {
      request: <T>(path: string, options?: {}) => Promise<T>;
    };
    log: {
      debug: (message: string) => void;
      info: (message: string) => void;
      error: (message: string) => void;
      warn: (message: string) => void;
    };
    now: () => DateTime;
  };
  inputs: {
    repoOwner: string;
    repoName: string;
    labelsTTL: { [name: string]: string };
    defaultTTL?: string;
    pullRequestNumber?: string;
  };
};

export type User = {
  login: string;
  email: string;
};

export type Label = {
  id: number;
  name: string;
};

export type Reviewer = {
  id: number;
  login: string;
};

// TODO: ids en number?
export type PullRequest = {
  id: number;
  title: string;
  number: number;
  labels: Label[];
  url: string;
  draft: boolean;
  state: string;
  createdAt: string;
  requestedReviewers: Reviewer[];
};

export type Notification = {
  pullRequest: {
    id: number;
    title: string;
    url: string;
    number: number;
    createdAt: string;
  };
  recipient: User;
};

// DTOs:

export type UserDto = {
  email: string;
  login: string;
};

export type LabelDto = {
  id: number;
  name: string;
};

export type ReviewerDto = {
  id: number;
  login: string;
};

export type PullRequestDto = {
  id: number;
  title: string;
  number: number;
  labels: LabelDto[];
  html_url: string;
  draft: boolean;
  state: string;
  created_at: string;
  requested_reviewers: ReviewerDto[];
};
