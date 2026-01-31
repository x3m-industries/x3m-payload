import config from '@x3m-industries/lib-eslint';

export default [
  ...config,
  {
    ignores: ['**/.next/**'],
  },
  {
    languageOptions: {
      parserOptions: {
        projectService: true,
        tsconfigRootDir: import.meta.dirname,
      },
    },
  },
];
