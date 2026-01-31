import { defineConfig } from 'tsup';

export default defineConfig({
  clean: true,
  dts: true,
  entry: ['src/index.ts'],
  external: ['@payloadcms/ui', 'payload', 'react', 'react-dom'],
  format: ['cjs', 'esm'],
  sourcemap: true,
  treeshake: true,
});
