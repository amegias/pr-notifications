import { buildPullRequest } from '../../__tests__/mother';
import { testEnvironment } from '../../__tests__/utils';
import { getPullRequests } from '../get-pull-requests';
import * as api from '../../api/github-api-client';

describe('getPullRequests', () => {
  it('Empty pullRequestNumber returns all pull requests', async () => {
    const environment = testEnvironment();
    environment.inputs.pullRequestNumber = '';
    const pullRequestA = buildPullRequest(1, new Set(), [], 'anyOwner1');
    const pullRequestB = buildPullRequest(2, new Set(), [], 'anyOwner2');
    jest
      .spyOn(api, 'getPullRequests')
      .mockResolvedValue([pullRequestA, pullRequestB]);

    const result = await getPullRequests(environment);

    expect(result).toStrictEqual([pullRequestA, pullRequestB]);
  });

  it('Undefined pullRequestNumber returns all pull requests', async () => {
    const environment = testEnvironment();
    environment.inputs.pullRequestNumber = undefined;
    const pullRequestA = buildPullRequest(1, new Set(), [], 'anyOwner1');
    const pullRequestB = buildPullRequest(2, new Set(), [], 'anyOwner2');
    jest
      .spyOn(api, 'getPullRequests')
      .mockResolvedValue([pullRequestA, pullRequestB]);

    const result = await getPullRequests(environment);

    expect(result).toStrictEqual([pullRequestA, pullRequestB]);
  });

  it('Any pullRequestNumber returns that pull request', async () => {
    const environment = testEnvironment();
    environment.inputs.pullRequestNumber = '23';
    const pullRequest = buildPullRequest(1, new Set(), [], 'anyOwner1');
    jest.spyOn(api, 'getPullRequest').mockResolvedValue(pullRequest);

    const result = await getPullRequests(environment);

    expect(result).toStrictEqual([pullRequest]);
  });
});
