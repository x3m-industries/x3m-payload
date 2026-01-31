import payloadEsLintConfig from '@payloadcms/eslint-config';

export const defaultESLintIgnores = [
  '**/.temp',
  '**/.*',
  '**/.git',
  '**/.hg',
  '**/.pnp.*',
  '**/.svn',
  '**/playwright.config.ts',
  '**/vitest.config.js',
  '**/vitest.config.ts',
  '**/tsconfig.tsbuildinfo',
  '**/README.md',
  '**/eslint.config.js',
  '**/payload-types.ts',
  '**/dist/',
  '**/.yarn/',
  '**/build/',
  '**/node_modules/',
  '**/temp/',
  '**/coverage/',
  '**/.coverage/',
];

export const rootEslintConfig = [
  ...payloadEsLintConfig,
  {
    ignores: defaultESLintIgnores,
  },
  {
    rules: {
      'no-restricted-exports': 'off',
      'perfectionist/sort-imports': 'off',
      'perfectionist/sort-named-imports': 'off',
    },
  },
];

export default rootEslintConfig;
