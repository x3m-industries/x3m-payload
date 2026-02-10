---
'@x3m-industries/lib-services': minor
---

**DX Improvements**: Implemented zero-boilerplate configuration pattern.

- Added `InferServiceFromConfig` and `InferGlobalServiceFromConfig` helpers.
- Added `InferServiceType` and `InferGlobalServiceType` helpers.
- Removed the need for module augmentation or manual type declarations.
- Updated `CollectionConfig` and `GlobalConfig` types to support `satisfies` pattern with full type inference.
