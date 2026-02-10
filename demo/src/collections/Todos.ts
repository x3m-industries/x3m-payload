import type { Payload } from 'payload';

import type { CollectionConfig } from '@x3m-industries/lib-services';

import type { Todo } from '../payload-types';

export const todosExtensions = ({
  getPayload,
  collection,
}: {
  getPayload: () => Promise<Payload>;
  collection: 'todos';
}) => ({
  async toggleComplete({ id }: { id: string }) {
    const payload = await getPayload();
    const todo = await payload.findByID({ collection, id });
    return payload.update({
      collection,
      id,
      data: { completed: !(todo as unknown as Todo).completed },
    });
  },
});

export const Todos = {
  slug: 'todos' as const,
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
  service: {
    cache: { findMany: { life: 'seconds', tags: ['todos'] } },
    extensions: todosExtensions,
  },
} satisfies CollectionConfig;
