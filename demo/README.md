# @x3m-industries/demo

A Next.js 14 + Payload CMS demo application showcasing the capabilities of `@x3m-industries/payload` packages.

## Features

- **Typed Services**: Demonstrates `lib-services` for type-safe local API calls.
- **Production Fields**: Shows usage of `lib-fields` like verified phone numbers and VAT IDs.
- **E2E Testing**: Includes Playwright tests for validating critical flows.

## Prerequisites

- Node.js 18+
- Yarn 4
- Docker (optional, if running a local database container manually, though this demo uses in-memory or file-based SQLite by default for simplicity)

## Getting Started

1.  **Install dependencies** (from root):

    ```bash
    yarn install
    ```

2.  **Run the development server**:

    ```bash
    # From root
    yarn demo

    # OR from this directory
    yarn dev
    ```

3.  **Open the app**:
    - Admin UI: [http://localhost:3000/admin](http://localhost:3000/admin)
    - Front-end: [http://localhost:3000](http://localhost:3000)

## Project Structure

- `src/payload.config.ts`: Main Payload configuration.
- `src/app`: Next.js App Router structure.
- `src/collections`: Demo collections (e.g. `Users`, `Todos`) implementing the library features.

## Testing

Run the end-to-end tests to verify the demo functionality:

```bash
yarn test:e2e
```
