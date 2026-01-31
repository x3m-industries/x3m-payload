/**
 * Ensures the input is a string and trims whitespace.
 * Returns an empty string if the input is null, undefined, or not a string.
 * This helper is designed to work seamlessly with native string methods.
 */
export const normalizeString = (value: unknown): string => {
  if (typeof value === 'string') {
    return value.trim();
  }
  return '';
};
