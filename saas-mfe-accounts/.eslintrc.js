module.exports = {
	root: true,
	ignorePatterns: ['node_modules/*', 'dist/*', 'test-output/*', 'e2e/target/*'],
	settings: {
		jsdoc: {
			ignorePrivate: true
		}
	},
	overrides: [
		{
			files: ['*.ts'],
			parser: '@typescript-eslint/parser',
			parserOptions: {
				ecmaVersion: 6,
				project: ['tsconfig.eslint.json'],
				sourceType: 'module',
				ecmaFeatures: {
					modules: true
				}
			},
			extends: ['plugin:prettier/recommended'],
			plugins: ['@typescript-eslint', '@angular-eslint', 'jsdoc', 'jest', '@ngrx', 'no-only-tests'],
			rules: {
				'no-only-tests/no-only-tests': [
					'error',
					{
						block: ['describe', 'it', 'assert', 'test', 'Cypress._'],
						focus: ['only', 'times']
					}
				],
				'prettier/prettier': 'error',
				'@angular-eslint/component-class-suffix': 'error',
				'@angular-eslint/component-selector': [
					'error',
					{
						type: 'element',
						prefix: ['app', 'demo', 'story'],
						style: 'kebab-case'
					}
				],
				'@angular-eslint/directive-class-suffix': 'error',
				'@angular-eslint/directive-selector': [
					'error',
					{
						type: 'attribute',
						prefix: ['app', 'demo', 'story'],
						style: 'camelCase'
					}
				],
				'@angular-eslint/no-host-metadata-property': 'error',
				'@angular-eslint/no-input-rename': 'error',
				'@angular-eslint/no-inputs-metadata-property': 'error',
				'@angular-eslint/no-output-rename': 'error',
				'@angular-eslint/no-outputs-metadata-property': 'error',
				'@angular-eslint/use-lifecycle-interface': 'error',
				'@angular-eslint/use-pipe-transform-interface': 'error',
				'@typescript-eslint/naming-convention': [
					'error',
					{
						selector: 'typeLike',
						format: ['PascalCase']
					}
				],
				'@typescript-eslint/consistent-type-definitions': 'error',
				'@typescript-eslint/dot-notation': 'off',
				'@typescript-eslint/explicit-member-accessibility': [
					'off',
					{
						accessibility: 'explicit'
					}
				],
				'@typescript-eslint/member-delimiter-style': [
					'error',
					{
						multiline: {
							delimiter: 'semi',
							requireLast: true
						},
						singleline: {
							delimiter: 'semi',
							requireLast: false
						}
					}
				],
				'@typescript-eslint/member-ordering': [
					'error',
					{
						default: {
							memberTypes: [
								[
									'static-field',
									'instance-field',
									'abstract-field',
									'static-get',
									'instance-get',
									'abstract-get',
									'static-set',
									'instance-set',
									'abstract-set'
								],
								'constructor',
								'static-method',
								'instance-method',
								'abstract-method'
							]
						}
					}
				],
				'@typescript-eslint/no-empty-function': 'off',
				'@typescript-eslint/no-empty-interface': 'error',
				'@typescript-eslint/no-inferrable-types': 'error',
				'@typescript-eslint/no-misused-new': 'error',
				'@typescript-eslint/no-non-null-assertion': 'error',
				'@typescript-eslint/no-unused-expressions': ['error', { allowTernary: true }],
				'no-unused-vars': 'off',
				'@typescript-eslint/no-unused-vars': 'error',
				'@typescript-eslint/no-use-before-define': 'error',
				'@typescript-eslint/prefer-function-type': 'error',
				'@typescript-eslint/type-annotation-spacing': 'error',
				'@typescript-eslint/unified-signatures': 'error',
				'@typescript-eslint/no-shadow': [
					'error',
					{
						hoist: 'all'
					}
				],
				'no-multiple-empty-lines': 'error',
				'arrow-body-style': 'off',
				camelcase: 'off',
				curly: 'error',
				eqeqeq: ['error', 'smart'],
				'guard-for-in': 'error',
				'id-blacklist': 'off',
				'id-match': 'off',
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
				'no-eval': 'error',
				'no-fallthrough': 'error',
				'no-new-wrappers': 'error',
				'no-redeclare': 'error',
				'no-restricted-imports': 'error',
				'no-throw-literal': 'error',
				'no-undef-init': 'error',
				'no-underscore-dangle': 'off',
				'no-unused-labels': 'error',
				'no-var': 'error',
				'prefer-const': 'error',
				radix: 'error',
				'spaced-comment': [
					'error',
					'always',
					{
						markers: ['/']
					}
				],
				'lines-between-class-members': 'error',
				'no-duplicate-imports': 'error',
				'@ngrx/updater-explicit-return-type': 'error',
				'@ngrx/avoid-cyclic-effects': 'error',
				'@ngrx/no-dispatch-in-effects': 'warn',
				'@ngrx/no-effects-in-providers': 'error',
				'@ngrx/prefer-action-creator-in-of-type': 'error',
				'@ngrx/avoid-combining-selectors': 'error',
				'@ngrx/avoid-duplicate-actions-in-reducer': 'error',
				'@ngrx/good-action-hygiene': 'error',
				'@ngrx/no-multiple-global-stores': 'error',
				'@ngrx/no-reducer-in-key-names': 'error',
				'@ngrx/no-typed-global-store': 'error',
				'@ngrx/prefer-action-creator-in-dispatch': 'error',
				'@ngrx/prefer-action-creator': 'warn',
				'@ngrx/prefer-inline-action-props': 'error',
				'@ngrx/prefer-one-generic-in-create-for-feature-selector': 'error',
				'@ngrx/prefix-selectors-with-select': 'error',
				'@ngrx/use-consistent-global-store-name': ['warn', 'store'],
				'@ngrx/no-store-subscription': 'error',
				'@ngrx/avoid-mapping-selectors': 'error',
				'@ngrx/avoid-dispatching-multiple-actions-sequentially': 'error',
				'jsdoc/require-jsdoc': [
					'error',
					{
						checkConstructors: false,
						require: {
							FunctionDeclaration: true,
							MethodDefinition: true
						}
					}
				],
				'jsdoc/require-description': 'error'
			}
		},
		{
			files: ['*.js'],
			extends: ['standard', 'plugin:prettier/recommended'],
			rules: {
				'prettier/prettier': 'error',
				'@typescript-eslint/indent': 'off',
				'@typescript-eslint/no-use-before-define': 'off',
				'@typescript-eslint/quotes': 'off',
				'@typescript-eslint/no-unused-vars': 'off',
				'jest/no-focused-tests': 'error',
				'comma-spacing': 'off',
				'dot-notation': 'off',
				'no-prototype-builtins': 'off',
				'no-tabs': 'off',
				'no-useless-escape': 'off',
				'padded-blocks': 'off',
				'space-before-function-paren': 'off',
				'max-len': 'off',
				'no-console': 'off',
				'guard-for-in': 'off',
				'arrow-body-style': 'off',
				'no-shadow': 'off',
				'@typescript-eslint/no-shadow': ['error'],
				'no-undef': 'off',
				indent: ['error', 'tab'],
				'jsdoc/require-jsdoc': [
					'error',
					{
						require: {
							FunctionDeclaration: true,
							MethodDefinition: true,
							ClassDeclaration: true
						}
					}
				]
			}
		},
		{
			files: ['*spec.ts', '*mock.ts', '**/_mocks_/*.ts', '**/__mocks__/*.ts'],
			rules: {
				'@typescript-eslint/no-unused-vars': [
					'error',
					{
						vars: 'local',
						args: 'none'
					}
				]
			}
		},
		{
			files: ['*.html'],
			parser: '@angular-eslint/template-parser',
			extends: ['plugin:@angular-eslint/template/recommended'],
			rules: {
				'@angular-eslint/template/accessibility-alt-text': 2,
				'@angular-eslint/template/accessibility-elements-content': 2,
				'@angular-eslint/template/accessibility-label-for': 2,
				'@angular-eslint/template/no-positive-tabindex': 2,
				'@angular-eslint/template/accessibility-table-scope': 2,
				'@angular-eslint/template/accessibility-valid-aria': 2,
				'@angular-eslint/template/click-events-have-key-events': 2,
				'@angular-eslint/template/mouse-events-have-key-events': 2,
				'@angular-eslint/template/no-autofocus': 2,
				'@angular-eslint/template/no-distracting-elements': 2
			}
		}
	]
};
