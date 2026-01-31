import type { CollectionConfig } from 'payload';

export const Todos: CollectionConfig = {
  slug: 'todos',
  admin: {
    useAsTitle: 'title',
  },
  fields: [
    {
      name: 'title',
      type: 'text',
      required: true,
    },
    {
      name: 'completed',
      type: 'checkbox',
      defaultValue: false,
    },
  ],
};
