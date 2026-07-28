import { RequestState } from '@acme-priv/ui-common/src/acme/angular/util';

import {
	DraftsPageState,
	ObjectDetailsSearchQuery,
	draftDeployInitialState,
	draftScheduleDeployInitialState,
	draftSummaryInitialState,
	draftsPageInitialState,
	getObjectTypeInitialStates,
	objectTypeInitialState
} from '../../drafts/store/states';
import { mockConfigHubDeployJob, mockConfigHubDeployResults } from './job.mock';
import { ObjectOperationType } from './object-details.model';
import { mockConfigHubDraftJobSummary } from './summary.mock';

/**
 * Mock Drafts Page State for 'Draft Summary' storybook stories.
 */
export const mockDraftSummaryDraftsPageState: DraftsPageState = {
	selectedObjectId: null,
	selectedObjectType: null,
	saveRequestState: RequestState.INIT,
	summaryState: {
		...draftSummaryInitialState,
		summary: mockConfigHubDraftJobSummary
	},
	deployState: {
		...draftDeployInitialState,
		deployJob: mockConfigHubDeployJob,
		deployResults: mockConfigHubDeployResults
	},
	scheduledDeployState: {
		...draftScheduleDeployInitialState
	},
	objectTypes: {
		...getObjectTypeInitialStates(mockConfigHubDraftJobSummary)
	},
	approvalsEnabled: false
};

/**
 * Mock Drafts Page State for 'Object Details' storybook stories.
 */
