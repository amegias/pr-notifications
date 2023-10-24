import { getExpiredPullRequests } from './core/get-expired-pull-requests';
import { getUsersByLogin } from './core/get-users';
import { buildNotificationsFrom } from './helpers/notifications-builder';
import { Environment, Notification } from './models/models';

export const getNotifications = async (
  environment: Environment
): Promise<Notification[]> => {
  environment.dependencies.log.info(
    `Input: ${JSON.stringify(environment.inputs)}`
  );
  const pullRequests = await getExpiredPullRequests(environment);
  environment.dependencies.log.info(
    `Expired pull requests: ${pullRequests.length}`
  );
  environment.dependencies.log.debug(
    `Expired pull requests: ${JSON.stringify(pullRequests)}`
  );
  const usersByLogin = await getUsersByLogin(environment, pullRequests);
  environment.dependencies.log.debug(
    `Users by login: ${JSON.stringify(usersByLogin)}`
  );
  const notifications = buildNotificationsFrom(pullRequests, usersByLogin);
  environment.dependencies.log.info(
    `Notifications: ${JSON.stringify(notifications)}`
  );
  return notifications;
};
