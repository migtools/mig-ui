module.exports = {
    root: true,
    parser: '@typescript-eslint/parser',
    plugins: [
        '@typescript-eslint',
    ],
    extends: [
        'eslint:recommended',
        'plugin:@typescript-eslint/eslint-recommended',
        'plugin:@typescript-eslint/recommended',
    ],
    rules: {
        "indent": ["error", 2, { "SwitchCase": 1 }],
        "keyword-spacing": 2,
        "switch-colon-spacing": ["error", { "after": true, "before": false }],
        "@typescript-eslint/interface-name-prefix": "off",
        "@typescript-eslint/ban-ts-ignore": "off",
        "@typescript-eslint/no-explicit-any": "off",
        "@typescript-eslint/explicit-function-return-type": "off",
        "@typescript-eslint/no-unused-vars": "off",
        "no-case-declarations": "off",
        "no-var-requires": "off",
        "@typescript-eslint/no-var-requires": "off",
        "@typescript-eslint/camelcase": "off",
        "no-prototype-builtins": "off",
        "no-useless-escape": "off"
    }
}
