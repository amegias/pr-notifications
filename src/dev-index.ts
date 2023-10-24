/* eslint-disable no-console */
import { DateTime } from 'luxon';
import { Octokit } from 'octokit';
import { getNotifications } from './get-notifications';
import { Environment } from './models/models';
import * as dotenv from 'dotenv';
dotenv.config();

const devRun = async (): Promise<void> => {
  const environment: Environment = {
    dependencies: {
      ghClient: {
        request: async <T>(path: string, options?: {}) => {
          const octokit = new Octokit({
            auth: process.env.ACCESS_TOKEN
          });
          const response = await octokit.request(path, options);
          return response as T;
        }
      },
      log: {
        debug: (message) => console.debug(`${message}\n`),
        info: (message) => console.info(`${message}\n`),
        error: (message) => console.error(`${message}\n`),
        warn: (message) => console.warn(`${message}\n`)
      },
      now: () => DateTime.now()
    },
    inputs: {
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      repoOwner: process.env.REPO_OWNER!,
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      repoName: process.env.REPO_NAME!,
      labelsTTL: process.env.LABELS_TTL
        ? JSON.parse(process.env.LABELS_TTL)
        : {},
      defaultTTL: process.env.DEFAULT_TTL,
      pullRequestNumber: process.env.PULL_REQUEST_NUMBER,
      labelToSkipPR: process.env.LABEL_TO_SKIP_PR
    }
  };
  const notifications = await getNotifications(environment);
  environment.dependencies.log.debug(
    `Notifications: ${JSON.stringify(notifications, undefined, 2)}`
  );
};

devRun();
