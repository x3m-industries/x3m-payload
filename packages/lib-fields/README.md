# @x3m-industries/lib-fields

A collection of high-quality, pre-configured fields for Payload CMS.

## Features

- **Phone Field**: Validates and stores phone numbers in international format (E.164) using `libphonenumber-js`.
- **VAT Field**: Validates European VAT numbers using `jsvat`.

## Installation

```bash
yarn add @x3m-industries/lib-fields
```

## Usage

### Phone Field

```typescript
import { phoneField } from '@x3m-industries/lib-fields';

// In your Collection Config
const Users = {
  slug: 'users',
  fields: [
    ...phoneField({
      overrides: {
        name: 'mobileNumber',
        label: 'Mobile Number',
        required: true,
      },
      config: {
        defaultCountry: 'FR', // Default to France if no country code provided
      },
    }),
  ],
};
```

### VAT Field

```typescript
import { vatField } from '@x3m-industries/lib-fields';

// In your Collection Config
const Companies = {
  slug: 'companies',
  fields: [
    ...vatField({
      overrides: {
        name: 'vatId',
        required: true,
      },
      config: {
        countries: ['DE', 'FR', 'NL'], // Limit validation to specific countries
      },
    }),
  ],
};
```

## API

### `phoneField(props)`

Returns a Payload Field array containing the phone field.

- `overrides`: Payload `TextField` options (e.g., `name`, `label`, `required`).
- `config`:
  - `defaultCountry`: (Optional) ISO 3166-1 alpha-2 code (e.g., 'US') for parsing national numbers.

### `vatField(props)`

Returns a Payload Field array containing the VAT field.

- `overrides`: Payload `TextField` options.
- `config`:
  - `countries`: (Optional) Array of standard VAT country codes to validate against.
