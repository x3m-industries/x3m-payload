/**
 * Creates a proxy that supports both property access and function call patterns.
 *
 * @example
 * // Property access
 * payload.services.orders.findMany()
 *
 * // Function call
 * payload.services('orders').findMany()
 */
export function createServicesProxy<TServices extends object>(
  servicesMap: TServices
): { (slug: keyof TServices): TServices[keyof TServices] } & TServices {
  const handler: ProxyHandler<(slug: keyof TServices) => TServices[keyof TServices]> = {
    // Handle: payload.services.orders
    get(_target, prop) {
      if (typeof prop === 'string' && prop in servicesMap) {
        return (servicesMap as any)[prop];
      }
      return undefined;
    },
    // Handle: payload.services('orders')
    apply(_target, _thisArg, args) {
      const [slug] = args as [keyof TServices];
      return servicesMap[slug];
    },
  };

  // Create a callable function that also has properties
  const callable = function (slug: keyof TServices) {
    return servicesMap[slug];
  };

  return new Proxy(callable, handler) as {
    (slug: keyof TServices): TServices[keyof TServices];
  } & TServices;
}
