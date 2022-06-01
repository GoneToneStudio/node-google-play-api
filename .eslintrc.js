module.exports = {
  env: {
    browser: true,
    es2021: true,
    node: true,
    jest: true
  },
  extends: [
    'standard'
  ],
  parser: '@typescript-eslint/parser',
  parserOptions: {
    ecmaVersion: 13,
    sourceType: 'module'
  },
  ignorePatterns: [
    '**/dist/*',
    '**/proto/*'
  ],
  plugins: [
    '@typescript-eslint'
  ],
  rules: {}
}
