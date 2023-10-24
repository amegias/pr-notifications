import { Environment, MatchedTTL } from '../models/models';

export const getTTL = (
  environment: Environment,
  labels: Set<string>
): MatchedTTL => {
  const expirationWithLabel = Array.from(labels).reduce(
    (currentMatch, label) => {
      const labelTTL = environment.inputs.labelsTTL[label];
      if (labelTTL === undefined) return currentMatch;
      if (parseInt(labelTTL) >= currentMatch.ttl) return currentMatch;

      return { ttl: parseInt(labelTTL), label };
    },
    { ttl: Number.MAX_VALUE, label: undefined } as MatchedTTL
  );
  if (expirationWithLabel.label !== undefined) {
    return expirationWithLabel;
  } else {
    const defaultTTL = environment.inputs.defaultTTL
      ? parseInt(environment.inputs.defaultTTL)
      : Number.MAX_VALUE;

    return { ttl: defaultTTL, label: undefined };
  }
};
