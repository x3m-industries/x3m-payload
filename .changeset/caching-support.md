---
'@x3m-industries/lib-services': minor
---

Implemented caching support using Next.js `use cache` directive.

- Added `cachedFn` wrapper with support for `cacheLife`, `cacheTag`, and `revalidateTag`.
- Updated `CollectionService` and `GlobalService` to use caching for read operations.
- Introduced `service: true` shorthand for default service configuration.
- Improved validation and type safety.
