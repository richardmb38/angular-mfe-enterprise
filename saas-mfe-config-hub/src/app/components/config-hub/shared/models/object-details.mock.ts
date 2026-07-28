/*
 * Copyright (C) 2023 Acme Technologies, Inc.  All rights reserved.
 */
import {
	BaseObject,
	BaseObjectPatchDictionary,
	BaseReferenceDto,
	ConfigHubObjectConfigurationResult,
	ImportObject,
	ObjectDetails,
	ObjectOperationType,
	SignedImportObject
} from './object-details.model';

/**
 * Mock data for a base IDN object of type ACCESS_PROFILE.
 */
export const mockBaseObject: BaseObject = {
	id: '5e4432ce82734bcb9bb772a04d184e5a',
	name: 'TestingAccessProfile01',
	description: '4567',
	created: '2023-04-04T17:07:24.889235Z',
	modified: '2023-05-01T23:09:39.235809Z',
	enabled: false,
	owner: { type: 'IDENTITY', id: 'f87d8c13a3094445b927373ef4cc94d8', name: 'Acme Support' },
	source: { id: '2c91808384603b71018462fa232f202a', type: 'SOURCE', name: 'EndToEnd-GenericSource2' },
	entitlements: [],
	requestable: true,
	accessRequestConfig: {},
	revocationRequestConfig: {},
	segments: [],
	segmentRefs: []
};

/**
 * Mock data containing metadata for a BaseObject.
 */
export const mockBaseReferenceDto: BaseReferenceDto = {
	type: 'ACCESS_PROFILE',
	id: mockBaseObject.id,
	name: mockBaseObject.name
};

/**
 * Mock data for an ImportObject.
 */
export const mockImportObject: ImportObject = {
	version: 1,
	self: mockBaseReferenceDto,
	object: mockBaseObject
};

/**
 * Mock data for a signed version of an ImportObject.
 */
export const mockSignedImportObject: SignedImportObject = {
	jwsHeader: null,
	jwsSignature: 'test',
	...mockImportObject
};

/**
 * Mock data containing details for a specific object of a given type.
 */
export const mockObjectDetails: ObjectDetails = {
	tenant: 'mega-haoyi',
	jobId: 'c6495c1f-a34e-43e2-820b-15cbaf073ac1',
	objectType: mockSignedImportObject.self.type,
	objectId: mockSignedImportObject.self.id,
	objectName: mockSignedImportObject.self.name,
	object: mockSignedImportObject,
	operation: ObjectOperationType.CHANGED,
	jsonPatch: [
		{ op: 'remove', path: '/accessRequestConfig' },
		{ op: 'remove', path: '/description' },
		{ op: 'remove', path: '/revocationRequestConfig' }
	],
	hasErrors: false
};

/**
 * Mock data containing details for a specific object of a given type in the live configuration.
 */
export const mockLiveObjectDetails: ConfigHubObjectConfigurationResult = {
	jobId: 'c6495c1f-a34e-43e2-820b-15cbaf073ac1',
	objectType: mockSignedImportObject.self.type,
	objectId: mockSignedImportObject.self.id,
	objectName: mockSignedImportObject.self.name,
	object: JSON.stringify(mockSignedImportObject)
};

/**
 * Mock data for an array of Configuration Hub ObjectDetails.
 */