export const mockObjectDetailsDraftsPageState: DraftsPageState = {
	...draftsPageInitialState,
	selectedObjectType: 'ACCESS_PROFILE',
	summaryState: {
		...draftSummaryInitialState,
		summary: {
			targetBackupId: 'mock-targetBackupId',
			sourceBackupId: 'mock-sourceBackupId',
			name: 'My Awesome Backup',
			created: new Date().toISOString(),
			jobId: 'mock-jobId',
			numberOfObjectsSource: 12,
			numberOfObjectsTarget: 11,
			objectBreakdown: {
				ACCESS_PROFILE: {
					same: 10,
					added: 0,
					removed: 1,
					different: 2,
					errors: 0
				}
			},
			sourceTenant: 'mock-sourceTenant',
			sourceBackupName: 'mock-backupName'
		},
		requestState: RequestState.RESOLVED
	},
	objectTypes: {
		ACCESS_PROFILE: {
			selectedOperationType: ObjectOperationType.CHANGED,
			showErrors: false,
			objectDetailsStates: {
				ADDED: {
					ids: [],
					entities: {},
					total: null,
					searchQuery: null,
					requestState: RequestState.RESOLVED
				},
				CHANGED: {
					ids: ['17e3c8fd391a4dcf81957fe3e8d29e51', 'f878c33bde7b43e2aefdeb75e3507ea9'],
					entities: {
						'17e3c8fd391a4dcf81957fe3e8d29e51': {
							tenant: 'acme-dev',
							jobId: '5f0bf3a5-a670-4090-b406-1b9904cfa628',
							objectType: 'ACCESS_PROFILE',
							objectId: '17e3c8fd391a4dcf81957fe3e8d29e51',
							objectName: 'Bulk-AP-ODS-HR-Employees 1',
							object: {
								jwsHeader: null,
								jwsSignature: null,
								version: 1,
								self: {
									type: 'ACCESS_PROFILE',
									id: '17e3c8fd391a4dcf81957fe3e8d29e51',
									name: 'Bulk-AP-ODS-HR-Employees 1'
								},
								object: {
									id: '17e3c8fd391a4dcf81957fe3e8d29e51',
									name: 'Bulk-AP-ODS-HR-Employees 1',
									description: 'Bulk-AP-ODS-HR-Employees 1',
									created: '2023-04-27T16:17:29.940074Z',
									modified: '2023-04-27T16:17:30.115393Z',
									enabled: false,
									owner: {
										type: 'IDENTITY',
										id: '8afadca9b69a4230bdab60cd359784d3',
										name: 'Marion b0f01418b0a'
									},
									source: {
										id: 'c0861bfb76184c6ba9bf7c0ade5404e8',
										type: 'SOURCE',
										name: 'ODS-HR-Employees'
									},
									entitlements: [
										{
											id: '904ff6e1037e41a4893ae10f4c5c74e2',
											type: 'ENTITLEMENT',
											name: 'productivity-arubio-strad'
										},
										{
											id: '583944833f7d4103a01d94ec6c650018',
											type: 'ENTITLEMENT',
											name: 'Inventory-arubio-strad'
										}
									],
									requestable: true,
									accessRequestConfig: {
										approvalSchemes: []
									},
									revocationRequestConfig: {
										approvalSchemes: []
									},
									segments: [],
									segmentRefs: []
								}
							},
							operation: ObjectOperationType.CHANGED,
							jsonPatch: [
								{
									op: 'replace',
									path: '/entitlements/0/id',
									value: '904ff6e1037e41a4893ae10f4c5c74e2'
								}
							],
							hasErrors: false
						},
						f878c33bde7b43e2aefdeb75e3507ea9: {
							tenant: 'acme-dev',
							jobId: '5f0bf3a5-a670-4090-b406-1b9904cfa628',
							objectType: 'ACCESS_PROFILE',
							objectId: 'f878c33bde7b43e2aefdeb75e3507ea9',
							objectName: 'Bulk-AP-ODS-HR-Employees 0',
							object: {
								jwsHeader: null,
								jwsSignature: null,
								version: 1,
								self: {
									type: 'ACCESS_PROFILE',
									id: 'f878c33bde7b43e2aefdeb75e3507ea9',
									name: 'Bulk-AP-ODS-HR-Employees 0'
								},
								object: {
									id: 'f878c33bde7b43e2aefdeb75e3507ea9',
									name: 'Bulk-AP-ODS-HR-Employees 0',
									description: 'Bulk-AP-ODS-HR-Employees 0',
									created: '2023-04-27T16:17:29.034026Z',
									modified: '2023-04-27T16:17:29.134935Z',
									enabled: false,
									owner: {
										type: 'IDENTITY',
										id: '3945bed5d23741889f66c417a8d97e1b',
										name: 'Adan 1138551e4b974'
									},
									source: {
										id: 'c0861bfb76184c6ba9bf7c0ade5404e8',
										type: 'SOURCE',
										name: 'ODS-HR-Employees'
									},
									entitlements: [
										{
											id: '904ff6e1037e41a4893ae10f4c5c74e2',
											type: 'ENTITLEMENT',
											name: 'productivity-arubio-strad'
										}
									],
									requestable: true,
									accessRequestConfig: {
										approvalSchemes: []
									},
									revocationRequestConfig: {
										approvalSchemes: []
									},
									segments: [],
									segmentRefs: []
								}
							},
							operation: ObjectOperationType.CHANGED,
							jsonPatch: [
								{
									op: 'replace',
									path: '/entitlements/0/id',
									value: '904ff6e1037e41a4893ae10f4c5c74e2'
								}
							],
							hasErrors: false
						}
					},
					total: null,
					searchQuery: {
						lastEvaluatedKey: null
					} as ObjectDetailsSearchQuery,
					requestState: RequestState.RESOLVED
				},
				REMOVED: {
					ids: ['f654af05278a4aa189629928ce5564b3'],
					entities: {
						f654af05278a4aa189629928ce5564b3: {
							hasErrors: false,
							jobId: '70bc9728-f5e0-40fd-876a-2732a7753c30',
							object: {
								jwsHeader: null,
								jwsSignature: null,
								version: 1,
								self: {
									type: 'PUBLIC_IDENTITIES_CONFIG',
									id: 'f654af05278a4aa189629928ce5564b3',
									name: 'PublicIdentitiesConfig'
								},
								object: {
									id: 'f654af05278a4aa189629928ce5564b3',
									name: 'My Access Profile',
									attributes: [
										{ key: 'john-country1', name: 'john-country1name' },
										{ key: 'john-country2', name: 'john-country2name' }
									],
									modified: '2023-03-22T21:15:37.801Z',
									modifiedBy: { type: 'IDENTITY', id: 'System', name: 'Identity Name' }
								}
							},
							objectId: 'f654af05278a4aa189629928ce5564b3',
							objectName: 'My Access Profile',
							objectType: 'PUBLIC_IDENTITIES_CONFIG',
							operation: ObjectOperationType.REMOVED
						}
					},
					total: null,
					searchQuery: null,
					requestState: RequestState.RESOLVED
				},
				...objectTypeInitialState
			},
			deselectedObjectIds: {
				[ObjectOperationType.ADDED]: [],
				[ObjectOperationType.CHANGED]: [],
				[ObjectOperationType.REMOVED]: []
			},
			modifiedObjects: {
				[ObjectOperationType.ADDED]: {},
				[ObjectOperationType.CHANGED]: {},
				[ObjectOperationType.REMOVED]: {}
			}
		}
	}
};
