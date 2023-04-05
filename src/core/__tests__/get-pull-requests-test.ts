import { buildPullRequest, buildReviewer } from '../../__tests__/mother';
import { testEnvironment } from '../../__tests__/utils';
import * as ghApiClient from '../../api/github-api-client';
import * as pullRequestExpiration from '../../helpers/pull-request-expiration';
import { getExpiredPullRequests } from '../get-pull-requests';

describe('getExpiredPullRequests', () => {
  it('Given pull requests, discard draft/not open/no reviewers/not expired ones', async () => {
    const environment = testEnvironment();
    environment.inputs.pullRequestNumber = undefined;
    jest
      .spyOn(pullRequestExpiration, 'isPullRequestExpired')
      .mockImplementation((_, pullRequest) => pullRequest.id !== 4);
    jest.spyOn(ghApiClient, 'getPullRequests').mockResolvedValue([
      buildPullRequest(
        1,
        [],
        [buildReviewer(11), buildReviewer(22)],
        false,
        'open'
      ),
      buildPullRequest(2, [], [], false, 'open'), // No reviewers
      buildPullRequest(3, [], [], false, 'open'), // draft
      buildPullRequest(4, [], [buildReviewer(22)], false, 'open'), // notExpired
      buildPullRequest(5, [], [buildReviewer(11)], false, 'closed'), // closed
      buildPullRequest(
        6,
        [],
        [buildReviewer(33), buildReviewer(11)],
        false,
        'open'
      )
    ]);

    const pullRequests = await getExpiredPullRequests(environment);

    expect(pullRequests).toStrictEqual([
      buildPullRequest(
        1,
        [],
        [buildReviewer(11), buildReviewer(22)],
        false,
        'open'
      ),
      buildPullRequest(
        6,
        [],
        [buildReviewer(33), buildReviewer(11)],
        false,
        'open'
      )
    ]);
  });

  test.each([
    [
      'open pull request with reviewers is not filtered out',
      buildPullRequest(
        1,
        [],
        [buildReviewer(11), buildReviewer(22)],
        false,
        'open'
      ),
      [
        buildPullRequest(
          1,
          [],
          [buildReviewer(11), buildReviewer(22)],
          false,
          'open'
        )
      ]
    ],
    [
      'pull request without reviewers is filtered out',
      buildPullRequest(2, [], [], false, 'open'), // No reviewers
      []
    ],
    [
      'draft pull request is filtered out',
      buildPullRequest(3, [], [], false, 'open'), // draft
      []
    ],
    [
      'not expired pull request is filtered out',
      buildPullRequest(4, [], [buildReviewer(22)], false, 'open'), // notExpired
      []
    ],
    [
      'closed pull request is filtered out',
      buildPullRequest(5, [], [buildReviewer(11)], false, 'closed'), // closed
      []
    ]
  ])('Given pull request number, %s', async (_, pullRequest, expected) => {
    const environment = testEnvironment();
    environment.inputs.pullRequestNumber = `${pullRequest.number}`;
    jest
      .spyOn(pullRequestExpiration, 'isPullRequestExpired')
      .mockImplementation((env, pr) => pr.id !== 4);
    jest.spyOn(ghApiClient, 'getPullRequest').mockResolvedValue(pullRequest);

    const pullRequests = await getExpiredPullRequests(environment);

    expect(pullRequests).toStrictEqual(expected);
  });
});
