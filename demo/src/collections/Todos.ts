import type { CollectionConfig, Payload } from 'payload';

import type { DefaultCollectionService } from '@x3m-industries/lib-services';

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

/** Full service type for todos - use with getPayloadWithServices<{ todos: TodosService }>() */
export type TodosService = DefaultCollectionService<'todos'> & ReturnType<typeof todosExtensions>;

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
  service: {
    cache: { findMany: { life: 'seconds', tags: ['todos'] } },
    extensions: todosExtensions,
  },
} as unknown as CollectionConfig;
