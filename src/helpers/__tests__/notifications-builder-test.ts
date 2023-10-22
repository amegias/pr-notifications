import {
  buildPullRequest,
  buildReviewer,
  buildUser
} from '../../__tests__/mother';
import { PullRequest, User } from '../../models/models';
import { buildNotificationsFrom } from '../notifications-builder';

describe('buildNotificationsFrom', () => {
  it('No pull requests, returns nothing', () => {
    const pullRequests: PullRequest[] = [];
    const usersByLogin: { [login: string]: User } = {};

    const notifications = buildNotificationsFrom(pullRequests, usersByLogin);

    expect(notifications).toStrictEqual([]);
  });

  it('Pull requests with some unknown users, returns notifications', () => {
    const reviewer1 = buildReviewer(11);
    const reviewer2 = buildReviewer(22);
    const unknownReviewer = buildReviewer(99);
    const user1 = buildUser(11);
    const user2 = buildUser(22);
    const user3 = buildUser(22);
    const pullRequests = [
      buildPullRequest(1, new Set(), [reviewer1, unknownReviewer], 'anOwner'),
      buildPullRequest(2, new Set(), [reviewer1, reviewer2], 'otherOwner')
    ];
    const usersByLogin = {
      [user1.login]: user1,
      [user2.login]: user2,
      [user3.login]: user3
    };

    const notifications = buildNotificationsFrom(pullRequests, usersByLogin);

    expect(notifications).toStrictEqual([
      {
        pullRequest: {
          id: 1,
          title: 'title 1',
          url: 'https://api.github.com/repos/whatever/1',
          number: 10,
          createdAt: '2023-01-25T00:00:00Z',
          owner: 'anOwner'
        },
        recipient: { login: 'login11', email: '11@whatever.com' }
      },
      {
        pullRequest: {
          id: 2,
          title: 'title 2',
          url: 'https://api.github.com/repos/whatever/2',
          number: 20,
          createdAt: '2023-01-25T00:00:00Z',
          owner: 'otherOwner'
        },
        recipient: { login: 'login11', email: '11@whatever.com' }
      },
      {
        pullRequest: {
          id: 2,
          title: 'title 2',
          url: 'https://api.github.com/repos/whatever/2',
          number: 20,
          createdAt: '2023-01-25T00:00:00Z',
          owner: 'otherOwner'
        },
        recipient: { login: 'login22', email: '22@whatever.com' }
      }
    ]);
  });
});
