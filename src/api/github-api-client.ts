// Common:

import {
  Environment,
  Event,
  EventDto,
  PullRequest,
  PullRequestDto,
  Reviewer,
  ReviewerDto,
  User,
  UserDto
} from '../models/models';

const request = async (
  environment: Environment,
  url: string,
  options: {} | undefined = undefined
): Promise<unknown> => {
  const ghClient = environment.dependencies.ghClient;
  environment.dependencies.log.debug(`Requesting URL: ${url}`);
  const response = await ghClient.request<{ data: unknown }>(url, options);
  environment.dependencies.log.debug(`Response: ${JSON.stringify(response)}`);

  return response.data;
};

// User:

export const getUser = async (
  environment: Environment,
  login: string
): Promise<User> => {
  const url = `GET /users/${login}`;
  const user = (await request(environment, url)) as UserDto;

  return { login, email: user.email };
};

// Pull request:

const mapRequestedReviewer = (requestedReviewer: ReviewerDto): Reviewer => ({
  id: requestedReviewer.id,
  login: requestedReviewer.login
});

const mapPullRequest = (pullRequest: PullRequestDto): PullRequest => ({
  id: pullRequest.id,
  title: pullRequest.title,
  number: pullRequest.number,
  labels: new Set(pullRequest.labels.map((label) => label.name)),
  url: pullRequest.html_url,
  draft: pullRequest.draft,
  state: pullRequest.state,
  createdAt: pullRequest.created_at,
  requestedReviewers: pullRequest.requested_reviewers.map(mapRequestedReviewer),
  owner: pullRequest.user.login
});

export const getPullRequests = async (
  environment: Environment
): Promise<PullRequest[]> => {
  const url = `GET /repos/${environment.inputs.repoOwner}/${environment.inputs.repoName}/pulls`;
  const data = await request(environment, url, { state: 'open' });
  return (data as PullRequestDto[]).map(mapPullRequest);
};

export const getPullRequest = async (
  environment: Environment,
  pullRequestNumber: string
): Promise<PullRequest> => {
  const url = `GET /repos/${environment.inputs.repoOwner}/${environment.inputs.repoName}/pulls/${pullRequestNumber}`;
  const data = await request(environment, url);
  return mapPullRequest(data as PullRequestDto);
};

// Events:

export const getEvents = async (
  environment: Environment,
  pullRequestNumber: string
): Promise<Event[]> => {
  const url = `GET /repos/${environment.inputs.repoOwner}/${environment.inputs.repoName}/issues/${pullRequestNumber}/timeline`;
  const data = await request(environment, url);
  return (data as EventDto[]).map(mapEvent);
};

const mapEvent = (event: EventDto): Event => ({
  createdAt: event.created_at,
  type: event.event
});
