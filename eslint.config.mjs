import js from '@eslint/js';
import eslintPluginPrettier from 'eslint-plugin-prettier/recommended';
import globals from 'globals';
import tseslint from 'typescript-eslint';

export default tseslint.config(
  { ignores: ['dist', '.strapi', '.cache', '.tmp', 'types/generated', 'public/uploads'] },
  {
    extends: [js.configs.recommended, ...tseslint.configs.recommended],
    files: ['**/*.{ts,tsx}'],
    languageOptions: {
      ecmaVersion: 2020,
      globals: globals.node,
    },
    rules: {
      '@typescript-eslint/no-unused-vars': 'off',
    },
  },
  {
    // Strapi admin-panel customizations run in the browser, not Node.
    files: ['src/admin/**/*.{ts,tsx}'],
    languageOptions: {
      globals: globals.browser,
    },
  },
  eslintPluginPrettier,
);
