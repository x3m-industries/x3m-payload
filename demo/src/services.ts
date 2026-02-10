import configPromise from '@payload-config';

import {
  InferGlobalServiceFromConfig,
  InferServiceFromConfig,
  getPayloadWithServices,
} from '@x3m-industries/lib-services';

import { Todos } from './collections/Todos';
import { Settings } from './globals/Settings';

export type AppServices = {
  [Todos.slug]: InferServiceFromConfig<typeof Todos>;
  [Settings.slug]: InferGlobalServiceFromConfig<typeof Settings>;
};

export const getPayload = () => getPayloadWithServices<AppServices>(configPromise);
