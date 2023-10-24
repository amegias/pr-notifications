import { testEnvironment } from '../../__tests__/utils';
import { getTTL } from '../get-ttl';

describe('getTTL', () => {
  it('No labels matched nor default ttl returns max value', async () => {
    const environment = testEnvironment();
    environment.inputs.defaultTTL = undefined;
    environment.inputs.labelsTTL = {
      label1: '1000',
      label2: '2000'
    };
    const labels = new Set(['label3', 'label4', 'label5']);

    const result = getTTL(environment, labels);

    expect(result).toStrictEqual({ ttl: Number.MAX_VALUE, label: undefined });
  });

  it('No labels matched returns default ttl', async () => {
    const environment = testEnvironment();
    environment.inputs.defaultTTL = '999';
    environment.inputs.labelsTTL = {
      label1: '1000',
      label2: '2000'
    };
    const labels = new Set(['label3', 'label4', 'label5']);

    const result = getTTL(environment, labels);

    expect(result).toStrictEqual({ ttl: 999, label: undefined });
  });

  it('Labels matched returns their min ttl', async () => {
    const environment = testEnvironment();
    environment.inputs.defaultTTL = '999';
    environment.inputs.labelsTTL = {
      label1: '1000',
      label2: '2000',
      label3: '3000'
    };
    const labels = new Set(['label4', 'label3', 'label2']);

    const result = getTTL(environment, labels);

    expect(result).toStrictEqual({ ttl: 2000, label: 'label2' });
  });
});
