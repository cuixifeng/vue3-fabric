module.exports = {
    root: true,
    env: {
        node: true
    },
    ignorePatterns: ['/src/core/*.ts'],
    extends: [
        'plugin:vue/vue3-essential',
        'eslint:recommended',
        '@vue/typescript/recommended',
        'plugin:prettier/recommended'
    ],
    parserOptions: {
        ecmaVersion: 2020
    },
    rules: {
        'prettier/prettier': [
            'warn',
            {
                semi: false,
                singleQuote: true,
                printWidth: 100,
                proseWrap: 'preserve',
                bracketSameLine: false,
                tabWidth: 4,
                useTabs: false,
                trailingComma: 'none',
                endOfLine: 'auto'
            }
        ],
        'vue/multi-word-component-names': 'off',
        '@typescript-eslint/no-explicit-any': 'off',
        '@typescript-eslint/ban-ts-comment': 'off',
        'no-undef': 'off',
        'vue/prefer-import-from-vue': 'off',
        'no-prototype-builtins': 'off',
        'prefer-spread': 'off',
        '@typescript-eslint/no-non-null-assertion': 'off',
        '@typescript-eslint/no-non-null-asserted-optional-chain': 'off'
    }
}
