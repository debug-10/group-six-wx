module.exports = {
  env: {
    browser: true,
    es2021: true,
    node: true,
    es6: true,
  },
  extends: [
    "eslint:recommended",
    "plugin:@typescript-eslint/recommended",
    "plugin:react/recommended",
    "taro/react",
    "plugin:import/errors",
    "plugin:import/warnings",
  ],
  settings: {
    react: {
      version: "999.999.999",
    },
  },
  overrides: [
    {
      env: {
        node: true,
      },
      files: [".eslintrc.{js,cjs}"],
      parserOptions: {
        sourceType: "script",
      },
    },
  ],
  parser: "@typescript-eslint/parser",
  parserOptions: {
    ecmaVersion: "latest",
    sourceType: "module",
  },
  plugins: ["@typescript-eslint", "react"],
  rules: {
    "no-unused-vars": "off", //代码中是否有未使用的变量,关闭这个规则可以避免不必要的警告
    "@typescript-eslint/no-unused-vars": "off", //TypeScript 代码未使用变量,关闭这个规则可以避免不必要的警告
    "@typescript-eslint/no-explicit-any": ["off"], //关闭这个规则后，开发者可以在 TypeScript 中使用 any 类型
    "react/react-in-jsx-scope": "off", //检查 JSX 是否在 React 的作用域内。关闭这个规则意味着即使在没有导入 React 的情况下，也可以使用 JSX 语法
    "import/no-commonjs": "off", //禁止使用 CommonJS 的模块导入方式（如 require）。关闭后，允许在代码中使用 require 和 module.exports
    "import/prefer-default-export": "off", //建议使用默认导出而不是命名导出。关闭后，开发者可以自由选择使用命名导出或默认导出，而不会受到限制。
    "import/no-unresolved": "off", //检查导入的模块路径是否正确。关闭后，即使导入的模块路径不存在，也不会报错
    "import/named": "off", //检查命名导入是否正确。关闭后，即使导入的命名模块不存在，也不会报错
    "jsx-quotes": "prefer-double", //用于指定 JSX 中属性值的引号风格。设置为 "prefer-double" 表示优先使用双引号（"）来包裹 JSX 属性值
  },
};
