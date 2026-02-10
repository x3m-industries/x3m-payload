# @x3m-industries/lib-services

## 2.2.0

### Minor Changes

- fcc0216: **DX Improvements**: Implemented zero-boilerplate configuration pattern.
  - Added `InferServiceFromConfig` and `InferGlobalServiceFromConfig` helpers.
  - Added `InferServiceType` and `InferGlobalServiceType` helpers.
  - Removed the need for module augmentation or manual type declarations.
  - Updated `CollectionConfig` and `GlobalConfig` types to support `satisfies` pattern with full type inference.

## 2.1.2

### Patch Changes

- 42f76d5: fix: rebuild packages with dist folder

  This release includes the compiled dist folder that was missing from previous versions.

## 2.1.1

### Patch Changes

- ae8deed: fix: include dist folder in published packages

  Previously the packages were published without the built dist folder,
  causing "Cannot find module" errors when importing from npm.

## 2.1.0

### Minor Changes

- 61e5275: Implemented caching support using Next.js `use cache` directive.
  - Added `cachedFn` wrapper with support for `cacheLife`, `cacheTag`, and `revalidateTag`.
  - Updated `CollectionService` and `GlobalService` to use caching for read operations.
  - Introduced `service: true` shorthand for default service configuration.
  - Improved validation and type safety.

### Patch Changes

- e5c3195: Improve Developer Experience: Added Code of Conduct, Demo documentation, and Quick Start guide.

## 2.0.0

### Major Changes

- 6d24c95: packed new fields and extended testing

## 1.0.0

### Major Changes

- 974df9f: Initial release
