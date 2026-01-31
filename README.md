# @x3m-industries/payload

[![codecov](https://codecov.io/gh/x3m-industries/x3m-payload/graph/badge.svg?token=CODECOV_TOKEN)](https://codecov.io/gh/x3m-industries/x3m-payload)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Turborepo](https://img.shields.io/badge/built%20with-turborepo-ef4045)](https://turbo.build/repo)
payloadx3m
**The Ultimate Payload CMS Utility Belt for High-Performance Teams.** 🚀

A battle-tested monorepo containing a suite of robust fields, type-safe global services, and essential utilities designed to supercharge your [Payload CMS](https://payloadcms.com) development. Stop rewriting boilerplate and start building features.

---

## ⚡️ Why x3m-payload?

- **🛡️ Production-Ready Fields:** Don't reinvent the wheel. Use our pre-validated fields for VAT (EU), International Phone Numbers, Addresses, Slugs, and more.
- **🔌 Type-Safe Service Factory:** Generate fully typed Local API services for your Collections and Globals in seconds. No more magic strings or unsafe casting.
- **🚀 Scalable Architecture:** Built on a modern Turborepo stack, optimized for DX and performance.
- **✅ Strictly Typed:** 100% TypeScript. We don't just "support" types; we enforce them.

---

## 📦 The Toolkit

### 1. [@x3m-industries/lib-fields](./packages/lib-fields)

_The fields you wish Payload came with by default._

Stop worrying about validation regexes and formatting logic.

- **`idField`**: Smart, auto-generated IDs with prefixing support. Types: `uuid`, `uuidv7`, `nanoid`, `ulid`, `cuid2`, `custom`.
- **`phoneField`**: Parsing, validation, and formatting for international numbers (based on `libphonenumber-js`).
- **`vatField`**: EU VAT number validation with format and checksum validation.
- **`slugField`**: Automatic, localized slug generation with locking mechanisms.
- **`addressField`**: A complete address group including street, city, state, zip, and country.
- **`countryField`**: A select field with a pre-filled list of all countries.
- **`emailField`**: Email validation with options to restrict specific domains.
- **`urlField`**: URL validation with protocol enforcement (http/https).
- **`numberField`**: Numeric field with formatting options.

### 2. [@x3m-industries/lib-services](./packages/lib-services)

_The missing link between your custom code and Payload's Local API._

Instantly generate type-safe CRUD services for your collections and globals.

- **Generic Collection Service**: `findMany`, `findOneByID`, `createOne` — all strongly typed to your Payload Config.
- **Global Service**: strict access to your Globals.
- **Error Handling**: Standardized error wrapping and query suggestions.

---

## 🚀 Quick Start

### Installation

```bash
yarn add @x3m-industries/lib-fields @x3m-industries/lib-services
```

### Usage Examples

#### Adding Supercharged Fields

```typescript
// src/collections/Customers.ts
import { CollectionConfig } from 'payload';

import { addressField, idField, phoneField, vatField } from '@x3m-industries/lib-fields';

export const Customers: CollectionConfig = {
  slug: 'customers',
  fields: [
    idField({ config: { type: 'uuid' } }),
    phoneField({ overrides: { name: 'mobile', required: true } }),
    vatField({ overrides: { name: 'vatNumber' } }),
    addressField({ overrides: { address: { name: 'billingAddress' } } }),
  ],
};
```

#### Creating a Type-Safe Service

```typescript
// src/services/customer-service.ts
import { getPayload } from 'payload';

import config from '@payload-config';

import { createCollectionService } from '@x3m-industries/lib-services';

export const CustomerService = createCollectionService({
  collection: 'customers',
  getPayload: () => getPayload({ config }),
});

// Usage elsewhere in your app:
// No more manual "collection: 'customers'" or casting results!
const unitedStatesCustomers = await CustomerService.findMany({
  where: {
    'billingAddress.country': { equals: 'US' },
  },
});
```

---

## 🛠️ Development

This repository uses **Yarn** and **Turborepo**.

### Prerequisites

- Node.js (v18+)
- Yarn (v4.12.0)

### Setup

```bash
yarn install
```

### Commands

| Command          | Description                                      |
| :--------------- | :----------------------------------------------- |
| `yarn dev`       | Start development mode (watch mode + dev server) |
| `yarn build`     | Build all packages/apps                          |
| `yarn lint`      | Run ESLint across all packages                   |
| `yarn typecheck` | Run TypeScript validation                        |
| `yarn test`      | Run unit tests via Vitest                        |

---

## 📦 Publishing

We use **Changesets** for automated semantic versioning.

1.  **Work:** Make your changes.
2.  **Document:** Run `yarn changeset` to create a release note.
3.  **Push:** Commit and push.
4.  **Release:** When the PR is merged, GitHub Actions publishes to npm.

---

## 📄 License

MIT © [X3M Industries](https://x3m.industries)
