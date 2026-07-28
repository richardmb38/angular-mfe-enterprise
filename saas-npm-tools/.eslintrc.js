module.exports = {
	root: true,
	extends: ['plugin:prettier/recommended'],
	env: {
		browser: true,
		es6: true,
		node: true,
		jest: true
	},
	parserOptions: {
		// Required for certain syntax usages
		ecmaVersion: 2020
	},
	plugins: ['prettier'],
	ignorePatterns: [
		'node_modules/*',
		'dist/*',
		'public/*',
		'views/*',
		'docs/*',
		'coverage/*',
		'schematics/*',
		'test-output/*',
		'webpack.config.js',
		'/etc/cup/certs'
	],
	rules: {
		'arrow-body-style': 'off',
		'brace-style': ['error', '1tbs'],
		camelcase: 'off',
		curly: 'off',
		'dot-notation': 'off',
		'eol-last': 'error',
		eqeqeq: ['error', 'smart'],
		'guard-for-in': 'error',
		'id-blacklist': 'off',
		'id-denylist': 'off',
		'id-match': 'off',
		indent: 'off',
		'lines-between-class-members': 'error',
		'max-len': [
			'error',
			{
				code: 256
			}
		],
		'no-bitwise': 'error',
		'no-caller': 'error',
		'no-console': 'error',
		'no-debugger': 'error',
		'no-empty': 'off',
		'no-empty-function': 'off',
		'no-eval': 'error',
		'no-fallthrough': 'error',
		'no-new-wrappers': 'error',
		'no-redeclare': 'error',
		'no-restricted-imports': 'error',
		'no-shadow': 'off',
		'no-throw-literal': 'error',
		'no-tabs': ['error', { allowIndentationTabs: true }],
		'no-trailing-spaces': 'error',
		'no-undef-init': 'error',
		'no-underscore-dangle': 'off',
		'no-unused-expressions': 'error',
		'no-unused-labels': 'error',
		'no-unused-vars': 'error',
		'no-use-before-define': 'error',
		'no-useless-constructor': 'off',
		'no-var': 'error',
		'operator-linebreak': ['error', 'before'],
		'padded-blocks': 'off',
		'prefer-const': 'error',
		quotes: [2, 'single', { avoidEscape: true }],
		radix: 'error',
		semi: ['error', 'always'],
		'space-before-function-paren': 'off',
		'spaced-comment': [
			'error',
			'always',
			{
				markers: ['/']
			}
		]
	},
	overrides: [
		{
			files: ['*.js'],
			extends: ['plugin:prettier/recommended'],
			rules: {
				'prettier/prettier': 'error',
				'no-undef': 'off',
				'space-before-function-paren': 0,
				'space-after-function-paren': 0,
				'no-use-before-define': 0,
				'no-unused-vars': 0,
				'no-console': 0,
				'no-prototype-builtins': 0,
				'new-cap': 0,
				'no-new': 0,
				'no-useless-escape': 0,
				'no-template-curly-in-string': 0,
				'no-array-constructor': 0,
				'no-control-regex': 0,
				'no-bitwise': 0,
				'prefer-rest-params': 0,
				'no-unused-expressions': 0,
				'no-sequences': 0,
				'prefer-promise-reject-errors': 0,
				'no-async-promise-executor': 0,
				'no-useless-constructor': 0,
				'dot-notation': 0
			}
		}
	]
};
