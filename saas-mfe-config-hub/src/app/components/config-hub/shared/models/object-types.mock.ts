export const mockConfigHubObjectTypes = [
	{
		objectType: 'SOURCE',
		resolveByIdUrl: {
			url: 'mockURL',
			query: null
		},
		resolveByNameUrl: {
			url: 'mockURL',
			query: {
				filters: 'name eq "$name"'
			}
		},
		exportUrl: 'mockURL',
		exportLimit: 10,
		importUrl: 'mockURL',
		importLimit: 10,
		referenceExtractors: null,
		signatureRequired: false
	},
	{
		objectType: 'TRIGGER_SUBSCRIPTION',
		resolveByIdUrl: {
			url: 'mockURL',
			query: null
		},
		resolveByNameUrl: {
			url: 'mockURL',
			query: {
				filters: 'name eq "$name"'
			}
		},
		exportLimit: 10,
		importUrl: 'mockURL',
		importLimit: 10,
		referenceExtractors: null,
		signatureRequired: false
	},
	{
		objectType: 'RULE',
		resolveByIdUrl: {
			url: 'mockURL',
			query: null
		},
		resolveByNameUrl: {
			url: 'mockURL',
			query: {
				filters: 'name eq "$name"'
			}
		},
		exportUrl: 'mockURL',
		exportLimit: 10,
		importUrl: 'mockURL',
		importLimit: 10,
		referenceExtractors: null,
		signatureRequired: true
	},
	{
		objectType: 'TRANSFORM',
		resolveByIdUrl: {
			url: 'mockURL',
			query: null
		},
		resolveByNameUrl: {
			url: 'mockURL',
			query: {
				name: '$name'
			}
		},
		exportLimit: 10,
		importUrl: 'mockURL',
		importLimit: 10,
		referenceExtractors: null,
		signatureRequired: false
	}
];
