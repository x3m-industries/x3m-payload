# @x3m-industries/lib-services

Type-safe service factory for interacting with Payload CMS collections.

## Features

- **Type-safe Wrappers**: Wraps Payload's Local API with strict typing for specific collections.
- **Lazy Initialization**: Delays database connection until method calls, preventing cold-start issues.
- **Extensible**: Easily add custom methods (e.g., `findVerifiedUsers`) while keeping access to the typed `payload` instance.
- **Standardized CRUD**: Comes with typed `createOne`, `findMany` and `findOneByID` out of the box.

## Installation

```bash
yarn add @x3m-industries/lib-services
```

## Usage

### 1. Define a Service

Create a service instance for your collection. We recommend exporting purely the service instance to keep your codebase clean.

```typescript
// packages/your-package/src/services/todos.ts
import { createCollectionService } from '@x3m-industries/lib-services';

import { getPayload } from '../utils/get-payload';

// Your Payload getter

export const todoService = createCollectionService({
  collection: 'todos',
  getPayload,

  // Optional: Add custom methods
  extensions: (context) => ({
    async findCompleted() {
      const payload = await context.getPayload();
      return payload.find({
        collection: context.collection,
        where: {
          completed: {
            equals: true,
          },
        },
      });
    },
  }),
});
```

### 2. Use the Service

Use the service in your application logic, API routes, or Server Components.

```typescript
import { todoService } from './services/todos';

// Standard Method (Type-safe creation)
const newTodo = await todoService.createOne({
  data: {
    title: 'Buy milk',
    completed: false,
  },
});

// Find Many (Typed return)
const todos = await todoService.findMany({
  where: {
    title: { contains: 'milk' },
  },
});

// Custom Extension Method
const completedTodos = await todoService.findCompleted();
```

## API Reference

### `createCollectionService(props)`

Creates a typed service instance.

#### Props

| Property     | Type                     | Description                                                          |
| ------------ | ------------------------ | -------------------------------------------------------------------- |
| `collection` | `CollectionSlug`         | The slug of the collection (e.g., `'users'`, `'posts'`).             |
| `getPayload` | `() => Promise<Payload>` | A function that returns a Promise resolving to the Payload instance. |
| `extensions` | `(ctx) => Methods`       | (Optional) A function to extend the service with custom methods.     |

#### Extension Context

The `extensions` function receives a context object:

```typescript
{
  collection: TSlug; // The collection slug
  getPayload: () => Promise<Payload>; // The payload getter
}
```
