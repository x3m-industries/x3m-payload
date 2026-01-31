import { defineConfig } from 'tsup';

export default defineConfig({
  clean: true,
  dts: true,
  entry: {
    client: 'src/client.ts',
    index: 'src/index.ts',
  },
  external: ['@payloadcms/ui', 'payload', 'react', 'react-dom'],
  format: ['cjs', 'esm'],
  onSuccess: 'node scripts/post-build.cjs',
  sourcemap: true,
  treeshake: true,
});
