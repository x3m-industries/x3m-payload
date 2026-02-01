import type { Validate } from 'payload';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const validateWithHasMany = (validator: (value: any, args: any) => any): Validate => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return async (value: unknown, args: any) => {
    if (Array.isArray(value)) {
      const results = await Promise.all(value.map((v) => validator(v, args)));
      const error = results.find((result) => result !== true);
      return error || true;
    }
    return validator(value, args);
  };
};
