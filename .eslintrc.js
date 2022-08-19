module.exports = {
  env: {
    es2021: true,
    node: true,
    mocha: true,
  },
  extends: [
    "standard",
    "eslint:recommended",
    "plugin:prettier/recommended",
    "plugin:import/typescript",
  ],
  parser: "@typescript-eslint/parser",
  parserOptions: {
    ecmaVersion: 12,
    sourceType: "module",
  },
  plugins: ["@typescript-eslint"],
  rules: {
    "import/extensions": "off",
    camelcase: "off",
    "class-methods-use-this": "off",
    "import/no-extraneous-dependencies": ["off", { devDependencies: true }],
    "no-console": "off",
    "no-param-reassign": "off",
    "consistent-return": "off",
    "no-unused-vars": "off",
    "no-underscore-dangle": "off",
    "no-restricted-syntax": "off",
    "no-await-in-loop": "off",
  },
};
