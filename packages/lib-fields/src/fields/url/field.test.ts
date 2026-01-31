import { describe, expect, it } from 'vitest';

import { urlField } from './field.js';

const mockArgs = {
  req: {
    payload: {
      config: {
        i18n: {
          fallbackLng: 'en',
        },
      },
    },
    t: (key: string) => key,
  },
  required: true,
} as any;

describe('urlField', () => {
  it('should use defaults for type url', () => {
    const fields = urlField();
    const field = fields[0] as any;
    expect(field.name).toBe('url');
    expect(field.label).toBe('URL');
  });

  it('should use defaults for type facebook', () => {
    const fields = urlField({ config: { type: 'facebook' } });
    const field = fields[0] as any;
    expect(field.name).toBe('facebook');
    expect(field.label).toBe('Facebook URL');
  });

  it('should validate correctly with default regex', async () => {
    const fields = urlField({ config: { type: 'url' } });
    const field = fields[0] as any;

    expect(await field.validate('https://google.com', mockArgs)).toBe(true);
    expect(typeof (await field.validate('invalid', mockArgs))).toBe('string');
  });

  it('should validate LinkedIn URLs correctly including company and school', async () => {
    const fields = urlField({ config: { type: 'linkedin' } });
    const field = fields[0] as any;

    expect(await field.validate('https://www.linkedin.com/in/user', mockArgs)).toBe(true);
    expect(await field.validate('https://www.linkedin.com/company/x3m', mockArgs)).toBe(true);
    expect(await field.validate('https://www.linkedin.com/school/mit', mockArgs)).toBe(true);
    expect(typeof (await field.validate('https://www.linkedin.com/feed/', mockArgs))).toBe(
      'string'
    );
  });

  it('should enforce https if enabled', async () => {
    const fields = urlField({ config: { type: 'url', https: true } });
    const field = fields[0] as any;

    expect(await field.validate('https://google.com', mockArgs)).toBe(true);
    expect(typeof (await field.validate('http://google.com', mockArgs))).toBe('string');
  });

  it('should auto-prepend https in beforeValidate hook', () => {
    const fields = urlField({ config: { type: 'url', https: true } });
    const field = fields[0] as any;
    const hook = field.hooks.beforeValidate[0];

    expect(hook({ value: 'google.com' })).toBe('https://google.com');
    expect(hook({ value: 'https://google.com' })).toBe('https://google.com');
  });

  it('should validate account handles correctly', async () => {
    const fields = urlField({ config: { type: 'instagramAccount' } });
    const field = fields[0] as any;

    expect(await field.validate('my_user.name', mockArgs)).toBe(true);
    expect(typeof (await field.validate('invalid space', mockArgs))).toBe('string');
  });

  it('should allow custom regex overrides and handle https enforcement', async () => {
    // If we want a non-URL custom regex, we should disable https if it's type 'url'
    const fields = urlField({ config: { https: false, regex: /^\d+$/ } });
    const field = fields[0] as any;

    expect(await field.validate('123', mockArgs)).toBe(true);
    expect(typeof (await field.validate('abc', mockArgs))).toBe('string');
  });
});
