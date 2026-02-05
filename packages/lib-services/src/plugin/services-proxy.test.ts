import { describe, expect, it } from 'vitest';

import { createServicesProxy } from './services-proxy.js';

describe('createServicesProxy', () => {
  const servicesMap = {
    orders: { name: 'OrderService' },
    users: { name: 'UserService' },
  };

  it('should support property access', () => {
    const proxy = createServicesProxy(servicesMap);
    expect(proxy.orders).toBe(servicesMap.orders);
    expect(proxy.users).toBe(servicesMap.users);
  });

  it('should support function call access', () => {
    const proxy = createServicesProxy(servicesMap);
    expect(proxy('orders')).toBe(servicesMap.orders);
    expect(proxy('users')).toBe(servicesMap.users);
  });

  it('should return undefined for non-existent properties', () => {
    const proxy = createServicesProxy(servicesMap);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    expect((proxy as any).nonExistent).toBeUndefined();
  });
});
