import { DateTime } from 'luxon';
import { testEnvironment } from '../../__tests__/utils';
import { pullRequestExpiration } from '../pull-request-expiration';
import { buildPullRequest } from '../../__tests__/mother';
import * as getTTL from '../../core/get-ttl';
import { ExpiredResult } from '../../models/models';

describe('pullRequestExpiration', () => {
  const environment = testEnvironment();
  environment.dependencies.now = () => DateTime.fromISO('2023-01-27T00:00:00Z');
  const pullRequest = buildPullRequest(1, new Set(), [], 'anOwner');

  test.each([
    [
      `TTL more than interval between now and openedAt returns not-expired`,
      DateTime.fromISO('2023-01-26T00:00:00Z'),
      86401 /* more than 1d */,
      false
    ],
    [
      `TTL equal to interval between now and openedAt returns expired`,
      DateTime.fromISO('2023-01-26T00:00:00Z'),
      86400 /* 1d */,
      true
    ],
    [
      `TTL less than interval between now and openedAt returns expired`,
      DateTime.fromISO('2023-01-26T00:00:00Z'),
      86399 /* less than 1d */,
      true
    ]
  ])('%p', (_, openedAt, ttl, expected) => {
    jest.spyOn(getTTL, 'getTTL').mockReturnValue({ ttl, label: 'anyLabel' });

    const expiration = pullRequestExpiration(
      environment,
      pullRequest,
      openedAt
    );

    expect(expiration.isExpired).toBe(expected);
  });

  it('Expired pullRequest returns expected value', () => {
    jest
      .spyOn(getTTL, 'getTTL')
      .mockReturnValue({ ttl: 1000, label: 'anyLabel' });

    const expiration = pullRequestExpiration(
      environment,
      pullRequest,
      DateTime.fromISO('2023-01-26T00:00:00Z')
    ) as ExpiredResult;

    expect(expiration.isExpired).toBe(true);
    expect(expiration.label).toBe('anyLabel');
    expect(expiration.ttl).toBe(1000);
  });
});
