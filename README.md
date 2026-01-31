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

This monorepo uses **Changesets** and **GitHub Actions** for automated versioning and publishing to npm.

### Automated Release Flow

1.  **Add a Changeset**: When your feature is ready, run:

    ```bash
    yarn changeset
    ```

    Follow the prompts to select packages and the version bump type (patch/minor/major).

2.  **Commit and Push**: Commit the generated `.changeset/*.md` file and push to `main`.
    - This will trigger a GitHub Action that opens a **"Version Packages"** Pull Request.

3.  **Merge the Version PR**: Once you merge the "Version Packages" PR into `main`, the libraries will be automatically built and published to the `@x3m-industries` organization on npm.

### Security (OIDC)

We use **npm Trusted Publishers (OIDC)**. There are no long-lived npm tokens in the repository. Authentication is handled securely via a short-lived handshake between GitHub Actions and npmjs.org.
