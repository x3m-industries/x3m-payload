# @x3m-industries/lib-fields

A collection of high-quality, pre-configured fields for Payload CMS.

> **Need type-safe services?** Check out [@x3m-industries/lib-services](../lib-services/README.md) for fully typed local API wrappers.

## Features

- **Number Field**: Validates numbers with min/max constraints and formatting (prefix, suffix, thousand separator)
- **ID Field**: Generate unique identifiers with support for UUID v4/v7, ULID, NanoID, CUID2, or custom formats
- **Phone Field**: Validates and stores phone numbers in international format (E.164) using `libphonenumber-js`
- **VAT Field**: Validates European VAT numbers using `jsvat`
- **Address Field**: Complete address input with country, city, state, and postal code
- **Country Field**: Country selector with emoji flags and priority countries
- **URL Field**: Validates URLs with support for social media profiles (Facebook, Instagram, LinkedIn, X, TikTok, YouTube, WhatsApp)

## Installation

```bash
yarn add @x3m-industries/lib-fields
```

## Usage

### ID Field

Generate unique identifiers automatically with various ID type support:

```typescript
import { idField } from '@x3m-industries/lib-fields';

const Posts = {
  slug: 'posts',
  fields: [
    ...idField({
      config: {
        type: 'nanoid', // 'uuid' | 'uuidv7' | 'ulid' | 'nanoid' | 'cuid2' | 'custom'
        managed: true, // System-managed (prevents manual editing)
        immutable: true, // Cannot be changed after creation
      },
      overrides: {
        name: 'postId',
        label: 'Post ID',
      },
    }),
  ],
};
```

**Standalone ID Generation:**

```typescript
import { generateId } from '@x3m-industries/lib-fields';

const id = generateId({ type: 'nanoid', count: 12 });
const uuid = generateId({ type: 'uuid' });
const customId = generateId({
  type: 'custom',
  prefix: 'user_',
  count: 16,
  avoidConfusingChars: true,
});
```

### Phone Field

```typescript
import { phoneField } from '@x3m-industries/lib-fields';

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

### Address Field

```typescript
import { addressField } from '@x3m-industries/lib-fields';

const Customers = {
  slug: 'customers',
  fields: [
    ...addressField({
      config: {
        country: {
          allowedCountries: ['US', 'CA', 'GB'],
          priorityCountries: ['US'],
        },
      },
    }),
  ],
};
```

### Country Field

```typescript
import { countryField } from '@x3m-industries/lib-fields';

const Stores = {
  slug: 'stores',
  fields: [
    ...countryField({
      config: {
        allowedCountries: ['US', 'CA', 'MX'],
        priorityCountries: ['US', 'CA'],
      },
      overrides: {
        required: true,
      },
    }),
  ],
};
```

### URL Field

```typescript
import { urlField } from '@x3m-industries/lib-fields';

const SocialProfiles = {
  slug: 'profiles',
  fields: [
    ...urlField({
      config: {
        type: 'instagram', // 'url' | 'website' | 'facebook' | 'instagram' | 'linkedin' | 'x' | 'tiktok' | 'youtube' | 'whatsapp'
        isAccount: true, // Validate as profile URL
        https: true, // Enforce HTTPS
      },
      overrides: {
        name: 'instagramProfile',
      },
    }),
  ],
};
```

## API

### `idField(props)`

Returns a Payload Field array containing the ID field.

- `overrides`: Payload `TextField` options (e.g., `name`, `label`, `required`)
- `config`:
  - `type`: ID format - `'uuid'` (default) | `'uuidv7'` | `'ulid'` | `'nanoid'` | `'cuid2'` | `'custom'`
  - `managed`: System-managed field (default: `true`)
  - `immutable`: Cannot be changed after creation (default: `true`)
  - `prefix`: Custom prefix (only for `type: 'custom'`)
  - `suffix`: Custom suffix (only for `type: 'custom'`)
  - `count`: Number of characters (for custom/nanoid)
  - `avoidConfusingChars`: Avoid O/0/I/1/L/l (default: `true` for custom)

### `phoneField(props)`

Returns a Payload Field array containing the phone field.

- `overrides`: Payload `TextField` options (e.g., `name`, `label`, `required`)
- `config`:
  - `defaultCountry`: (Optional) ISO 3166-1 alpha-2 code (e.g., 'US') for parsing national numbers

### `vatField(props)`

Returns a Payload Field array containing the VAT field.

- `overrides`: Payload `TextField` options
- `config`:
  - `countries`: (Optional) Array of standard VAT country codes to validate against

### `addressField(props)`

Returns a Payload Field array containing the address group field.

- `overrides`: Separate overrides for each subfield (`address`, `line1`, `line2`, `city`, `state`, `zip`, `country`)
- `config`:
  - `country`: Configuration for the country subfield

### `countryField(props)`

Returns a Payload Field array containing the country field.

- `overrides`: Payload `TextField` options
- `config`:
  - `allowedCountries`: (Optional) Restrict to specific country codes
  - `priorityCountries`: (Optional) Show these countries at the top

### `urlField(props)`

Returns a Payload Field array containing the URL field.

- `overrides`: Payload `TextField` options
- `config`:
  - `type`: URL type - `'url'` | `'website'` | `'facebook'` | `'instagram'` | `'linkedin'` | `'x'` | `'tiktok'` | `'youtube'` | `'whatsapp'`
  - `isAccount`: Validate as account/profile URL (default: `false`)
  - `https`: Enforce HTTPS protocol (default: `true`)
  - `regex`: Custom validation regex

### `numberField(props)`

Returns a Payload Field array containing the number field.

- `overrides`: Payload `NumberField` options
- `config`:
  - `min`: Minimum value
  - `max`: Maximum value
  - ...and all `react-number-format` props (e.g., `prefix`, `suffix`, `thousandSeparator`, `decimalScale`)
