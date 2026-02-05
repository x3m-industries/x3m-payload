import { getPayload } from 'payload';

import { describe, expect, it, vi } from 'vitest';

import { getPayloadWithServices } from './get-payload-with-services.js';
import type { ServicesMap } from './types.js';

// Mock payload
vi.mock('payload', () => ({
  getPayload: vi.fn(),
}));

describe('getPayloadWithServices', () => {
  it('should return payload with services type assertion', async () => {
    const mockPayload = { services: {} };
    vi.mocked(getPayload).mockResolvedValue(mockPayload as any);

    const config = Promise.resolve({} as any);
    const result = await getPayloadWithServices<ServicesMap>(config);

    expect(getPayload).toHaveBeenCalledWith({ config });
    expect(result).toBe(mockPayload);
  });
});
