import { getPayload } from 'payload';

import { createCollectionService } from '@x3m-industries/lib-services';

import configPromise from '../payload.config';

export const todoService = createCollectionService({
  collection: 'todos',
  getPayload: async () => await getPayload({ config: configPromise }),
});
