import {
  buildPullRequest,
  buildReviewer,
  buildUser
} from '../../__tests__/mother';
import { testEnvironment } from '../../__tests__/utils';
import * as ghApiClient from '../../api/github-api-client';
import { PullRequest } from '../../models/models';
import { getUsersByLogin } from '../get-users';

describe('getUsersByLogin', () => {
  it('No pull requests returns []', async () => {
    const environment = testEnvironment();
    const pullRequests: PullRequest[] = [];

    const users = await getUsersByLogin(environment, pullRequests);

    expect(users).toStrictEqual({});
  });

  it('Given repeated users in several pull requests, returns them grouped by login', async () => {
    const environment = testEnvironment();
    jest
      .spyOn(ghApiClient, 'getUser')
      .mockImplementation(async (_, login) =>
        Promise.resolve(buildUser(parseInt(login.replace('login', ''))))
      );
    const pullRequests = [
      buildPullRequest(1, [], [buildReviewer(11), buildReviewer(33)]),
      buildPullRequest(
        2,
        [],
        [
          buildReviewer(11),
          buildReviewer(22),
          buildReviewer(33),
          buildReviewer(44)
        ]
      )
    ];

    const users = await getUsersByLogin(environment, pullRequests);

    expect(users).toStrictEqual({
      login11: buildUser(11),
      login33: buildUser(33),
      login22: buildUser(22),
      login44: buildUser(44)
    });
  });
});
