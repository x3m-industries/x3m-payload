import { buildConfig } from 'payload';

import { mongooseAdapter } from '@payloadcms/db-mongodb';
import { lexicalEditor } from '@payloadcms/richtext-lexical';
import path from 'path';
import sharp from 'sharp';
import { fileURLToPath } from 'url';

import { servicesPlugin } from '@x3m-industries/lib-services';

import { AllFields } from './collections/AllFields';
import { Todos } from './collections/Todos';
import { seed } from './seed';

const filename = fileURLToPath(import.meta.url);
const dirname = path.dirname(filename);

export default buildConfig({
  admin: {
    importMap: {
      baseDir: path.resolve(dirname),
    },
    user: 'users',
  },
  collections: [
    AllFields,
    Todos,
    {
      slug: 'users',
      auth: true,
      fields: [],
    },
    {
      slug: 'media',
      fields: [],
      upload: {
        staticDir: path.resolve(dirname, 'media'),
      },
    },
  ],
  plugins: [servicesPlugin()],
  db: mongooseAdapter({
    url: process.env.DATABASE_URL || 'mongodb://localhost:27017/x3m-demo',
  }),
  editor: lexicalEditor(),
  onInit: async (payload) => {
    await seed(payload);
  },
  secret: process.env.PAYLOAD_SECRET || 'demo-secret-key',
  sharp,
  typescript: {
    outputFile: path.resolve(dirname, 'payload-types.ts'),
  },
});
