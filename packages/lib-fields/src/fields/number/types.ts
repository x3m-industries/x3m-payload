import type { NumericFormatProps } from 'react-number-format';

// Extract only the props we want to expose from react-number-format
// We avoid exposing onValueChange etc as those are internal to the component
export interface NumberFieldConfig extends Partial<
  Pick<
    NumericFormatProps,
    | 'allowNegative'
    | 'decimalScale'
    | 'fixedDecimalScale'
    | 'prefix'
    | 'suffix'
    | 'thousandSeparator'
  >
> {
  /**
   * Currency symbol/code (e.g., '$', '€', 'USD')
   * Only used when type is 'currency'
   */
  currency?: string;
  max?: number;
  min?: number;
  /**
   * Whether to scale the number for storage (avoid floating point issues).
   * If true, keeps decimal precision in UI but stores as integer.
   * e.g. 34.00 -> 3400 (if decimalScale is 2)
   */
  scaling?: boolean;
  /**
   * Type of number field.
   * - 'number': Standard number input
   * - 'currency': distinct currency formatting
   * - 'percentage': stored as 0-1 or 0-100 depending on scaling
   */
  type?: 'currency' | 'number' | 'percentage';
}
