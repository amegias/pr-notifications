import { Notification, PullRequest, User } from '../models/models';

export const buildNotificationsFrom = (
  pullRequests: PullRequest[],
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
              createdAt: pullRequest.createdAt
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
