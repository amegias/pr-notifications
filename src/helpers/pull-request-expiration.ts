import { DateTime, Interval } from 'luxon';
import { Environment, PullRequest } from '../models/models';

export const isPullRequestExpired = (
  environment: Environment,
  pullRequest: PullRequest
): boolean => {
  const created = DateTime.fromISO(pullRequest.createdAt);
  const now = environment.dependencies.now();
  const interval = Interval.fromDateTimes(created, now);
  const diffInSeconds = interval.length('seconds');
  const ttl = Array.from(pullRequest.labels).reduce(
    (currentTTL, label) => {
      const labelTTL = environment.inputs.labelsTTL[label];
      if (labelTTL !== undefined) {
        return Math.min(parseInt(labelTTL), currentTTL);
      }
      return currentTTL;
    },
    environment.inputs.defaultTTL
      ? parseInt(environment.inputs.defaultTTL)
      : Number.MAX_VALUE
  );

  const isExpired = diffInSeconds !== Number.MAX_VALUE && diffInSeconds > ttl;
  environment.dependencies.log.debug(
    `Pull request #${pullRequest.number} created at: ${
      pullRequest.createdAt
    } (${diffInSeconds} seconds from now: ${now}) => ${
      isExpired ? 'Is Expired' : 'Not Expired yet'
    }`
  );
  return isExpired;
};
