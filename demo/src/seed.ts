import type { Payload } from 'payload';

import { devUser } from './helpers/credentials';

export const seed = async (payload: Payload) => {
  const { totalDocs } = await payload.count({
    collection: 'users',
    where: {
      email: {
        equals: devUser.email,
      },
    },
  });

  if (!totalDocs) {
    await payload.create({
      collection: 'users',
      data: devUser,
    });

    // Create a demo todo using the new service structure if collection exists
    if (payload.collections['todos']) {
      await payload.create({
        collection: 'todos',
        data: {
          title: 'Check out the new Plugin Mode!',
          completed: false,
        },
      });
    }
  }
};
