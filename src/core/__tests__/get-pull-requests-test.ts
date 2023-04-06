import { buildPullRequest, buildReviewer } from '../../__tests__/mother';
import { testEnvironment } from '../../__tests__/utils';
import * as ghApiClient from '../../api/github-api-client';
import * as pullRequestExpiration from '../../helpers/pull-request-expiration';
import { PullRequest } from '../../models/models';
import { getExpiredPullRequests } from '../get-pull-requests';

const LABEL_TO_SKIP_PR = 'labelToSkipPR';
const expiredPullRequest = (id: number): PullRequest =>
  buildPullRequest(
    id,
    new Set(),
    [buildReviewer(11), buildReviewer(22)],
    false,
    'open'
  );

const closedPullRequest = (id: number): PullRequest => ({
  ...expiredPullRequest(id),
  state: 'closed'
});
const draftPullRequest = (id: number): PullRequest => ({
  ...expiredPullRequest(id),
  draft: true
});
const pullRequestWithNoReviewers = (id: number): PullRequest => ({
  ...expiredPullRequest(id),
  requestedReviewers: []
});
const pullRequestWithLabelToBeSkipped = (id: number): PullRequest => ({
  ...expiredPullRequest(id),
  labels: new Set([LABEL_TO_SKIP_PR])
});
const notExpiredPullRequest = expiredPullRequest(10);

describe('getExpiredPullRequests', () => {
  beforeEach(() => {
    jest
      .spyOn(pullRequestExpiration, 'isPullRequestExpired')
      .mockImplementation(
        (_, pullRequest) => notExpiredPullRequest.id !== pullRequest.id
      );
  });

  it('returns pull requests which are open & not draft & with reviewers & without label to skip & expired', async () => {
    const environment = testEnvironment();
    environment.inputs.pullRequestNumber = undefined;
    environment.inputs.labelToSkipPR = LABEL_TO_SKIP_PR;

    const pullRequests = [
      expiredPullRequest(1),
      closedPullRequest(2),
      expiredPullRequest(3),
      draftPullRequest(4),
      expiredPullRequest(5),
      pullRequestWithNoReviewers(6),
      expiredPullRequest(7),
      pullRequestWithLabelToBeSkipped(8),
      expiredPullRequest(9),
      notExpiredPullRequest,
      expiredPullRequest(11)
    ];

    jest.spyOn(ghApiClient, 'getPullRequests').mockResolvedValue(pullRequests);

    const filteredPullRequests = await getExpiredPullRequests(environment);
    expect(filteredPullRequests).toStrictEqual([
      expiredPullRequest(1),
      expiredPullRequest(3),
      expiredPullRequest(5),
      expiredPullRequest(7),
      expiredPullRequest(9),
      expiredPullRequest(11)
    ]);
  });

  it('returns filtered pull requests when label to skip PR is not set', async () => {
    const environment = testEnvironment();
    environment.inputs.pullRequestNumber = undefined;
    environment.inputs.labelToSkipPR = undefined;

    const pullRequests = [
      expiredPullRequest(1),
      closedPullRequest(2),
      expiredPullRequest(3),
      draftPullRequest(4),
      expiredPullRequest(5),
      pullRequestWithNoReviewers(6),
      expiredPullRequest(7),
      pullRequestWithLabelToBeSkipped(8),
      expiredPullRequest(9),
      notExpiredPullRequest,
      expiredPullRequest(11)
    ];

    jest.spyOn(ghApiClient, 'getPullRequests').mockResolvedValue(pullRequests);

    const filteredPullRequests = await getExpiredPullRequests(environment);
    expect(filteredPullRequests).toStrictEqual([
      expiredPullRequest(1),
      expiredPullRequest(3),
      expiredPullRequest(5),
      expiredPullRequest(7),
      pullRequestWithLabelToBeSkipped(8),
      expiredPullRequest(9),
      expiredPullRequest(11)
    ]);
  });

  it.each([
    [
      'Expired pull request is returned',
      expiredPullRequest(1),
      [expiredPullRequest(1)]
    ],
    ['Closed pull request is filtered out', closedPullRequest(1), []],
    ['Draft pull request is filtered out', draftPullRequest(1), []],
    [
      'Pull request with no reviewers is filtered out',
      pullRequestWithNoReviewers(1),
      []
    ],
    [
      'Pull request with label to be skipped is filtered out',
      pullRequestWithLabelToBeSkipped(1),
      []
    ],
    ['Not expired pull request is filtered out', notExpiredPullRequest, []]
  ])('%s', async (_, pullRequest, expected) => {
    const environment = testEnvironment();
    environment.inputs.pullRequestNumber = `${pullRequest.id}`;
    environment.inputs.labelToSkipPR = LABEL_TO_SKIP_PR;

    jest.spyOn(ghApiClient, 'getPullRequest').mockResolvedValue(pullRequest);

    const filteredPullRequests = await getExpiredPullRequests(environment);
    expect(filteredPullRequests).toStrictEqual(expected);
  });

  it('Pull request with label to be skipped is not skipped when labelToSkipPR is not set', async () => {
    const environment = testEnvironment();
    const pullRequest = pullRequestWithLabelToBeSkipped(1);
    environment.inputs.pullRequestNumber = `${pullRequest.id}`;
    environment.inputs.labelToSkipPR = undefined;

    jest.spyOn(ghApiClient, 'getPullRequest').mockResolvedValue(pullRequest);

    const filteredPullRequests = await getExpiredPullRequests(environment);
    expect(filteredPullRequests).toStrictEqual([pullRequest]);
  });
});
