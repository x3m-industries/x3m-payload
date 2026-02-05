import { type Payload, type SanitizedConfig, getPayload } from 'payload';

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
    vi.mocked(getPayload).mockResolvedValue(mockPayload as unknown as Payload);

    const config = Promise.resolve({} as unknown as SanitizedConfig);
    const result = await getPayloadWithServices<ServicesMap>(config);

    expect(getPayload).toHaveBeenCalledWith({ config });
    expect(result).toBe(mockPayload);
  });
});
