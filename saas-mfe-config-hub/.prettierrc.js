module.exports = {
	printWidth: 120,
	tabWidth: 4,
	useTabs: true,
	bracketSpacing: true,
	semi: true,
	quoteProps: 'as-needed',
	singleQuote: true,
	arrowParens: 'avoid',
	trailingComma: 'none',
	endOfLine: 'auto',
	importOrder: [
		'^@angular',
		'^(@storybook|rxjs|ag-grid-community|ag-grid-angular|@ngrx|@ngx-translate)',
		'^@acme-priv/armada-angular',
		'^@acme-priv/ui-common',
		'(.*)(/selectors|.selectors|.selector|/actions|.actions|/reducers|.reducer|.state|/effects|.effects)$',
		'<THIRD_PARTY_MODULES>'
	],
	importOrderSeparation: true,
	importOrderSortSpecifiers: true,
	importOrderParserPlugins: ['typescript', 'decorators-legacy'],
	plugins: ['@trivago/prettier-plugin-sort-imports']
};
