import { DateTime } from 'luxon';
import { Event, PullRequest } from '../models/models';

export const getOpenedAt = (
  pullRequest: PullRequest,
  events: Event[]
): DateTime => {
  const created = DateTime.fromISO(pullRequest.createdAt);
  return events.reduce((current, event) => {
    if (
      event.type === 'reopened' &&
      event.createdAt !== undefined &&
      DateTime.fromISO(event.createdAt) > current
    ) {
      return DateTime.fromISO(event.createdAt);
    } else {
      return current;
    }
  }, created);
};
