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
      coverage: {
        provider: 'v8',
        reporter: ['text', 'html', 'lcov', 'json'],
        exclude: ['node_modules/**', 'dist/**', '**/*.test.ts', '**/*.config.ts', '**/*.config.js'],
        thresholds: {
          lines: 80,
          functions: 80,
          branches: 80,
          statements: 80,
        },
      },
    },
  });
