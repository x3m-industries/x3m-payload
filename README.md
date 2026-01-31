# @x3m-industries/payload

A high-performance monorepo for Payload CMS libraries and utilities using Turborepo and Yarn.

## Packages

- **[@x3m-industries/lib-services](./packages/lib-services)**:  
  A toolkit for creating type-safe, generic CRUD services around Payload collections.
- **[@x3m-industries/lib-fields](./packages/lib-fields)**:  
  A collection of ready-to-use Payload fields (e.g., Phone, VAT) with validation and formatting logic.

## Getting Started

### Prerequisites

- Node.js (v18+)
- Yarn (v4.12.0)

### Installation

```bash
yarn install
```

### Build

To build all packages:

```bash
yarn build
```

This uses Turborepo to efficiently build dependencies in parallel.

### Development

To start development mode (watch mode + dev server):

```bash
yarn dev
```

### Linting & Formatting

```bash
yarn lint
yarn format
yarn typecheck
```

## Structure

- `packages/lib-services`: Typed service factory via `tsup`.
- `packages/lib-fields`: Reusable fields via `tsup`.
- `packages/lib-tsconfig`: Shared TypeScript configuration.

## Publishing

Packages are versioned independently but managed via this monorepo. Ensure `package.json` versions are updated before publishing.
