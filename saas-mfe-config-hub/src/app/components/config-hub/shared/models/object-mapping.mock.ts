/*
 * Copyright (C) 2023 Acme Technologies, Inc.  All rights reserved.
 */
import { ConfigHubObjectMapping } from './object-mapping.model';

export const mockConfigHubObjectMappingList: Array<ConfigHubObjectMapping> = [
	{
		objectType: 'SOURCE',
		jsonPath: '$.name',
		sourceValue: 'test-source-value',
		targetValue: 'test-target-value',
		enabled: true,
		objectMappingId: 'asdasd-asdas-gdfgdf-fdgdfg'
	},
	{
		objectType: 'IDENTITY',
		jsonPath: '$.name',
		sourceValue: 'test-source-value2',
		targetValue: 'test-target-value2',
		enabled: false,
		objectMappingId: 'asdasd-asdas-daiss-8729-2323'
	}
];
