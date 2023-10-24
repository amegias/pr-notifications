import { DateTime, Interval } from 'luxon';
import { getTTL } from '../core/get-ttl';
import {
  Environment,
  ExpirationResult,
  ExpiredResult,
  NotExpiredResult,
  PullRequest
} from '../models/models';

export const pullRequestExpiration = (
  environment: Environment,
  pullRequest: PullRequest,
  openedAt: DateTime
): ExpirationResult => {
  const now = environment.dependencies.now();
  const interval = Interval.fromDateTimes(openedAt, now);
  const diffInSeconds = interval.length('seconds');
  const matched = getTTL(environment, pullRequest.labels);
  const isExpired =
    diffInSeconds !== Number.MAX_VALUE && diffInSeconds > matched.ttl;

  let result: ExpirationResult;
  if (isExpired) {
    const expiredResult: ExpiredResult = {
      isExpired,
      at: openedAt.plus({ seconds: matched.ttl }),
      ttl: matched.ttl,
      label: matched.label
    };
    result = expiredResult;
  } else {
    const expiredResult: NotExpiredResult = { isExpired };
    result = expiredResult;
  }

  environment.dependencies.log.debug(
    `Pull request #${pullRequest.number} -> expiration: ${JSON.stringify(
      result
    )}`
  );
  return result;
};