export const mockObjectDetailsArray: ObjectDetails[] = [
	mockObjectDetails,
	{
		tenant: 'mega-haoyi',
		jobId: 'c6495c1f-a34e-43e2-820b-15cbaf073ac1',
		objectType: 'ACCESS_PROFILE',
		objectId: 'ee3d794c292d45618e502c981fb2ec92',
		objectName: 'TestingAccessProfile02',
		object: {
			jwsHeader: null,
			jwsSignature: null,
			version: 1,
			self: { type: 'ACCESS_PROFILE', id: 'ee3d794c292d45618e502c981fb2ec92', name: 'TestingAccessProfile02' },
			object: {
				id: 'ee3d794c292d45618e502c981fb2ec92',
				name: 'TestingAccessProfile02',
				description: '123',
				created: '2023-04-04T17:07:46.088349Z',
				modified: '2023-05-01T23:08:31.082878Z',
				enabled: false,
				owner: { type: 'IDENTITY', id: '2c918084826af08201826ff4397e0819', name: 'Adalberto e2d3dd17' },
				source: { id: '2c91808384603b71018462fa232f202a', type: 'SOURCE', name: 'EndToEnd-GenericSource2' },
				entitlements: [],
				requestable: true,
				accessRequestConfig: {},
				revocationRequestConfig: {},
				segments: [],
				segmentRefs: []
			}
		},
		liveObject: {
			jwsHeader: null,
			jwsSignature: null,
			version: 1,
			self: { type: 'ACCESS_PROFILE', id: 'ee3d794c292d45618e502c981fb2ec92', name: 'TestingAccessProfile02' },
			object: {
				id: 'ee3d794c292d45618e502c981fb2ec92',
				name: 'TestingAccessProfile02',
				description: '123',
				created: '2023-04-04T17:07:46.088349Z',
				modified: '2023-05-01T23:08:31.082878Z',
				enabled: false,
				owner: { type: 'IDENTITY', id: '2c918084826af08201826ff4397e0819', name: 'Adalberto e2d3dd17' },
				source: { id: '2c91808384603b71018462fa232f202a', type: 'SOURCE', name: 'EndToEnd-GenericSource2' },
				entitlements: [],
				requestable: true,
				accessRequestConfig: {},
				revocationRequestConfig: {},
				segments: [],
				segmentRefs: []
			}
		},
		operation: ObjectOperationType.CHANGED,
		jsonPatch: [
			{ op: 'remove', path: '/accessRequestConfig' },
			{ op: 'remove', path: '/description' },
			{ op: 'remove', path: '/revocationRequestConfig' }
		],
		hasErrors: false
	},
	{
		tenant: 'mega-haoyi',
		jobId: 'c6495c1f-a34e-43e2-820b-15cbaf073ac1',
		objectType: 'IDENTITY_PROFILE',
		objectId: '8e8a1964392641e8b248bd5990f40283',
		objectName: 'TestingGenericProfile03',
		object: {
			jwsHeader: null,
			jwsSignature: null,
			version: 1,
			self: { type: 'IDENTITY_PROFILE', id: '8e8a1964392641e8b248bd5990f40283', name: 'TestingGenericProfile03' },
			object: {
				priority: 80,
				authoritativeSource: {
					type: 'SOURCE',
					id: '9b8ed25c749c458f840a5c1102af2cee',
					name: 'TestingGenericSource02'
				},
				identityRefreshRequired: false,
				identityCount: 0,
				identityAttributeConfig: {
					enabled: true,
					attributeTransforms: [
						{
							identityAttributeName: 'displayName',
							transformDefinition: {
								type: 'accountAttribute',
								attributes: {
									sourceName: 'TestingGenericSource02',
									attributeName: 'displayName',
									sourceId: '9b8ed25c749c458f840a5c1102af2cee'
								}
							}
						},
						{
							identityAttributeName: 'email',
							transformDefinition: {
								type: 'accountAttribute',
								attributes: {
									sourceName: 'TestingGenericSource02',
									attributeName: 'email',
									sourceId: '9b8ed25c749c458f840a5c1102af2cee'
								}
							}
						},
						{
							identityAttributeName: 'firstname',
							transformDefinition: {
								type: 'accountAttribute',
								attributes: {
									sourceName: 'TestingGenericSource02',
									attributeName: 'givenName',
									sourceId: '9b8ed25c749c458f840a5c1102af2cee'
								}
							}
						},
						{
							identityAttributeName: 'identificationNumber',
							transformDefinition: {
								type: 'accountAttribute',
								attributes: {
									sourceName: 'TestingGenericSource02',
									attributeName: 'employeeNumber',
									sourceId: '9b8ed25c749c458f840a5c1102af2cee'
								}
							}
						},
						{
							identityAttributeName: 'lastname',
							transformDefinition: {
								type: 'accountAttribute',
								attributes: {
									sourceName: 'TestingGenericSource02',
									attributeName: 'familyName',
									sourceId: '9b8ed25c749c458f840a5c1102af2cee'
								}
							}
						},
						{
							identityAttributeName: 'manager',
							transformDefinition: {
								type: 'accountAttribute',
								attributes: {
									sourceName: 'TestingGenericSource02',
									attributeName: 'manager',
									sourceId: '9b8ed25c749c458f840a5c1102af2cee'
								}
							}
						},
						{
							identityAttributeName: 'personalEmail',
							transformDefinition: {
								type: 'accountAttribute',
								attributes: {
									sourceName: 'TestingGenericSource02',
									attributeName: 'secondaryEmail',
									sourceId: '9b8ed25c749c458f840a5c1102af2cee'
								}
							}
						},
						{
							identityAttributeName: 'phone',
							transformDefinition: {
								type: 'accountAttribute',
								attributes: {
									sourceName: 'TestingGenericSource02',
									attributeName: 'secondaryPhoneNumber',
									sourceId: '9b8ed25c749c458f840a5c1102af2cee'
								}
							}
						},
						{
							identityAttributeName: 'uid',
							transformDefinition: {
								type: 'accountAttribute',
								attributes: {
									sourceName: 'TestingGenericSource02',
									attributeName: 'name',
									sourceId: '9b8ed25c749c458f840a5c1102af2cee'
								}
							}
						},
						{
							identityAttributeName: 'workPhone',
							transformDefinition: {
								type: 'accountAttribute',
								attributes: {
									sourceName: 'TestingGenericSource02',
									attributeName: 'phoneNumber',
									sourceId: '9b8ed25c749c458f840a5c1102af2cee'
								}
							}
						}
					]
				},
				hasTimeBasedAttr: false,
				id: '8e8a1964392641e8b248bd5990f40283',
				name: 'TestingGenericProfile03',
				created: '2023-04-04T21:14:18.722Z',
				modified: '2023-04-06T21:25:07.585Z'
			}
		},
		operation: ObjectOperationType.ADDED,
		hasErrors: false
	},
	{
		tenant: 'mega-haoyi',
		jobId: 'c6495c1f-a34e-43e2-820b-15cbaf073ac1',
		objectType: 'IDENTITY_PROFILE',
		objectId: '9c4b6c77470042139f7ae65c26b90fbd',
		objectName: 'TestingGenericProfile02',
		object: {
			jwsHeader: null,
			jwsSignature: null,
			version: 1,
			self: { type: 'IDENTITY_PROFILE', id: '9c4b6c77470042139f7ae65c26b90fbd', name: 'TestingGenericProfile02' },
			object: {
				description: 'testing',
				priority: 70,
				authoritativeSource: {
					type: 'SOURCE',
					id: 'c7b103eb9c4d4ff88034ff0015ab1938',
					name: 'TestingGenericSource01'
				},
				identityRefreshRequired: false,
				identityCount: 0,
				identityAttributeConfig: {
					enabled: true,
					attributeTransforms: [
						{
							identityAttributeName: 'displayName',
							transformDefinition: {
								type: 'accountAttribute',
								attributes: {
									sourceName: 'TestingGenericSource01',
									attributeName: 'displayName',
									sourceId: 'c7b103eb9c4d4ff88034ff0015ab1938'
								}
							}
						},
						{
							identityAttributeName: 'email',
							transformDefinition: {
								type: 'accountAttribute',
								attributes: {
									sourceName: 'TestingGenericSource01',
									attributeName: 'email',
									sourceId: 'c7b103eb9c4d4ff88034ff0015ab1938'
								}
							}
						},
						{
							identityAttributeName: 'firstname',
							transformDefinition: {
								type: 'accountAttribute',
								attributes: {
									sourceName: 'TestingGenericSource01',
									attributeName: 'givenName',
									sourceId: 'c7b103eb9c4d4ff88034ff0015ab1938'
								}
							}
						},
						{
							identityAttributeName: 'identificationNumber',
							transformDefinition: {
								type: 'accountAttribute',
								attributes: {
									sourceName: 'TestingGenericSource01',
									attributeName: 'employeeNumber',
									sourceId: 'c7b103eb9c4d4ff88034ff0015ab1938'
								}
							}
						},
						{
							identityAttributeName: 'lastname',
							transformDefinition: {
								type: 'accountAttribute',
								attributes: {
									sourceName: 'TestingGenericSource01',
									attributeName: 'familyName',
									sourceId: 'c7b103eb9c4d4ff88034ff0015ab1938'
								}
							}
						},
						{
							identityAttributeName: 'manager',
							transformDefinition: {
								type: 'accountAttribute',
								attributes: {
									sourceName: 'TestingGenericSource01',
									attributeName: 'manager',
									sourceId: 'c7b103eb9c4d4ff88034ff0015ab1938'
								}
							}
						},
						{
							identityAttributeName: 'personalEmail',
							transformDefinition: {
								type: 'accountAttribute',
								attributes: {
									sourceName: 'TestingGenericSource01',
									attributeName: 'secondaryEmail',
									sourceId: 'c7b103eb9c4d4ff88034ff0015ab1938'
								}
							}
						},
						{
							identityAttributeName: 'phone',
							transformDefinition: {
								type: 'accountAttribute',
								attributes: {
									sourceName: 'TestingGenericSource01',
									attributeName: 'secondaryPhoneNumber',
									sourceId: 'c7b103eb9c4d4ff88034ff0015ab1938'
								}
							}
						},
						{
							identityAttributeName: 'uid',
							transformDefinition: {
								type: 'accountAttribute',
								attributes: {
									sourceName: 'TestingGenericSource01',
									attributeName: 'name',
									sourceId: 'c7b103eb9c4d4ff88034ff0015ab1938'
								}
							}
						},
						{
							identityAttributeName: 'workPhone',
							transformDefinition: {
								type: 'accountAttribute',
								attributes: {
									sourceName: 'TestingGenericSource01',
									attributeName: 'phoneNumber',
									sourceId: 'c7b103eb9c4d4ff88034ff0015ab1938'
								}
							}
						}
					]
				},
				hasTimeBasedAttr: false,
				id: '9c4b6c77470042139f7ae65c26b90fbd',
				name: 'TestingGenericProfile02',
				created: '2023-04-04T21:14:17.983Z',
				modified: '2023-05-02T15:46:21.024Z'
			}
		},
		liveObject: {
			jwsHeader: null,
			jwsSignature: null,
			version: 1,
			self: { type: 'IDENTITY_PROFILE', id: '9c4b6c77470042139f7ae65c26b90fbd', name: 'TestingGenericProfile02' },
			object: {
				description: 'testing',
				priority: 70,
				authoritativeSource: {
					type: 'SOURCE',
					id: 'c7b103eb9c4d4ff88034ff0015ab1938',
					name: 'TestingGenericSource01'
				},
				identityRefreshRequired: false,
				identityCount: 0,
				hasTimeBasedAttr: false,
				id: '9c4b6c77470042139f7ae65c26b90fbd',
				name: 'TestingGenericProfile02',
				created: '2023-04-04T21:14:17.983Z',
				modified: '2023-05-02T15:46:21.024Z'
			}
		},
		operation: ObjectOperationType.CHANGED,
		jsonPatch: [{ op: 'remove', path: '/description' }],
		hasErrors: false
	},
	{
		tenant: 'mega-haoyi',
		jobId: 'c6495c1f-a34e-43e2-820b-15cbaf073ac1',
		objectType: 'ROLE',
		objectId: 'e16f78a89635445dba042a5962bc54d4',
		objectName: 'TestingRole02',
		object: {
			jwsHeader: null,
			jwsSignature: null,
			version: 1,
			self: { type: 'ROLE', id: 'e16f78a89635445dba042a5962bc54d4', name: 'TestingRole02' },
			object: {
				id: 'e16f78a89635445dba042a5962bc54d4',
				name: 'TestingRole02',
				created: '2023-05-01T21:31:43.205Z',
				modified: '2023-05-01T21:33:38.243Z',
				description: 'Testing',
				owner: { type: 'IDENTITY', id: '2c9180848319ede80183331fa2b001b4', name: 'Romo Benny' },
				accessProfiles: [],
				enabled: false,
				requestable: false,
				accessRequestConfig: { commentsRequired: false, denialCommentsRequired: false, approvalSchemes: [] },
				revocationRequestConfig: { approvalSchemes: [] },
				segments: [],
				segmentRefs: []
			}
		},
		liveObject: {
			jwsHeader: null,
			jwsSignature: null,
			version: 1,
			self: { type: 'ROLE', id: 'e16f78a89635445dba042a5962bc54d4', name: 'TestingRole02' },
			object: {
				id: 'e16f78a89635445dba042a5962bc54d4',
				name: 'TestingRole02',
				created: '2023-05-01T21:31:43.205Z',
				modified: '2023-05-01T21:33:38.243Z',
				description: 'Testing',
				owner: { type: 'IDENTITY', id: '2c9180848319ede80183331fa2b001b4', name: 'Romo Benny' },
				accessProfiles: [],
				enabled: false,
				requestable: false,
				accessRequestConfig: { commentsRequired: false, denialCommentsRequired: false, approvalSchemes: [] },
				revocationRequestConfig: { approvalSchemes: [] },
				segments: [],
				segmentRefs: []
			}
		},
		operation: ObjectOperationType.CHANGED,
		jsonPatch: [
			{ op: 'remove', path: '/description' },
			{ op: 'replace', path: '/owner/id', value: '2c918084826af08201826ff4397e0819' },
			{ op: 'replace', path: '/owner/name', value: 'Adalberto e2d3dd17' }
		],
		hasErrors: false
	},
	{
		tenant: 'mega-haoyi',
		jobId: 'c6495c1f-a34e-43e2-820b-15cbaf073ac1',
		objectType: 'SOURCE',
		objectId: '9b8ed25c749c458f840a5c1102af2cee',
		objectName: 'TestingGenericSource02',
		object: {
			jwsHeader: null,
			jwsSignature: null,
			version: 1,
			self: { type: 'SOURCE', id: '9b8ed25c749c458f840a5c1102af2cee', name: 'TestingGenericSource02' },
			object: {
				id: '9b8ed25c749c458f840a5c1102af2cee',
				name: 'TestingGenericSource02',
				type: 'DelimitedFile',
				connectorClass: 'acme.connector.DelimitedFileConnector',
				connectorScriptName: 'delimited-file-angularsc',
				description: 'TestingGenericSource02',
				deleteThreshold: 10,
				provisionAsCsv: true,
				owner: { type: 'IDENTITY', id: 'f87d8c13a3094445b927373ef4cc94d8', name: 'support' },
				features: ['DIRECT_PERMISSIONS', 'NO_RANDOM_ACCESS', 'DISCOVER_SCHEMA'],
				schemas: [
					{
						nativeObjectType: 'User',
						identityAttribute: 'id',
						displayAttribute: 'name',
						includePermissions: false,
						features: [],
						configuration: {},
						attributes: [
							{
								name: 'id',
								type: 'STRING',
								description: 'The unique ID for the account',
								isMulti: false,
								isEntitlement: false,
								isGroup: false
							},
							{
								name: 'name',
								type: 'STRING',
								description: 'The name of the account - typically username etc.',
								isMulti: false,
								isEntitlement: false,
								isGroup: false
							},
							{
								name: 'displayName',
								type: 'STRING',
								description: 'The preferred display name for the account',
								isMulti: false,
								isEntitlement: false,
								isGroup: false
							},
							{
								name: 'comments',
								type: 'STRING',
								description: 'Multi-purpose field used to capture a description or comments',
								isMulti: false,
								isEntitlement: false,
								isGroup: false
							},
							{
								name: 'created',
								type: 'STRING',
								description: 'Date/Time when the account was created (utime)',
								isMulti: false,
								isEntitlement: false,
								isGroup: false
							},
							{
								name: 'endDate',
								type: 'STRING',
								description: 'The date when this account "ends" (utime)',
								isMulti: false,
								isEntitlement: false,
								isGroup: false
							},
							{
								name: 'lastLogon',
								type: 'STRING',
								description: 'Date/Time when this account last logged in (utime)',
								isMulti: false,
								isEntitlement: false,
								isGroup: false
							},
							{
								name: 'modified',
								type: 'STRING',
								description: 'Date/Time when the account was modified (utime)',
								isMulti: false,
								isEntitlement: false,
								isGroup: false
							},
							{
								name: 'startDate',
								type: 'STRING',
								description: 'The date when this account "starts" (utime)',
								isMulti: false,
								isEntitlement: false,
								isGroup: false
							},
							{
								name: 'status',
								type: 'STRING',
								description: 'The status indicator of the account itself',
								isMulti: false,
								isEntitlement: false,
								isGroup: false
							},
							{
								name: 'type',
								type: 'STRING',
								description: 'Defines how the account is used. (Service Account, User Account)',
								isMulti: false,
								isEntitlement: false,
								isGroup: false
							},
							{
								name: 'groups',
								type: 'STRING',
								schema: {
									type: 'CONNECTOR_SCHEMA',
									id: '0629e77972314b6a848628f3a6942983',
									name: 'group'
								},
								description: 'The groups, roles etc. that reference account group objects',
								isMulti: true,
								isEntitlement: true,
								isGroup: true
							},
							{
								name: 'costCenter',
								type: 'STRING',
								description: 'The cost center associated with the account',
								isMulti: false,
								isEntitlement: false,
								isGroup: false
							},
							{
								name: 'country',
								type: 'STRING',
								description: 'The country associated with the account',
								isMulti: false,
								isEntitlement: false,
								isGroup: false
							},
							{
								name: 'department',
								type: 'STRING',
								description: 'The department which this resides in',
								isMulti: false,
								isEntitlement: false,
								isGroup: false
							},
							{
								name: 'division',
								type: 'STRING',
								description: 'The division which this resides in',
								isMulti: false,
								isEntitlement: false,
								isGroup: false
							},
							{
								name: 'email',
								type: 'STRING',
								description: 'The primary email address of the user associated with the account',
								isMulti: false,
								isEntitlement: false,
								isGroup: false
							},
							{
								name: 'employeeNumber',
								type: 'STRING',
								description: 'The employee number associated with the account',
								isMulti: false,
								isEntitlement: false,
								isGroup: false
							},
							{
								name: 'familyName',
								type: 'STRING',
								description:
									'The last, family name, or surname of the user associated with the account',
								isMulti: false,
								isEntitlement: false,
								isGroup: false
							},
							{
								name: 'givenName',
								type: 'STRING',
								description: 'The first or given name of the user associated with the account',
								isMulti: false,
								isEntitlement: false,
								isGroup: false
							},
							{
								name: 'honorificPrefix',
								type: 'STRING',
								description: 'The prefix of the user associated with the account',
								isMulti: false,
								isEntitlement: false,
								isGroup: false
							},
							{
								name: 'honorificSuffix',
								type: 'STRING',
								description: 'The suffix of the user associated with the account',
								isMulti: false,
								isEntitlement: false,
								isGroup: false
							},
							{
								name: 'locale',
								type: 'STRING',
								description: 'The locale of the user associated with the account',
								isMulti: false,
								isEntitlement: false,
								isGroup: false
							},
							{
								name: 'location',
								type: 'STRING',
								description: 'The location associated with this account',
								isMulti: false,
								isEntitlement: false,
								isGroup: false
							},
							{
								name: 'manager',
								type: 'STRING',
								description: 'Reference to the manager of this particular account',
								isMulti: false,
								isEntitlement: false,
								isGroup: false
							},
							{
								name: 'middleName',
								type: 'STRING',
								description: 'The middle name of the user associated with the account',
								isMulti: false,
								isEntitlement: false,
								isGroup: false
							},
							{
								name: 'organization',
								type: 'STRING',
								description: 'The organization which this resides in',
								isMulti: false,
								isEntitlement: false,
								isGroup: false
							},
							{
								name: 'phoneNumber',
								type: 'STRING',
								description: 'The primary phone number of the user associated with the account',
								isMulti: false,
								isEntitlement: false,
								isGroup: false
							},
							{
								name: 'preferredLanguage',
								type: 'STRING',
								description: 'The preferred language of the user associated with the account',
								isMulti: false,
								isEntitlement: false,
								isGroup: false
							},
							{
								name: 'preferredName',
								type: 'STRING',
								description: 'The preferred name to display on the account',
								isMulti: false,
								isEntitlement: false,
								isGroup: false
							},
							{
								name: 'secondaryEmail',
								type: 'STRING',
								description: 'The secondary email addresses of the user associated with an account',
								isMulti: true,
								isEntitlement: false,
								isGroup: false
							},
							{
								name: 'secondaryPhoneNumber',
								type: 'STRING',
								description: 'The secondary phone numbers of the user associated with the account',
								isMulti: true,
								isEntitlement: false,
								isGroup: false
							},
							{
								name: 'timezone',
								type: 'STRING',
								description: 'The timezone of the user associated with the account',
								isMulti: false,
								isEntitlement: false,
								isGroup: false
							},
							{
								name: 'title',
								type: 'STRING',
								description: 'The title of the user associated with the account',
								isMulti: false,
								isEntitlement: false,
								isGroup: false
							},
							{
								name: 'risk',
								type: 'STRING',
								description: 'The score associated with the level of risk',
								isMulti: false,
								isEntitlement: false,
								isGroup: false
							}
						],
						id: '7d75cbc4123340048e2b24a6e844333f',
						name: 'account',
						created: '2023-04-04T21:14:14.220Z',
						modified: '2023-04-06T21:25:06.674Z'
					},
					{
						nativeObjectType: 'Group',
						identityAttribute: 'id',
						displayAttribute: 'displayName',
						includePermissions: false,
						features: [],
						configuration: {},
						attributes: [
							{
								name: 'id',
								type: 'STRING',
								description: 'Unique ID for Group',
								isMulti: false,
								isEntitlement: false,
								isGroup: false
							},
							{
								name: 'name',
								type: 'STRING',
								description: 'The name of the account - typically groupname etc.',
								isMulti: false,
								isEntitlement: false,
								isGroup: false
							},
							{
								name: 'displayName',
								type: 'STRING',
								description: 'The preferred display name for the account',
								isMulti: false,
								isEntitlement: false,
								isGroup: false
							},
							{
								name: 'created',
								type: 'STRING',
								description: 'Date/Time when the group was created (utime)',
								isMulti: false,
								isEntitlement: false,
								isGroup: false
							},
							{
								name: 'description',
								type: 'STRING',
								description: 'Multi-purpose field used to capture a description or comments',
								isMulti: false,
								isEntitlement: false,
								isGroup: false
							},
							{
								name: 'modified',
								type: 'STRING',
								description: 'Date/Time when the group was modified (utime)',
								isMulti: false,
								isEntitlement: false,
								isGroup: false
							},
							{
								name: 'entitlements',
								type: 'STRING',
								description: 'The access rights, entitlements etc. that the account has access to.',
								isMulti: true,
								isEntitlement: true,
								isGroup: false
							},
							{
								name: 'groups',
								type: 'STRING',
								description: 'The groups, roles etc. that reference to account group objects',
								isMulti: true,
								isEntitlement: false,
								isGroup: false
							},
							{
								name: 'permissions',
								type: 'STRING',
								description: 'The permissions associated with the account',
								isMulti: true,
								isEntitlement: false,
								isGroup: false
							}
						],
						id: '0629e77972314b6a848628f3a6942983',
						name: 'group',
						created: '2023-04-04T21:14:14.220Z',
						modified: '2023-04-06T21:25:06.735Z'
					}
				],
				connectorAttributes: {
					mergeColumns: ['groups', 'secondaryEmail', 'secondaryPhoneNumber'],
					'group.mergeRows': true,
					'group.delimiter': ',',
					mergeRows: true,
					'group.filetransport': 'local',
					partitionMode: 'disabled',
					connectionType: 'file',
					'group.host': 'local',
					'group.indexColumn': 'id',
					file: '/var/lib/identityiq_workspace/e1837e9a-ff40-4efb-bf36-f4f9c87c8b74-accounts.csv',
					delimiter: ',',
					host: 'local',
					'group.indexColumns': ['id'],
					indexColumns: ['id'],
					commentCharacter: '#',
					'group.mergeColumns': ['entitlements', 'groups', 'permissions'],
					hasHeader: true,
					filterEmptyRecords: true,
					filetransport: 'local',
					deleteThresholdPercentage: 10,
					'group.filterEmptyRecords': true,
					'group.hasHeader': true,
					'group.partitionMode': 'disabled',
					'group.columnNames': [
						'id',
						'name',
						'displayName',
						'created',
						'description',
						'modified',
						'entitlements',
						'groups',
						'permissions'
					],
					templateApplication: 'DelimitedFile Template',
					'group.file': '/var/lib/identityiq_workspace/1179fb67-d17d-4128-a3c2-088825053933-groups.csv',
					indexColumn: 'id',
					healthy: true,
					cloudDisplayName: 'TestingGenericSource02',
					connectorName: 'Generic',
					cloudOriginalApplicationType: 'Generic',
					since: '2023-04-04T17:10:16.020Z',
					status: 'SOURCE_STATE_UNCHECKED_SOURCE_NO_ACCOUNTS'
				},
				correlationConfigDetails: {
					attributeAssignments: [
						{ complex: false, property: 'name', operation: 'EQ', value: 'id', ignoreCase: false },
						{ complex: false, property: 'email', operation: 'EQ', value: 'email', ignoreCase: false },
						{ complex: false, property: 'name', operation: 'EQ', value: 'name', ignoreCase: false },
						{
							complex: false,
							property: 'identificationNumber',
							operation: 'EQ',
							value: 'employeeNumber',
							ignoreCase: false
						},
						{
							complex: false,
							property: 'displayName',
							operation: 'EQ',
							value: 'displayName',
							ignoreCase: false
						}
					],
					name: 'TestingGenericSource02 [source] Account Correlation',
					id: '6e3166992f934157858002beda6d5d1a'
				},
				provisioningPolicies: [
					{
						name: 'Create Policy',
						description: 'Create Policy',
						usageType: 'CREATE',
						fields: [
							{ name: 'id', attributes: {}, isRequired: false, isMultiValued: false },
							{ name: 'name', attributes: {}, isRequired: false, isMultiValued: false },
							{ name: 'displayName', attributes: {}, isRequired: false, isMultiValued: false },
							{ name: 'comments', attributes: {}, isRequired: false, isMultiValued: false },
							{ name: 'created', attributes: {}, isRequired: false, isMultiValued: false },
							{ name: 'endDate', attributes: {}, isRequired: false, isMultiValued: false },
							{ name: 'lastLogon', attributes: {}, isRequired: false, isMultiValued: false },
							{ name: 'modified', attributes: {}, isRequired: false, isMultiValued: false },
							{ name: 'startDate', attributes: {}, isRequired: false, isMultiValued: false },
							{ name: 'status', attributes: {}, isRequired: false, isMultiValued: false },
							{ name: 'type', attributes: {}, isRequired: false, isMultiValued: false },
							{ name: 'groups', attributes: {}, isRequired: false, isMultiValued: false },
							{ name: 'costCenter', attributes: {}, isRequired: false, isMultiValued: false },
							{ name: 'country', attributes: {}, isRequired: false, isMultiValued: false },
							{ name: 'department', attributes: {}, isRequired: false, isMultiValued: false },
							{ name: 'division', attributes: {}, isRequired: false, isMultiValued: false },
							{ name: 'email', attributes: {}, isRequired: false, isMultiValued: false },
							{ name: 'employeeNumber', attributes: {}, isRequired: false, isMultiValued: false },
							{ name: 'familyName', attributes: {}, isRequired: false, isMultiValued: false },
							{ name: 'givenName', attributes: {}, isRequired: false, isMultiValued: false },
							{ name: 'honorificPrefix', attributes: {}, isRequired: false, isMultiValued: false },
							{ name: 'honorificSuffix', attributes: {}, isRequired: false, isMultiValued: false },
							{ name: 'locale', attributes: {}, isRequired: false, isMultiValued: false },
							{ name: 'location', attributes: {}, isRequired: false, isMultiValued: false },
							{ name: 'manager', attributes: {}, isRequired: false, isMultiValued: false },
							{ name: 'middleName', attributes: {}, isRequired: false, isMultiValued: false },
							{ name: 'organization', attributes: {}, isRequired: false, isMultiValued: false },
							{ name: 'phoneNumber', attributes: {}, isRequired: false, isMultiValued: false },
							{ name: 'preferredLanguage', attributes: {}, isRequired: false, isMultiValued: false },
							{ name: 'preferredName', attributes: {}, isRequired: false, isMultiValued: false },
							{ name: 'secondaryEmail', attributes: {}, isRequired: false, isMultiValued: false },
							{ name: 'secondaryPhoneNumber', attributes: {}, isRequired: false, isMultiValued: false },
							{ name: 'timezone', attributes: {}, isRequired: false, isMultiValued: false },
							{ name: 'title', attributes: {}, isRequired: false, isMultiValued: false },
							{ name: 'risk', attributes: {}, isRequired: false, isMultiValued: false }
						]
					}
				]
			}
		},
		liveObject: {
			jwsHeader: null,
			jwsSignature: null,
			version: 1,
			self: { type: 'SOURCE', id: '9b8ed25c749c458f840a5c1102af2cee', name: 'TestingGenericSource02' },
			object: {
				id: '9b8ed25c749c458f840a5c1102af2cee',
				name: 'TestingGenericSource02',
				type: 'DelimitedFile',
				connectorClass: 'acme.connector.DelimitedFileConnector',
				connectorScriptName: 'delimited-file-angularsc',
				description: 'TestingGenericSource02',
				deleteThreshold: 10,
				provisionAsCsv: true,
				owner: { type: 'IDENTITY', id: 'f87d8c13a3094445b927373ef4cc94d8', name: 'support' },
				features: ['DIRECT_PERMISSIONS', 'NO_RANDOM_ACCESS', 'DISCOVER_SCHEMA']
			}
		},
		operation: ObjectOperationType.CHANGED,
		jsonPatch: [
			{ op: 'add', path: '/connectorAttributes/cloudAuthoritativeSourcePrecedence', value: 80 },
			{ op: 'add', path: '/connectorAttributes/cloudIdentityProfileName', value: 'TestingGenericProfile03' },
			{ op: 'replace', path: '/features/1', value: 'DISCOVER_SCHEMA' },
			{ op: 'replace', path: '/features/2', value: 'NO_RANDOM_ACCESS' }
		],
		hasErrors: false
	}
];

/**
 * Mock data containing a dictionary of objectIds to their corresponding JSON patch operations.
 */
export const mockBaseObjectPatchDictionary: BaseObjectPatchDictionary = {
	c89ffe80feaac121f06055ef8dd7af08: [
		{ op: 'remove', path: '/criteriaList/1' },
		{ op: 'replace', path: '/criteriaList/0/suppressMatchedItems', value: true },
		{ op: 'replace', path: '/criteriaList/0/type', value: 'ACCESS_PROFILE' },
		{ op: 'add', path: '/criteriaList/0/property', value: 'hasProfileConstraints' },
		{ op: 'add', path: '/criteriaList/0/value', value: 'false' },
		{ op: 'add', path: '/criteriaList/0/operation', value: 'EQUALS' },
		{ op: 'add', path: '/totallyNewThing', value: 'newItem' }
	]
};

/**
 * Mock data containing the API payload to deliver when bulk deleting objects from a draft.
 */
export const mockBaseObjectDeletePayload = {
	objectIdsToDelete: ['912f55b7507648c28123288b6d4c95aa', '6fee7a2fb060467199b0ca61d98b24c4'],
	typesToDelete: ['ROLE'],
	objectsToDelete: { AN_OBJECT_TYPE: [] }
};
