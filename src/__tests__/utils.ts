import { Environment } from '../models/models';

export const testEnvironment = (): Environment => ({
  dependencies: {
    ghClient: {
      request: jest.fn()
    },
    log: {
      debug: jest.fn(),
      info: jest.fn(),
      error: jest.fn(),
      warn: jest.fn()
    },
    now: jest.fn()
  },
  inputs: {
    repoOwner: 'anyOwner',
    repoName: 'anyName',
    pullRequestNumber: '2',
    labelsTTL: {}
  }
});
