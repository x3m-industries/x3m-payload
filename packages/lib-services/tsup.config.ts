import { defineConfig } from 'tsup';

export default defineConfig({
  clean: true,
  dts: true,
  entry: ['src/index.ts'],
  external: ['next', 'next/cache', 'payload'],
  format: ['cjs', 'esm'],
  sourcemap: true,
  treeshake: true,
});
