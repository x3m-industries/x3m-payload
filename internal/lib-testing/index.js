import tsconfigPaths from 'vite-tsconfig-paths';
import { defineConfig } from 'vitest/config';

export const createVitestConfig = () =>
  defineConfig({
    plugins: [
      tsconfigPaths({
        ignoreConfigErrors: true,
      }),
    ],
    test: {
      passWithNoTests: true,
      environment: 'node',
      globals: true,
      hookTimeout: 30000,
      testTimeout: 30000,
    },
  });
