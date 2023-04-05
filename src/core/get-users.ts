import { getUser } from '../api/github-api-client';
import { Environment, PullRequest, User } from '../models/models';

export const getUsersByLogin = async (
  environment: Environment,
  pullRequests: PullRequest[]
): Promise<{ [login: string]: User }> => {
  const logins = pullRequests.reduce((currentLogins, pullRequest) => {
    return new Set([
      ...currentLogins,
      ...pullRequest.requestedReviewers.map((reviewer) => reviewer.login)
    ]);
  }, new Set<string>());

  const users = await Promise.all(
    Array.from(logins).map(async (login) => getUser(environment, login))
  );

  return users.reduce((usersByLogin, user) => {
    usersByLogin[user.login] = user;
    return usersByLogin;
  }, {} as { [login: string]: User });
};
