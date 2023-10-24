import { getEvents } from '../api/github-api-client';
import { pullRequestExpiration } from '../helpers/pull-request-expiration';
import { Environment, ExpiredPullRequest, PullRequest } from '../models/models';
import { getOpenedAt } from './get-opened-at';
import { getPullRequests } from './get-pull-requests';

const hasLabelToSkip = (
  environment: Environment,
  pullRequest: PullRequest
): boolean =>
  environment.inputs.labelToSkipPR !== undefined &&
  environment.inputs.labelToSkipPR !== '' &&
  pullRequest.labels.has(environment.inputs.labelToSkipPR);

export const getExpiredPullRequests = async (
  environment: Environment
): Promise<ExpiredPullRequest[]> => {
  const pullRequests = await getPullRequests(environment);
  const matchedPullRequests = pullRequests.filter(
    (pullRequest) =>
      pullRequest.state === 'open' &&
      pullRequest.draft === false &&
      pullRequest.requestedReviewers.length &&
      !hasLabelToSkip(environment, pullRequest)
  );

  const pullRequestsWithEvents = await Promise.all(
    matchedPullRequests.map(async (pullRequest) =>
      // eslint-disable-next-line github/no-then
      getEvents(environment, `${pullRequest.number}`).then((events) => ({
        pullRequest,
        events
      }))
    )
  );

  return pullRequestsWithEvents.reduce(
    (expiredPullRequests, { pullRequest, events }) => {
      const openedAt = getOpenedAt(pullRequest, events);
      const expiration = pullRequestExpiration(
        environment,
        pullRequest,
        openedAt
      );
      if (expiration.isExpired) {
        const expiredPullRequest = {
          ...pullRequest,
          openedAt,
          expiration: {
            ttl: expiration.ttl,
            expiredAt: expiration.at,
            label: expiration.label
          }
        };
        expiredPullRequests.push(expiredPullRequest);
      }
      return expiredPullRequests;
    },
    [] as ExpiredPullRequest[]
  );
};
