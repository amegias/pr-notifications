import { DateTime } from 'luxon';
import { buildPullRequest } from '../../__tests__/mother';
import { Event } from '../../models/models';
import { getOpenedAt } from '../get-opened-at';

describe('getOpenedAt', () => {
  it('No reopened events returns createdAt', async () => {
    const pullRequest = buildPullRequest(
      1,
      new Set(),
      [],
      'anOwner',
      false,
      'open',
      '2023-01-25T00:00:00Z'
    );
    const events: Event[] = [
      { type: 'anyType', createdAt: '2023-01-26T00:00:00Z' }
    ];

    const openedAt = getOpenedAt(pullRequest, events);

    expect(openedAt.toISO()).toBe(
      DateTime.fromISO('2023-01-25T00:00:00Z').toISO()
    );
  });

  it('Several reopened events returns the latest one', async () => {
    const pullRequest = buildPullRequest(
      1,
      new Set(),
      [],
      'anOwner',
      false,
      'open',
      '2023-01-25T00:00:00Z'
    );
    const events: Event[] = [
      { type: 'reopened', createdAt: '2023-01-26T00:00:00Z' },
      { type: 'anyType', createdAt: '2023-01-27T00:00:00Z' },
      { type: 'reopened', createdAt: '2023-01-28T00:00:00Z' },
      { type: 'anyType', createdAt: '2023-01-29T00:00:00Z' }
    ];

    const openedAt = getOpenedAt(pullRequest, events);

    expect(openedAt.toISO()).toBe(
      DateTime.fromISO('2023-01-28T00:00:00Z').toISO()
    );
  });
});
