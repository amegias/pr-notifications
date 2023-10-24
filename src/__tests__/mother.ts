import { DateTime } from 'luxon';
import {
  ExpiredPullRequest,
  LabelDto,
  PullRequest,
  PullRequestDto,
  PullRequestUserDto,
  Reviewer,
  ReviewerDto,
  User,
  UserDto
} from '../models/models';

export const buildUserDto = (id: number): UserDto => ({
  login: `login${id}`,
  email: `${id}@whatever.com`
});

export const buildUser = (id: number): User => ({
  login: `login${id}`,
  email: `${id}@whatever.com`
});

export const buildReviewerDto = (id: number): ReviewerDto => ({
  id,
  login: `login${id}`
});

export const buildReviewer = (id: number): Reviewer => ({
  id,
  login: `login${id}`
});

export const buildPullRequestDto = (
  id: number,
  labels: LabelDto[],
  requested_reviewers: ReviewerDto[],
  user: PullRequestUserDto
): PullRequestDto => ({
  created_at: '2023-01-25T00:00:00Z',
  id,
  number: id * 10,
  labels,
  requested_reviewers,
  state: 'closed',
  draft: true,
  title: `title ${id}`,
  html_url: `https://api.github.com/repos/whatever/${id}`,
  user
});

export const buildPullRequest = (
  id: number,
  labels: Set<string>,
  requestedReviewers: Reviewer[],
  owner: string,
  draft: boolean | undefined = true,
  state: string | undefined = 'closed',
  createdAt: string | undefined = '2023-01-25T00:00:00Z'
): PullRequest => ({
  id,
  title: `title ${id}`,
  number: id * 10,
  createdAt,
  draft,
  labels,
  url: `https://api.github.com/repos/whatever/${id}`,
  requestedReviewers,
  state,
  owner
});

export const buildExpiredPullRequest = (
  pullRequest: PullRequest,
  openedAt: DateTime = DateTime.fromISO(pullRequest.createdAt).plus({
    second: 1
  })
): ExpiredPullRequest => ({
  ...pullRequest,
  openedAt,
  expiration: {
    ttl: 1000,
    expiredAt: DateTime.fromISO(pullRequest.createdAt).plus({
      hours: pullRequest.id
    }),
    label: `anyLabel${pullRequest.id}`
  }
});

export const buildLabelDto = (id: number): LabelDto => ({
  id,
  name: `label${id}`
});
