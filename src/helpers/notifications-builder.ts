import { ExpiredPullRequest, Notification, User } from '../models/models';

export const buildNotificationsFrom = (
  pullRequests: ExpiredPullRequest[],
  usersByLogin: { [login: string]: User }
): Notification[] =>
  pullRequests.reduce((notifications, pullRequest) => {
    const pullRequestNotifications = pullRequest.requestedReviewers.reduce(
      (currentPullRequestNotifications, reviewer) => {
        if (usersByLogin[reviewer.login] !== undefined) {
          currentPullRequestNotifications.push({
            pullRequest: {
              id: pullRequest.id,
              title: pullRequest.title,
              url: pullRequest.url,
              number: pullRequest.number,
              createdAt: pullRequest.createdAt,
              owner: pullRequest.owner,
              // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
              openedAt: pullRequest.openedAt
                .toUTC()
                .toISO({ suppressMilliseconds: true })!, // toUTC() => to format with 'Z' instead of adding '+01:00'
              expiration: {
                label: pullRequest.expiration.label,
                ttl: pullRequest.expiration.ttl,
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                expiredAt: pullRequest.expiration.expiredAt
                  .toUTC()
                  .toISO({ suppressMilliseconds: true })! // toUTC() => to format with 'Z' instead of adding '+01:00'
              }
            },
            recipient: usersByLogin[reviewer.login]
          });
        }
        return currentPullRequestNotifications;
      },
      [] as Notification[]
    );

    return [...notifications, ...pullRequestNotifications];
  }, [] as Notification[]);
