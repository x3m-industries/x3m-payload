# Agent and Developer Guidelines

Welcome to the **x3m-payload** monorepo. This document provides technical context and guidelines for AI agents and human developers working on this codebase.

## Project Overview

This is a **Payload CMS** ecosystem monorepo. It focus on reusable fields, services, and configurations. It is designed for high performance and strict type safety.

## Tech Stack

- **Monorepo Management**: [Turborepo](https://turbo.build/) + [Yarn 4 (Berry)](https://yarnpkg.com/)
- **Build System**: [tsup](https://tsup.egoist.dev/) (ESM + CJS + DTS)
- **Language**: [TypeScript](https://www.typescriptlang.org/) (Strict mode)
- **Testing**: [Vitest](https://vitest.dev/)
- **Linting**: [ESLint](https://eslint.org/) (Project-specific configs)
- **Publishing**: [Changesets](https://github.com/changesets/changesets) + npm Trusted Publishers (OIDC)

## Directory Structure

```text
.
├── .changeset/         # Versioning and release notes configuration
├── .github/workflows/  # Consolidated CI/CD (main.yml)
├── internal/           # Local shared configs (not for npm)
│   ├── lib-eslint/     # Shared ESLint rules
│   ├── lib-testing/    # Shared Vitest setup
│   └── lib-tsconfig/   # Shared TS base configs
└── packages/           # Public npm libraries
    ├── lib-fields/     # Reusable Payload field components
    └── lib-services/   # Payload collection/global service factories
```

## Development Workflow

### 1. Conventions

- **Commits**: Follow [Conventional Commits](https://www.conventionalcommits.org/) (e.g., `feat: description`, `fix: description`).
- **File Naming**: Use kebab-case for directories and files (e.g., `src/fields/address/field.ts`).
- **Imports**: Use full extensions in imports (e.g., `import { foo } from './bar.js'`) as required by ESM.

### 2. Common Commands

- `yarn install`: Install dependencies (managed by Corepack).
- `yarn build`: Build all packages.
- `yarn test`: Run all tests.
- `yarn validate`: Run formatting check, build, lint, typecheck, and tests in sequence.
- `yarn changeset`: Prepare a new version and changelog.

### 3. Adding a New Field

New fields in `lib-fields` should:

1.  Be placed in `packages/lib-fields/src/fields/<name>/`.
2.  Include a `field.ts` (configuration) and optionally a `field.test.ts`.
3.  Use `normalizeString` from `utils/` for string cleaning.
4.  Be exported from `packages/lib-fields/src/index.ts`.

## Release Process

We use an automated pipeline:

1.  Developer runs `yarn changeset` and commits the resulting `.md` file.
2.  GitHub Action opens a "Version Packages" PR.
3.  Merging that PR to `main` triggers a secure OIDC publish to `@x3m-industries` on npm.

## Core Principles

1.  **Strict Typing**: Avoid `any` or `unknown` in business logic.
2.  **Modularity**: Keep fields and services decoupling from specific Payload configurations where possible.
3.  **Validation**: Always validate input strings (using `normalizeString`) before they reach Payload hooks.
4.  **Premium Aesthetics**: UI components for fields should follow modern design standards.
