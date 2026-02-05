---
'@x3m-industries/lib-fields': patch
'@x3m-industries/lib-services': patch
---

fix: include dist folder in published packages

Previously the packages were published without the built dist folder,
causing "Cannot find module" errors when importing from npm.
