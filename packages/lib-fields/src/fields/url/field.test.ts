import type { FieldHookArgs, PayloadRequest, TextField, ValidateOptions } from 'payload';

import { describe, expect, it } from 'vitest';

import { urlField } from './field.js';

type SingleTextField = Extract<TextField, { hasMany?: false | undefined }>;
type ManyTextField = Extract<TextField, { hasMany: true }>;

const mockArgs = {
  req: {
    payload: {
      config: {
        i18n: {
          fallbackLng: 'en',
        },
      },
    },
    t: ((key: string) => key) as unknown as PayloadRequest['t'],
  } as unknown as PayloadRequest,
  required: true,
} as unknown as ValidateOptions<unknown, unknown, TextField, string>;

describe('urlField', () => {
  it('should use defaults for type url', () => {
    const fields = urlField();
    const field = fields[0] as SingleTextField;
    expect(field.name).toBe('url');
    expect(field.label).toBe('URL');
  });

  it('should use defaults for type facebook', () => {
    const fields = urlField({ config: { type: 'facebook' } });
    const field = fields[0] as SingleTextField;
    expect(field.name).toBe('facebook');
    expect(field.label).toBe('Facebook');
  });

  it('should use Profile label when isAccount is true', () => {
    const fields = urlField({ config: { type: 'facebook', isAccount: true } });
    const field = fields[0] as SingleTextField;
    expect(field.label).toBe('Facebook Profile');
  });

  it('should validate facebookAccount as a URL', async () => {
    const fields = urlField({ config: { type: 'facebook', isAccount: true } });
    const field = fields[0] as SingleTextField;

    expect(await field.validate!('https://www.facebook.com/user.name', mockArgs)).toBe(true);
    expect(typeof (await field.validate!('https://www.facebook.com/', mockArgs))).toBe('string');
  });

  it('should validate correctly with default regex', async () => {
    const fields = urlField({ config: { type: 'url' } });
    const field = fields[0] as SingleTextField;

    expect(await field.validate!('https://google.com', mockArgs)).toBe(true);
    expect(typeof (await field.validate!('invalid', mockArgs))).toBe('string');
  });

  it('should validate instagramAccount as a URL', async () => {
    const fields = urlField({ config: { type: 'instagram', isAccount: true } });
    const field = fields[0] as SingleTextField;

    expect(await field.validate!('https://www.instagram.com/user.name', mockArgs)).toBe(true);
    expect(typeof (await field.validate!('https://www.instagram.com/reels/123', mockArgs))).toBe(
      'string'
    );
  });

  it('should validate LinkedIn URLs correctly including company and school', async () => {
    const fields = urlField({ config: { type: 'linkedin', isAccount: true } });
    const field = fields[0] as SingleTextField;

    expect(await field.validate!('https://www.linkedin.com/in/user', mockArgs)).toBe(true);
    expect(await field.validate!('https://www.linkedin.com/company/x3m', mockArgs)).toBe(true);
    expect(await field.validate!('https://www.linkedin.com/school/mit', mockArgs)).toBe(true);
    expect(typeof (await field.validate!('https://www.linkedin.com/feed/', mockArgs))).toBe(
      'string'
    );
  });

  it('should validate xAccount as a URL', async () => {
    const fields = urlField({ config: { type: 'x', isAccount: true } });
    const field = fields[0] as SingleTextField;

    expect(await field.validate!('https://x.com/username', mockArgs)).toBe(true);
    expect(await field.validate!('https://twitter.com/username', mockArgs)).toBe(true);
    expect(
      typeof (await field.validate!(
        'https://x.com/this_username_is_definitely_too_long_for_x',
        mockArgs
      ))
    ).toBe('string');
  });

  it('should validate TikTok account URLs', async () => {
    const fields = urlField({ config: { type: 'tiktok', isAccount: true } });
    const field = fields[0] as SingleTextField;

    expect(await field.validate!('https://www.tiktok.com/@user', mockArgs)).toBe(true);
    expect(typeof (await field.validate!('https://www.tiktok.com/tag/music', mockArgs))).toBe(
      'string'
    );
  });

  it('should validate WhatsApp URLs', async () => {
    const fields = urlField({ config: { type: 'whatsapp' } });
    const field = fields[0] as SingleTextField;

    expect(await field.validate!('https://wa.me/1234567890', mockArgs)).toBe(true);
    expect(typeof (await field.validate!('https://google.com', mockArgs))).toBe('string');
  });

  it('should validate YouTube account URLs', async () => {
    const fields = urlField({ config: { type: 'youtube', isAccount: true } });
    const field = fields[0] as SingleTextField;

    expect(await field.validate!('https://www.youtube.com/@cchannel', mockArgs)).toBe(true);
    expect(await field.validate!('https://www.youtube.com/c/custom', mockArgs)).toBe(true);
    expect(typeof (await field.validate!('https://www.youtube.com/watch?v=123', mockArgs))).toBe(
      'string'
    );
  });

  it('should enforce https if enabled', async () => {
    const fields = urlField({ config: { type: 'url', https: true } });
    const field = fields[0] as SingleTextField;

    expect(await field.validate!('https://google.com', mockArgs)).toBe(true);
    expect(typeof (await field.validate!('http://google.com', mockArgs))).toBe('string');
  });

  it('should auto-prepend https in beforeValidate hook', () => {
    const fields = urlField({ config: { type: 'url', https: true } });
    const field = fields[0] as TextField;
    const hook = field.hooks?.beforeValidate?.[0];

    expect(hook?.({ value: 'google.com' } as FieldHookArgs)).toBe('https://google.com');
    expect(hook?.({ value: 'https://google.com' } as FieldHookArgs)).toBe('https://google.com');
  });

  it('should auto-prepend http in beforeValidate hook if https is false', () => {
    const fields = urlField({ config: { type: 'url', https: false } });
    const field = fields[0] as SingleTextField;
    const hook = field.hooks?.beforeValidate?.[0];

    expect(hook?.({ value: 'google.com' } as FieldHookArgs)).toBe('http://google.com');
  });

  it('should allow custom regex overrides', async () => {
    const fields = urlField({ config: { https: false, regex: /^\d+$/ } });
    const field = fields[0] as SingleTextField;

    expect(await field.validate!('123', mockArgs)).toBe(true);
    expect(typeof (await field.validate!('abc', mockArgs))).toBe('string');
  });

  const mockArgsMany = mockArgs as unknown as ValidateOptions<
    unknown,
    unknown,
    TextField,
    string[]
  >;

  describe('hasMany support', () => {
    it('should validate an array of URLs', async () => {
      const fields = urlField({ overrides: { hasMany: true } });
      const field = fields[0] as ManyTextField;

      const validUrls = ['https://google.com', 'https://example.com'];
      expect(await field.validate!(validUrls, mockArgsMany)).toBe(true);
    });

    it('should fail validation if one URL in array is invalid', async () => {
      const fields = urlField({ overrides: { hasMany: true } });
      const field = fields[0] as ManyTextField;

      const mixedUrls = ['https://google.com', 'invalid-url'];
      // validateWithHasMany runs validation on each item; if any fail, it returns the error string.
      const result = await field.validate!(mixedUrls, mockArgsMany);
      expect(typeof result).toBe('string');
    });

    it('should format all URLs in beforeValidate hook', () => {
      const fields = urlField({ config: { https: true }, overrides: { hasMany: true } });
      const field = fields[0] as ManyTextField;
      const hook = field.hooks?.beforeValidate?.[0];

      const input = ['google.com', 'http://example.com'];
      const expected = ['https://google.com', 'https://example.com'];

      expect(hook?.({ value: input } as FieldHookArgs)).toEqual(expected);
    });
  });
});
