import {
  getPullRequest as getPullRequestApi,
  getPullRequests as getPullRequestsApi
} from '../api/github-api-client';
import { Environment, PullRequest } from '../models/models';

export const getPullRequests = async (
  environment: Environment
): Promise<PullRequest[]> => {
  const pullRequestNumber = environment.inputs.pullRequestNumber;
  if (pullRequestNumber !== undefined && pullRequestNumber !== '') {
    environment.dependencies.log.info(`Getting #${pullRequestNumber}`);
    const pullRequest = await getPullRequestApi(environment, pullRequestNumber);
    return [pullRequest];
  } else {
    environment.dependencies.log.info(`Getting all PR of the repo`);
    return getPullRequestsApi(environment);
  }
};
