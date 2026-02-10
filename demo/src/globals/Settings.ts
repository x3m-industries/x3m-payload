import type { Payload } from 'payload';

import type { GlobalConfig } from '@x3m-industries/lib-services';

export const settingsExtensions = ({
  getPayload,
  global,
}: {
  getPayload: () => Promise<Payload>;
  global: 'settings';
}) => ({
  async updateTheme({ theme }: { theme: 'light' | 'dark' }) {
    const payload = await getPayload();
    return payload.updateGlobal({
      slug: global,
      data: { theme },
    });
  },
});

export const Settings = {
  slug: 'settings' as const,
  fields: [
    {
      name: 'theme',
      type: 'select',
      options: ['light', 'dark'],
      defaultValue: 'light',
    },
  ],
  service: {
    extensions: settingsExtensions,
  },
} satisfies GlobalConfig;
