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
    labelToSkipPR?: string;
  };
};

export type User = {
  login: string;
  email: string;
};

export type Reviewer = {
  id: number;
  login: string;
};

export type PullRequest = {
  id: number;
  title: string;
  number: number;
  labels: Set<string>;
  url: string;
  draft: boolean;
  state: string;
  createdAt: string;
  requestedReviewers: Reviewer[];
  owner: string;
};

export type Notification = {
  pullRequest: {
    id: number;
    title: string;
    url: string;
    number: number;
    createdAt: string;
    openedAt: string;
    owner: string;
    expiration: {
      ttl: number;
      expiredAt: string;
      label?: string;
    };
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
  user: PullRequestUserDto;
};

export type PullRequestUserDto = {
  login: string;
};

export type MatchedTTL = {
  ttl: number;
  label?: string;
};

export type ExpirationResult = ExpiredResult | NotExpiredResult;

export type ExpiredResult = {
  isExpired: true;
  at: DateTime;
  ttl: number;
  label?: string;
};

export type NotExpiredResult = {
  isExpired: false;
};

type Expiration = {
  ttl: number;
  label?: string;
  expiredAt: DateTime;
};

export type ExpiredPullRequest = PullRequest & {
  expiration: Expiration;
  openedAt: DateTime;
};

export type EventDto = {
  event: string;
  created_at?: string;
};

export type Event = {
  type: string;
  createdAt?: string;
};
