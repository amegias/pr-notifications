import { Octokit } from 'octokit';
import { Environment } from './models/models';
import * as core from '@actions/core';
import * as github from '@actions/github';
import { DateTime } from 'luxon';
import { getNotifications } from './get-notifications';

const run = async (): Promise<void> => {
  try {
    const environment: Environment = {
      dependencies: {
        ghClient: {
          request: async <T>(path: string, options?: {}) => {
            const octokit = new Octokit({
              auth: core.getInput('access-token')
            });
            const response = await octokit.request(path, options);
            return response as T;
          }
        },
        log: {
          debug: core.debug,
          info: core.info,
          error: core.error,
          warn: core.warning
        },
        now: () => DateTime.now()
      },
      inputs: {
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        repoOwner: github.context.payload.repository!.owner.login,
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        repoName: github.context.payload.repository!.name,
        labelsTTL: core.getInput('labels-ttl')
          ? JSON.parse(core.getInput('labels-ttl'))
          : {},
        defaultTTL: core.getInput('default-ttl'),
        pullRequestNumber: core.getInput('pull-request-number')
      }
    };
    const notifications = await getNotifications(environment);
    core.setOutput('notifications', notifications);
  } catch (error) {
    core.setFailed(`${error}`);
  }
};

run();
