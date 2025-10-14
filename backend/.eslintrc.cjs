module.exports = {
  root: true,
  parser: '@typescript-eslint/parser',
  parserOptions: { project: true, tsconfigRootDir: __dirname },
  plugins: ['@typescript-eslint', 'import'],
  extends: [
    'eslint:recommended',
    'plugin:@typescript-eslint/recommended',
    'plugin:import/recommended',
    'plugin:import/typescript',
    'prettier'
  ],
  rules: {
    '@typescript-eslint/no-explicit-any': 'warn',
    'no-console': 'off'
  },
  ignorePatterns: ['dist/**', 'node_modules/**', '.eslintrc.cjs', 'commitlint.config.cjs']
};
