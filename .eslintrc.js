module.exports = {
    'root': true,
    'env': {
        'browser': true,
        'commonjs': true,
        'es6': true,
        'node': true,
        'mocha': true,
        'jest': true,
    },
    'extends': [
        'eslint:recommended',
        'plugin:@typescript-eslint/recommended',
    ],
    'globals': {
        'Atomics': 'readonly',
        'SharedArrayBuffer': 'readonly',
        'Editor': 'readonly',
        'EditorExtends': 'readonly',
        'Tester': 'readonly',
        'cc': 'readonly',
        'globalThis': 'readonly',
    },
    'parser': 'vue-eslint-parser',
    'parserOptions': {
        'parser': '@typescript-eslint/parser',
        'ecmaVersion': 6,
        'sourceType': 'module',
        'ecmaFeatures': {
            'modules': true,
        },
    },
    'plugins': [
        '@typescript-eslint',
        'jsdoc',
    ],
    'rules': {
        
    },
};
