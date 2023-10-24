import { DateTime } from 'luxon';
import {
  buildExpiredPullRequest,
  buildPullRequest,
  buildReviewer
} from '../../__tests__/mother';
import { testEnvironment } from '../../__tests__/utils';
import * as ghApiClient from '../../api/github-api-client';
import * as pullRequestExpiration from '../../helpers/pull-request-expiration';
import { ExpiredPullRequest, PullRequest } from '../../models/models';
import { getExpiredPullRequests } from '../get-expired-pull-requests';
import * as getOpenedAt from '../get-opened-at';
import * as getPullRequests from '../get-pull-requests';

const LABEL_TO_SKIP_PR = 'labelToSkipPR';
const ANY_OPENED_AT = DateTime.fromISO('2023-01-01');
const expiredPullRequest = (id: number): PullRequest =>
  buildPullRequest(
    id,
    new Set(),
    [buildReviewer(11), buildReviewer(22)],
    'anOwner',
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
const notExpiredPullRequest = expiredPullRequest(6);

const pullRequests: PullRequest[] = [
  closedPullRequest(1),
  draftPullRequest(2),
  pullRequestWithNoReviewers(3),
  pullRequestWithLabelToBeSkipped(4),
  expiredPullRequest(5),
  notExpiredPullRequest,
  expiredPullRequest(7)
];

describe('getExpiredPullRequests', () => {
  beforeEach(() => {
    jest
      .spyOn(getPullRequests, 'getPullRequests')
      .mockResolvedValue(pullRequests);

    jest.spyOn(ghApiClient, 'getEvents').mockResolvedValue([]);

    jest.spyOn(getOpenedAt, 'getOpenedAt').mockReturnValue(ANY_OPENED_AT);

    jest
      .spyOn(pullRequestExpiration, 'pullRequestExpiration')
      .mockImplementation((_, pullRequest) => {
        if (notExpiredPullRequest.id === pullRequest.id)
          return { isExpired: false };
        const expired = buildExpiredPullRequest(pullRequest).expiration;
        return {
          isExpired: true,
          at: expired.expiredAt,
          ttl: expired.ttl,
          label: expired.label
        };
      });
  });

  it('Several pull requests returns only open/non-draft/with-reviewers/without-skip-label and expired pull requests', async () => {
    const environment = testEnvironment();
    environment.inputs.labelToSkipPR = LABEL_TO_SKIP_PR;

    const expired = await getExpiredPullRequests(environment);

    const expected: ExpiredPullRequest[] = [
      buildExpiredPullRequest(pullRequests[4], ANY_OPENED_AT),
      buildExpiredPullRequest(pullRequests[6], ANY_OPENED_AT)
    ];
    expect(expired).toStrictEqual(expected);
  });
});
