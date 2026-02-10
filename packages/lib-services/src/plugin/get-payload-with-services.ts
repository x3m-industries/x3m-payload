import type { SanitizedConfig } from 'payload';
import { getPayload } from 'payload';

import type { PayloadWithServices, ServiceRegistry, ServicesMap } from './types.js';

/**
 * Type-safe wrapper around `getPayload()` that includes the `.services` property.
 *
 * @param config - The Payload config (or promise of config)
 * @returns Payload instance with typed services
 *
 * @example
 * const payload = await getPayloadWithServices<AppServices>(config);
 * await payload.services.orders.findMany();
 */
export async function getPayloadWithServices<
  TServices extends object = keyof ServiceRegistry extends never ? ServicesMap : ServiceRegistry,
>(config: Promise<SanitizedConfig> | SanitizedConfig): Promise<PayloadWithServices<TServices>> {
  const payload = (await getPayload({ config })) as PayloadWithServices<TServices>;
  return payload;
}
