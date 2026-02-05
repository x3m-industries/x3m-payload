# @x3m-industries/payload

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0+-blue.svg)](https://www.typescriptlang.org/)
[![Payload CMS](https://img.shields.io/badge/Payload%20CMS-3.x-purple.svg)](https://payloadcms.com/)

**The missing pieces for Payload CMS.** Type-safe services, production-ready fields, zero boilerplate.

---

## Why This Exists

Every Payload project ends up with the same problems:

❌ **Unsafe API calls** — Magic strings everywhere, no autocomplete  
❌ **Custom field validation** — Rewriting phone/VAT/address logic for the 10th time  
❌ **Scattered business logic** — Service methods spread across random files

**This toolkit solves all three.**

---

## 🚀 Quick Start (Demo)

Want to see it in action? Run the local demo in 2 minutes.

```bash
# 1. Clone the repo
git clone https://github.com/x3m-industries/x3m-payload.git
cd x3m-payload

# 2. Install dependencies
yarn install

# 3. Start the demo
yarn demo
```

Open [http://localhost:3000](http://localhost:3000) to explore the admin UI and frontend.

---

## 🔌 Plugin Mode: The Game Changer

Define services directly on your collections. Access them from `payload.services`. Fully typed.

```typescript
// payload.config.ts
import { servicesPlugin } from '@x3m-industries/lib-services';

export default buildConfig({
  plugins: [servicesPlugin()],
  collections: [Orders, Customers],
  globals: [Settings],
});
```

```typescript
// collections/Orders.ts
export const Orders: CollectionConfig = {
  slug: 'orders',
  fields: [...],
  service: {
    extensions: ({ getPayload, collection }) => ({
      async markShipped({ id }: { id: string }) {
        const payload = await getPayload();
        return payload.update({ collection, id, data: { status: 'shipped' } });
      },
    }),
    cache: { findMany: { life: 'hours', tags: ['orders'] } }, // "use cache"
  },
};
```

```typescript
// collections/Customers.ts
// Just standard CRUD? No problem.
export const Customers: CollectionConfig = {
  slug: 'customers',
  fields: [...],
  service: true, // Auto-enable default CRUD service
};
```

```typescript
// Anywhere in your app
const payload = await getPayloadWithServices(config);

// Default CRUD — fully typed
await payload.services.orders.findMany({ where: { status: { equals: 'pending' } } });
await payload.services.orders.findOneById({ id: '123' });

// Custom methods — fully typed
await payload.services.orders.markShipped({ id: '123' });

// Dynamic access
await payload.services('orders').createOne({ data: {...} });
```

**No casting. No magic strings. Full autocomplete.**

---

## 🛡️ Production Fields, Out of the Box

Stop rewriting validation logic. These fields work correctly the first time.

```typescript
import { addressField, idField, phoneField, vatField } from '@x3m-industries/lib-fields';

export const Customers: CollectionConfig = {
  slug: 'customers',
  fields: [
    idField({ config: { type: 'uuidv7' } }), // Auto-generated, prefixed IDs
    phoneField({ overrides: { name: 'mobile' } }), // libphonenumber-js validation
    vatField({ overrides: { name: 'vatNumber' } }), // EU VAT checksum validation
    addressField(), // Complete address group
  ],
};
```

| Field          | What It Does                                           |
| -------------- | ------------------------------------------------------ |
| `idField`      | Auto-generated IDs (uuid, uuidv7, nanoid, ulid, cuid2) |
| `phoneField`   | International phone validation via libphonenumber-js   |
| `vatField`     | EU VAT validation with format + checksum               |
| `addressField` | Street, city, state, zip, country — one line           |
| `slugField`    | Auto-generated slugs with localization + locking       |
| `emailField`   | Email validation with domain restrictions              |
| `urlField`     | URL validation with protocol enforcement               |
| `countryField` | Pre-filled country select                              |

---

## 📦 Installation

```bash
# Fields
yarn add @x3m-industries/lib-fields

# Services
yarn add @x3m-industries/lib-services
```

---

## 📚 Documentation

Full API documentation in each package:

- **[lib-fields](./packages/lib-fields/README.md)** — Field configuration, validation options, customization
- **[lib-services](./packages/lib-services/README.md)** — Plugin setup, extensions, disable methods, type safety

---

## 🛠️ Development

```bash
yarn install      # Install dependencies
yarn dev          # Development mode
yarn validate     # Build + lint + typecheck + test
```

---

## 📄 License

MIT © [X3M Industries](https://x3m.industries)
