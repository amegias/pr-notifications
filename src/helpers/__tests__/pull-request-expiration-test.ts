import { DateTime } from 'luxon';
import { buildPullRequest } from '../../__tests__/mother';
import { testEnvironment } from '../../__tests__/utils';
import { isPullRequestExpired } from '../pull-request-expiration';

const NOW = '2023-01-25T00:00:00Z';
const DEFAULT_TTL = `${3600 * 3}`; // 3h
const TAGS_TTL = {
  label1: `${3600 * 2}`, // 2h
  label2: `${3600}` // 1h
};
const LABEL1 = 'label1';
const LABEL2 = 'label2';

describe('isPullRequestExpired', () => {
  test.each([
    ['2023-01-24T23:00:00Z', [LABEL1, LABEL2], DEFAULT_TTL, false],
    ['2023-01-24T22:59:59Z', [LABEL1, LABEL2], DEFAULT_TTL, true],
    ['2023-01-24T22:59:59Z', [LABEL1, LABEL2], undefined, true],
    ['2023-01-24T22:59:59Z', [LABEL1], DEFAULT_TTL, false],
    ['2023-01-24T21:59:59Z', [LABEL1], DEFAULT_TTL, true],
    ['2023-01-24T21:59:59Z', [], DEFAULT_TTL, false],
    ['2023-01-24T20:59:59Z', [], DEFAULT_TTL, true],
    ['2023-01-20T20:59:59Z', [], DEFAULT_TTL, true],
    ['2023-01-20T20:59:59Z', [], undefined, false],
    ['2023-01-26T00:00:00Z', [], DEFAULT_TTL, false]
  ])(
    'Given createdAt: %p with labels: %o => isExpired: %p',
    (createdAt, labels, defaultTTL, expected) => {
      const environment = testEnvironment();
      jest
        .spyOn(environment.dependencies, 'now')
        .mockReturnValue(DateTime.fromISO(NOW));
      environment.inputs.labelsTTL = TAGS_TTL;
      environment.inputs.defaultTTL = defaultTTL;
      const pullRequest = buildPullRequest(
        1,
        new Set(labels),
        [],
        false,
        'open',
        createdAt
      );

      const isExpired = isPullRequestExpired(environment, pullRequest);

      expect(isExpired).toBe(expected);
    }
  );
});
