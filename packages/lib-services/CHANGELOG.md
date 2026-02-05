# @x3m-industries/lib-services

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
