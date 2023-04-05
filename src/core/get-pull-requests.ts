import { getPullRequest, getPullRequests } from '../api/github-api-client';
import { isPullRequestExpired } from '../helpers/pull-request-expiration';
import { Environment, PullRequest } from '../models/models';

export const getExpiredPullRequests = async (
  environment: Environment
): Promise<PullRequest[]> => {
  const pullRequestNumber = environment.inputs.pullRequestNumber;
  let pullRequests: PullRequest[];
  if (pullRequestNumber !== undefined && pullRequestNumber !== '') {
    environment.dependencies.log.info(`Getting #${pullRequestNumber}`);
    const pullRequest = await getPullRequest(environment, pullRequestNumber);
    pullRequests = [pullRequest];
  } else {
    environment.dependencies.log.info(`Getting all PR of the repo`);
    pullRequests = await getPullRequests(environment);
  }
  return pullRequests.filter(
    (pullRequest) =>
      pullRequest.state === 'open' &&
      pullRequest.draft === false &&
      pullRequest.requestedReviewers.length &&
      isPullRequestExpired(environment, pullRequest)
  );
};
