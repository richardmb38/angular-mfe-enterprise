/*
 * Copyright (C) 2023 Acme Technologies, Inc.  All rights reserved.
 */
import { RequestState } from '@acme-priv/ui-common/src/acme/angular/util/atomic-state';

import { draftsApiActions, draftsPageActions } from '../actions';
import { DraftsReducer } from './drafts.reducer';

import {
	BaseObject,
	ObjectDetails,
	ObjectOperationType,
	mockConfigHubDeployJob,
	mockConfigHubDeployResults,
	mockConfigHubDraftJob,
	mockConfigHubDraftJobSummary,
	mockLiveObjectDetails,
	mockObjectDetailsArray,
	mockScheduleJobResponse
} from '../../../shared/models';
import {
	DraftsPageState,
	ObjectDetailsState,
	draftsPageInitialState,
	getObjectTypeInitialStates,
	objectDetailsAtomicStateAdapter,
	objectTypeInitialState
} from '../states';

describe('DraftsReducer', () => {
	const errorMessage = 'There was an error';
	const AN_OBJECT_TYPE = 'AN_OBJECT_TYPE';
	const anObjectId = 'an-object-id';
	const anotherObjectId = 'another-object-id';

	describe('draftsPageLeave, validateSuccess', () => {
		it('should set state to draftsPageInitialState', () => {
			expect(DraftsReducer(draftsPageInitialState, draftsPageActions.draftsPageLeave())).toEqual(
				draftsPageInitialState
			);
		});
	});

	describe('summaryPageLoadSummary', () => {
		it("should set the summaryState's requestState to LOADING", () => {
			expect(
				DraftsReducer(
					draftsPageInitialState,
					draftsPageActions.summaryPageLoadSummary({ draftId: mockConfigHubDraftJob.jobId })
				)
			).toEqual({
				...draftsPageInitialState,
				summaryState: {
					...draftsPageInitialState.summaryState,
					requestState: RequestState.LOADING
				}
			});
		});
	});

	describe('draftSummaryLoadSuccess', () => {
		it("should set the summaryState's requestState to RESOLVED and set the summary and objectTypes", () => {
			expect(
				DraftsReducer(
					draftsPageInitialState,
					draftsApiActions.draftSummaryLoadSuccess({
						draftSummary: mockConfigHubDraftJobSummary,
						approvalsEnabled: true
					})
				)
			).toEqual({
				...draftsPageInitialState,
				summaryState: {
					...draftsPageInitialState.summaryState,
					requestState: RequestState.RESOLVED,
					summary: mockConfigHubDraftJobSummary
				},
				objectTypes: getObjectTypeInitialStates(mockConfigHubDraftJobSummary),
				approvalsEnabled: true
			});
		});
	});

	describe('draftSummaryLoadFailure', () => {
		it("should set the summaryState's requestState to an error message", () => {
			expect(
				DraftsReducer(draftsPageInitialState, draftsApiActions.draftSummaryLoadFailure({ errorMessage }))
			).toEqual({
				...draftsPageInitialState,
				summaryState: {
					...draftsPageInitialState.summaryState,
					requestState: { errorMsg: errorMessage }
				}
			});
		});
	});

	describe('objectTypeSelect', () => {
		it('should remove the objectType from deselectedObjectTypes', () => {
			const stateWithDeselectObjectType: DraftsPageState = {
				...draftsPageInitialState,
				summaryState: {
					...draftsPageInitialState.summaryState,
					deselectedObjectTypes: [AN_OBJECT_TYPE]
				}
			};
			expect(
				DraftsReducer(
					stateWithDeselectObjectType,
					draftsPageActions.objectTypeSelect({ objectType: AN_OBJECT_TYPE })
				)
			).toEqual(draftsPageInitialState);
		});
	});

	describe('objectTypeDeselect', () => {
		it('should add the objectType to deselectedObjectTypes', () => {
			const stateWithDeselectObjectType: DraftsPageState = {
				...draftsPageInitialState,
				summaryState: {
					...draftsPageInitialState.summaryState,
					deselectedObjectTypes: [AN_OBJECT_TYPE]
				}
			};
			expect(
				DraftsReducer(
					draftsPageInitialState,
					draftsPageActions.objectTypeDeselect({ objectType: AN_OBJECT_TYPE })
				)
			).toEqual(stateWithDeselectObjectType);
		});
	});

	describe('objectTypesBulkSelect', () => {
		it('should remove all objectTypes from deselectedObjectTypes', () => {
			const selectedObjectTypes = [AN_OBJECT_TYPE, 'ACCESS_PROFILES', 'GOVERNANCE_GROUPS'];
			const stateWithDeselectObjectType: DraftsPageState = {
				...draftsPageInitialState,
				summaryState: {
					...draftsPageInitialState.summaryState,
					deselectedObjectTypes: selectedObjectTypes
				}
			};
			expect(
				DraftsReducer(
					stateWithDeselectObjectType,
					draftsPageActions.objectTypesBulkSelect({ objectTypes: selectedObjectTypes })
				)
			).toEqual(draftsPageInitialState);
		});
	});

	describe('objectTypesBulkDeselect', () => {
		it('should add all objectTypes to deselectedObjectTypes', () => {
			const deselectedObjectTypes = [AN_OBJECT_TYPE, 'ACCESS_PROFILES', 'GOVERNANCE_GROUPS'];
			const stateWithDeselectObjectType: DraftsPageState = {
				...draftsPageInitialState,
				summaryState: {
					...draftsPageInitialState.summaryState,
					deselectedObjectTypes: deselectedObjectTypes
				}
			};
			expect(
				DraftsReducer(
					draftsPageInitialState,
					draftsPageActions.objectTypesBulkDeselect({ objectTypes: deselectedObjectTypes })
				)
			).toEqual(stateWithDeselectObjectType);
		});
	});

	describe('discardAllDraftChanges', () => {
		it('should revert to initial state', () => {
			const deselectedObjectTypes = [AN_OBJECT_TYPE, 'ACCESS_PROFILES', 'GOVERNANCE_GROUPS'];
			const modifiedState: DraftsPageState = {
				...draftsPageInitialState,
				summaryState: {
					...draftsPageInitialState.summaryState,
					deselectedObjectTypes: deselectedObjectTypes
				},
				objectTypes: {
					AN_OBJECT_TYPE: {
						...objectTypeInitialState,
						deselectedObjectIds: {
							...objectTypeInitialState.deselectedObjectIds,
							[ObjectOperationType.ADDED]: ['mock-id', 'mock-id-2']
						},
						modifiedObjects: {
							...objectTypeInitialState.modifiedObjects,
							[ObjectOperationType.ADDED]: {
								'mock-id-3': {
									name: 'A mock object',
									id: 'mock-id-3'
								}
							}
						}
					}
				}
			};
			expect(DraftsReducer(modifiedState, draftsPageActions.discardAllDraftChanges())).toEqual({
				...draftsPageInitialState,
				objectTypes: { AN_OBJECT_TYPE: objectTypeInitialState }
			});
		});
	});

	describe('viewObjectList, operationTypeChange', () => {
		it("should update the selected objectType's selectedOperationType", () => {
			const stateWithUpdatedSelectOperationType: DraftsPageState = {
				...draftsPageInitialState,
				selectedObjectType: AN_OBJECT_TYPE,
				objectTypes: {
					...draftsPageInitialState.objectTypes,
					AN_OBJECT_TYPE: {
						...objectTypeInitialState,
						selectedOperationType: ObjectOperationType.CHANGED
					}
				}
			};

			expect(
				DraftsReducer(
					{
						...draftsPageInitialState,
						objectTypes: { AN_OBJECT_TYPE: objectTypeInitialState }
					},
					draftsPageActions.viewObjectList({
						objectType: AN_OBJECT_TYPE,
						objectOperationType: ObjectOperationType.CHANGED,
						showErrors: false
					})
				)
			).toEqual(stateWithUpdatedSelectOperationType);
		});
	});

	describe('deployDraft', () => {
		it('should set the deployState to LOADING', () => {
			expect(DraftsReducer(draftsPageInitialState, draftsPageActions.deployDraft())).toEqual({
				...draftsPageInitialState,
				deployState: { ...draftsPageInitialState.deployState, requestState: RequestState.LOADING }
			});
		});
	});

	describe('createDeploySuccess, deploySuccess', () => {
		it("should update the deployState's deployJob", () => {
			expect(
				DraftsReducer(
					draftsPageInitialState,
					draftsApiActions.createDeploySuccess({ deployJob: mockConfigHubDeployJob })
				)
			).toEqual({
				...draftsPageInitialState,
				deployState: { ...draftsPageInitialState.deployState, deployJob: mockConfigHubDeployJob }
			});
		});
	});

	describe('createDeployFailure, deployFailure, loadDeployResultsFailure', () => {
		it("should set the deployState's requestState to an error message", () => {
			expect(
				DraftsReducer(draftsPageInitialState, draftsApiActions.createDeployFailure({ errorMessage }))
			).toEqual({
				...draftsPageInitialState,
				deployState: {
					...draftsPageInitialState.deployState,
					requestState: { errorMsg: errorMessage }
				}
			});
		});
	});

	describe('loadDeployResultsSuccess', () => {
		it("should update the deployState's deployResults and requestState to RESOLVED", () => {
			expect(
				DraftsReducer(
					draftsPageInitialState,
					draftsApiActions.loadDeployResultsSuccess({ deployResults: mockConfigHubDeployResults })
				)
			).toEqual({
				...draftsPageInitialState,
				deployState: {
					...draftsPageInitialState.deployState,
					deployResults: mockConfigHubDeployResults,
					requestState: RequestState.RESOLVED
				}
			});
		});
	});

	describe('scheduleDeployDraft', () => {
		it('should set the scheduledDeployState to LOADING', () => {
			expect(
				DraftsReducer(
					draftsPageInitialState,
					draftsPageActions.scheduleDeployDraft({ startTime: '12-01-01T13:00:00Z00.00' })
				)
			).toEqual({
				...draftsPageInitialState,
				scheduledDeployState: {
					...draftsPageInitialState.scheduledDeployState,
					requestState: RequestState.LOADING
				}
			});
		});
	});

	describe('scheduleDeployDraftSuccess', () => {
		it("should update the scheduledDeployState's scheduledJob", () => {
			expect(
				DraftsReducer(
					draftsPageInitialState,
					draftsApiActions.scheduleDeploySuccess({ scheduledJob: mockScheduleJobResponse })
				)
			).toEqual({
				...draftsPageInitialState,
				scheduledDeployState: {
					...draftsPageInitialState.scheduledDeployState,
					scheduledJob: mockScheduleJobResponse,
					requestState: RequestState.RESOLVED
				}
			});
		});
	});

	describe('scheduleDeployFailure', () => {
		it("should set the scheduledDeployState's requestState to an error message", () => {
			expect(
				DraftsReducer(draftsPageInitialState, draftsApiActions.scheduleDeployFailure({ errorMessage }))
			).toEqual({
				...draftsPageInitialState,
				scheduledDeployState: {
					...draftsPageInitialState.scheduledDeployState,
					requestState: RequestState.FAILED
				}
			});
		});
	});

	describe('objectListLoadMore', () => {
		it("should set the objectType's objectDetailsState to LOADING for the selected objectOperationType", () => {
			expect(
				DraftsReducer(
					{
						...draftsPageInitialState,
						objectTypes: { AN_OBJECT_TYPE: objectTypeInitialState }
					},
					draftsPageActions.objectListLoadMore({
						objectType: AN_OBJECT_TYPE,
						objectOperationType: ObjectOperationType.CHANGED,
						requestedAmount: 1
					})
				)
			).toEqual(<DraftsPageState>{
				...draftsPageInitialState,
				objectTypes: {
					...draftsPageInitialState.objectTypes,
					AN_OBJECT_TYPE: {
						...objectTypeInitialState,
						objectDetailsStates: {
							...objectTypeInitialState.objectDetailsStates,
							[ObjectOperationType.CHANGED]: {
								...objectTypeInitialState.objectDetailsStates[ObjectOperationType.CHANGED],
								requestState: RequestState.LOADING
							}
						}
					}
				}
			});
		});
	});

	describe('objectDetailsLoadSuccess', () => {
		it("should set the objectType's objectDetailsState to RESOLVED and add received entities for the selected objectOperationType", () => {
			const mockApiListResponse = {
				items: mockObjectDetailsArray,
				nextToken: 'next-token'
			};

			const initialState: DraftsPageState = {
				...draftsPageInitialState,
				objectTypes: { AN_OBJECT_TYPE: objectTypeInitialState }
			};

			const loadedObjectDetailsState: ObjectDetailsState = objectDetailsAtomicStateAdapter.addMany(
				mockApiListResponse.items,
				{
					...initialState.objectTypes[AN_OBJECT_TYPE].objectDetailsStates[ObjectOperationType.CHANGED],
					searchQuery: {
						...initialState.objectTypes[AN_OBJECT_TYPE].objectDetailsStates[ObjectOperationType.CHANGED]
							.searchQuery,
						lastEvaluatedKey: mockApiListResponse.nextToken
					},
					requestState: RequestState.RESOLVED
				}
			);

			expect(
				DraftsReducer(
					initialState,
					draftsApiActions.objectDetailsLoadSuccess({
						objectType: AN_OBJECT_TYPE,
						objectOperationType: ObjectOperationType.CHANGED,
						objectDetailsListResponse: mockApiListResponse
					})
				)
			).toEqual(<DraftsPageState>{
				...initialState,
				objectTypes: {
					...initialState.objectTypes,
					AN_OBJECT_TYPE: {
						...objectTypeInitialState,
						objectDetailsStates: {
							...objectTypeInitialState.objectDetailsStates,
							[ObjectOperationType.CHANGED]: loadedObjectDetailsState
						}
					}
				}
			});
		});
	});

	describe('objectDetailsLoadFailure', () => {
		it("should set the objectType's objectDetailsState to an error message for the selected objectOperationType", () => {
			expect(
				DraftsReducer(
					{
						...draftsPageInitialState,
						objectTypes: { AN_OBJECT_TYPE: objectTypeInitialState }
					},
					draftsApiActions.objectDetailsLoadFailure({
						objectType: AN_OBJECT_TYPE,
						objectOperationType: ObjectOperationType.CHANGED,
						errorMessage: errorMessage
					})
				)
			).toEqual(<DraftsPageState>{
				...draftsPageInitialState,
				objectTypes: {
					...draftsPageInitialState.objectTypes,
					AN_OBJECT_TYPE: {
						...objectTypeInitialState,
						objectDetailsStates: {
							...objectTypeInitialState.objectDetailsStates,
							[ObjectOperationType.CHANGED]: {
								...objectTypeInitialState.objectDetailsStates[ObjectOperationType.CHANGED],
								requestState: { errorMsg: errorMessage }
							}
						}
					}
				}
			});
		});
	});

	describe('loadObjectLiveConfigurationSuccess', () => {
		it("should set the objectType's objectDetailsState to RESOLVED and add received entities for the selected objectOperationType", () => {
			const mockLiveConfigurationObjectResponse = mockLiveObjectDetails;

			const initialState: DraftsPageState = {
				...draftsPageInitialState,
				objectTypes: {
					[AN_OBJECT_TYPE]: {
						...objectTypeInitialState,
						objectDetailsStates: {
							...objectTypeInitialState.objectDetailsStates,
							[ObjectOperationType.CHANGED]: {
								...objectTypeInitialState.objectDetailsStates[ObjectOperationType.CHANGED],
								entities: mockObjectDetailsArray.reduce<{ [key: string]: ObjectDetails }>(
									(updatedEntities, objectDetails) => {
										return { ...updatedEntities, [objectDetails.objectId]: objectDetails };
									},
									{}
								)
							}
						}
					}
				}
			};

			const updatedObjectLiveConfigState: ObjectDetailsState = objectDetailsAtomicStateAdapter.updateOne(
				{
					id: mockObjectDetailsArray[1].objectId,
					changes: {
						liveObject: JSON.parse(mockLiveConfigurationObjectResponse.object)
					}
				},
				{
					...initialState.objectTypes[AN_OBJECT_TYPE].objectDetailsStates[ObjectOperationType.CHANGED],
					requestState: RequestState.RESOLVED
				}
			);

			expect(
				DraftsReducer(
					initialState,
					draftsApiActions.loadObjectLiveConfigurationSuccess({
						objectType: AN_OBJECT_TYPE,
						operationType: ObjectOperationType.CHANGED,
						objectConfiguration: mockLiveConfigurationObjectResponse,
						objectId: mockObjectDetailsArray[1].objectId
					})
				)
			).toEqual(<DraftsPageState>{
				...initialState,
				objectTypes: {
					...initialState.objectTypes,
					AN_OBJECT_TYPE: {
						...objectTypeInitialState,
						objectDetailsStates: {
							...objectTypeInitialState.objectDetailsStates,
							[ObjectOperationType.CHANGED]: updatedObjectLiveConfigState
						}
					}
				}
			});
		});
	});

	describe('loadObjectLiveConfigurationFailure', () => {
		it("should set the objectType's objectDetailsState to RESOLVED and add received entities for the selected objectOperationType", () => {
			const initialState: DraftsPageState = {
				...draftsPageInitialState,
				objectTypes: {
					[AN_OBJECT_TYPE]: {
						...objectTypeInitialState,
						objectDetailsStates: {
							...objectTypeInitialState.objectDetailsStates,
							[ObjectOperationType.CHANGED]: {
								...objectTypeInitialState.objectDetailsStates[ObjectOperationType.CHANGED],
								entities: mockObjectDetailsArray.reduce<{ [key: string]: ObjectDetails }>(
									(updatedEntities, objectDetails) => {
										return { ...updatedEntities, [objectDetails.objectId]: objectDetails };
									},
									{}
								)
							}
						}
					}
				}
			};

			const updatedObjectLiveConfigState: ObjectDetailsState = objectDetailsAtomicStateAdapter.updateOne(
				{
					id: mockObjectDetailsArray[1].objectId,
					changes: {
						liveObject: undefined
					}
				},
				{
					...initialState.objectTypes[AN_OBJECT_TYPE].objectDetailsStates[ObjectOperationType.CHANGED],
					requestState: { errorMsg: 'error' }
				}
			);

			expect(
				DraftsReducer(
					initialState,
					draftsApiActions.loadObjectLiveConfigurationFailure({
						objectType: AN_OBJECT_TYPE,
						operationType: ObjectOperationType.CHANGED,
						errorMessage: 'error',
						objectId: mockObjectDetailsArray[1].objectId
					})
				)
			).toEqual(<DraftsPageState>{
				...initialState,
				objectTypes: {
					...initialState.objectTypes,
					AN_OBJECT_TYPE: {
						...objectTypeInitialState,
						objectDetailsStates: {
							...objectTypeInitialState.objectDetailsStates,
							[ObjectOperationType.CHANGED]: updatedObjectLiveConfigState
						}
					}
				}
			});
		});
	});

	describe('objectListSearchTermChange', () => {
		it("should set the objectType's searchQuery for the selected objectOperationType", () => {
			const searchQuery = 'test-search-query';

			expect(
				DraftsReducer(
					{
						...draftsPageInitialState,
						objectTypes: { AN_OBJECT_TYPE: objectTypeInitialState }
					},
					draftsPageActions.objectListSearchTermChange({
						objectType: AN_OBJECT_TYPE,
						objectOperationType: ObjectOperationType.CHANGED,
						searchQuery: searchQuery
					})
				)
			).toEqual(<DraftsPageState>{
				...draftsPageInitialState,
				objectTypes: {
					...draftsPageInitialState.objectTypes,
					AN_OBJECT_TYPE: {
						...objectTypeInitialState,
						objectDetailsStates: {
							...objectTypeInitialState.objectDetailsStates,
							[ObjectOperationType.CHANGED]: {
								...objectTypeInitialState.objectDetailsStates[ObjectOperationType.CHANGED],
								searchQuery: {
									...objectTypeInitialState.objectDetailsStates[ObjectOperationType.CHANGED]
										.searchQuery,
									query: searchQuery
								}
							}
						}
					}
				}
			});
		});
	});

	describe('objectListSortChange', () => {
		it("should set the objectType's sortAttribute for the selected objectOperationType", () => {
			const sortAttribute = 'test-sort-attribute';

			expect(
				DraftsReducer(
					{
						...draftsPageInitialState,
						objectTypes: { AN_OBJECT_TYPE: objectTypeInitialState }
					},
					draftsPageActions.objectListSortChange({
						objectType: AN_OBJECT_TYPE,
						objectOperationType: ObjectOperationType.CHANGED,
						sortAttribute: sortAttribute
					})
				)
			).toEqual(<DraftsPageState>{
				...draftsPageInitialState,
				objectTypes: {
					...draftsPageInitialState.objectTypes,
					AN_OBJECT_TYPE: {
						...objectTypeInitialState,
						objectDetailsStates: {
							...objectTypeInitialState.objectDetailsStates,
							[ObjectOperationType.CHANGED]: {
								...objectTypeInitialState.objectDetailsStates[ObjectOperationType.CHANGED],
								searchQuery: {
									...objectTypeInitialState.objectDetailsStates[ObjectOperationType.CHANGED]
										.searchQuery,
									sortAttribute: sortAttribute
								}
							}
						}
					}
				}
			});
		});
	});

	describe('objectListPageNumberChange', () => {
		it("should set the objectType's currentPage for the selected objectOperationType", () => {
			const currentPage = 5;

			expect(
				DraftsReducer(
					{
						...draftsPageInitialState,
						objectTypes: { AN_OBJECT_TYPE: objectTypeInitialState }
					},
					draftsPageActions.objectListPageNumberChange({
						objectType: AN_OBJECT_TYPE,
						objectOperationType: ObjectOperationType.CHANGED,
						pageNumber: currentPage
					})
				)
			).toEqual(<DraftsPageState>{
				...draftsPageInitialState,
				objectTypes: {
					...draftsPageInitialState.objectTypes,
					AN_OBJECT_TYPE: {
						...objectTypeInitialState,
						objectDetailsStates: {
							...objectTypeInitialState.objectDetailsStates,
							[ObjectOperationType.CHANGED]: {
								...objectTypeInitialState.objectDetailsStates[ObjectOperationType.CHANGED],
								searchQuery: {
									...objectTypeInitialState.objectDetailsStates[ObjectOperationType.CHANGED]
										.searchQuery,
									currentPage: currentPage
								}
							}
						}
					}
				}
			});
		});
	});

	describe('objectListPageSizeChange', () => {
		it("should set the objectType's limit for the selected objectOperationType", () => {
			const pageSize = 7;

			expect(
				DraftsReducer(
					{
						...draftsPageInitialState,
						objectTypes: { AN_OBJECT_TYPE: objectTypeInitialState }
					},
					draftsPageActions.objectListPageSizeChange({
						objectType: AN_OBJECT_TYPE,
						objectOperationType: ObjectOperationType.CHANGED,
						pageSize: pageSize
					})
				)
			).toEqual(<DraftsPageState>{
				...draftsPageInitialState,
				objectTypes: {
					...draftsPageInitialState.objectTypes,
					AN_OBJECT_TYPE: {
						...objectTypeInitialState,
						objectDetailsStates: {
							...objectTypeInitialState.objectDetailsStates,
							[ObjectOperationType.CHANGED]: {
								...objectTypeInitialState.objectDetailsStates[ObjectOperationType.CHANGED],
								searchQuery: {
									...objectTypeInitialState.objectDetailsStates[ObjectOperationType.CHANGED]
										.searchQuery,
									limit: pageSize
								}
							}
						}
					}
				}
			});
		});
	});

	describe('objectSelect', () => {
		it('should remove the objectId from deselectedObjectIds', () => {
			const initialState: DraftsPageState = {
				...draftsPageInitialState,
				selectedObjectType: AN_OBJECT_TYPE,
				objectTypes: {
					...draftsPageInitialState.objectTypes,
					AN_OBJECT_TYPE: {
						...objectTypeInitialState,
						deselectedObjectIds: {
							...objectTypeInitialState.deselectedObjectIds,
							[ObjectOperationType.ADDED]: [anObjectId, anotherObjectId]
						}
					}
				}
			};

			const reducedState: DraftsPageState = {
				...initialState,
				selectedObjectType: AN_OBJECT_TYPE,
				objectTypes: {
					...initialState.objectTypes,
					AN_OBJECT_TYPE: {
						...initialState.objectTypes[AN_OBJECT_TYPE],
						deselectedObjectIds: {
							...initialState.objectTypes[AN_OBJECT_TYPE].deselectedObjectIds,
							[ObjectOperationType.ADDED]: [anotherObjectId]
						}
					}
				}
			};
			expect(
				DraftsReducer(
					initialState,
					draftsPageActions.objectSelect({
						objectType: AN_OBJECT_TYPE,
						objectOperationType: ObjectOperationType.ADDED,
						objectId: anObjectId
					})
				)
			).toEqual(reducedState);
		});
	});

	describe('objectDeselect', () => {
		it('should add the objectId to deselectedObjectIds', () => {
			const initialState: DraftsPageState = {
				...draftsPageInitialState,
				selectedObjectType: AN_OBJECT_TYPE,
				objectTypes: {
					...draftsPageInitialState.objectTypes,
					AN_OBJECT_TYPE: {
						...objectTypeInitialState,
						deselectedObjectIds: {
							...objectTypeInitialState.deselectedObjectIds,
							[ObjectOperationType.ADDED]: [anObjectId]
						}
					}
				}
			};

			const reducedState: DraftsPageState = {
				...initialState,
				selectedObjectType: AN_OBJECT_TYPE,
				objectTypes: {
					...initialState.objectTypes,
					AN_OBJECT_TYPE: {
						...initialState.objectTypes[AN_OBJECT_TYPE],
						deselectedObjectIds: {
							...initialState.objectTypes[AN_OBJECT_TYPE].deselectedObjectIds,
							[ObjectOperationType.ADDED]: [anObjectId, anotherObjectId]
						}
					}
				}
			};
			expect(
				DraftsReducer(
					initialState,
					draftsPageActions.objectDeselect({
						objectType: AN_OBJECT_TYPE,
						objectOperationType: ObjectOperationType.ADDED,
						objectId: anotherObjectId
					})
				)
			).toEqual(reducedState);
		});
	});

	describe('objectBulkDeselect', () => {
		it('should add all objectIds to deselectedObjectIds', () => {
			const initialState: DraftsPageState = {
				...draftsPageInitialState,
				selectedObjectType: AN_OBJECT_TYPE,
				objectTypes: {
					...draftsPageInitialState.objectTypes,
					AN_OBJECT_TYPE: {
						...objectTypeInitialState,
						deselectedObjectIds: {
							...objectTypeInitialState.deselectedObjectIds,
							[ObjectOperationType.ADDED]: []
						}
					}
				}
			};

			const reducedState: DraftsPageState = {
				...initialState,
				selectedObjectType: AN_OBJECT_TYPE,
				objectTypes: {
					...initialState.objectTypes,
					AN_OBJECT_TYPE: {
						...initialState.objectTypes[AN_OBJECT_TYPE],
						deselectedObjectIds: {
							...initialState.objectTypes[AN_OBJECT_TYPE].deselectedObjectIds,
							[ObjectOperationType.ADDED]: [anObjectId, anotherObjectId]
						}
					}
				}
			};

			expect(
				DraftsReducer(
					initialState,
					draftsPageActions.objectBulkDeselect({
						objectType: AN_OBJECT_TYPE,
						objectIds: [anObjectId, anotherObjectId],
						objectOperationType: ObjectOperationType.ADDED
					})
				)
			).toEqual(reducedState);
		});
	});

	describe('objectBulkSelect', () => {
		it('should remove all objectIds from deselectedObjectIds', () => {
			const initialState: DraftsPageState = {
				...draftsPageInitialState,
				selectedObjectType: AN_OBJECT_TYPE,
				objectTypes: {
					...draftsPageInitialState.objectTypes,
					AN_OBJECT_TYPE: {
						...objectTypeInitialState,
						deselectedObjectIds: {
							...objectTypeInitialState.deselectedObjectIds,
							[ObjectOperationType.ADDED]: [anObjectId, anotherObjectId]
						}
					}
				}
			};

			const reducedState: DraftsPageState = {
				...initialState,
				selectedObjectType: AN_OBJECT_TYPE,
				objectTypes: {
					...initialState.objectTypes,
					AN_OBJECT_TYPE: {
						...initialState.objectTypes[AN_OBJECT_TYPE],
						deselectedObjectIds: {
							...initialState.objectTypes[AN_OBJECT_TYPE].deselectedObjectIds,
							[ObjectOperationType.ADDED]: []
						}
					}
				}
			};

			expect(
				DraftsReducer(
					initialState,
					draftsPageActions.objectBulkSelect({
						objectType: AN_OBJECT_TYPE,
						objectIds: [anObjectId, anotherObjectId],
						objectOperationType: ObjectOperationType.ADDED
					})
				)
			).toEqual(reducedState);
		});
	});

	describe('viewObjectDetails', () => {
		it('should update the selectedObjectId', () => {
			expect(
				DraftsReducer(
					draftsPageInitialState,
					draftsPageActions.viewObjectDetails({
						objectId: anObjectId
					})
				)
			).toEqual({ ...draftsPageInitialState, selectedObjectId: anObjectId });
		});
	});

	describe('closeObjectDetails', () => {
		it('should set the selectedObjectId to null', () => {
			const initialState: DraftsPageState = {
				...draftsPageInitialState,
				selectedObjectId: anObjectId
			};

			expect(DraftsReducer(initialState, draftsPageActions.closeObjectDetails())).toEqual(draftsPageInitialState);
		});
	});

	describe('objectJsonChangesSaved', () => {
		it('should add the objectJson to modifiedObjects', () => {
			const mockModifiedObject: BaseObject = {
				...mockObjectDetailsArray[3].object.object,
				testAttribute: 'test'
			};

			const initialState: DraftsPageState = {
				...draftsPageInitialState,
				objectTypes: { AN_OBJECT_TYPE: objectTypeInitialState }
			};

			const reducedState: DraftsPageState = {
				...initialState,
				objectTypes: {
					...initialState.objectTypes,
					AN_OBJECT_TYPE: {
						...initialState.objectTypes[AN_OBJECT_TYPE],
						modifiedObjects: {
							...initialState.objectTypes[AN_OBJECT_TYPE].modifiedObjects,
							[ObjectOperationType.ADDED]: {
								[mockModifiedObject.id]: mockModifiedObject
							}
						}
					}
				}
			};
			expect(
				DraftsReducer(
					{
						...draftsPageInitialState,
						objectTypes: { AN_OBJECT_TYPE: objectTypeInitialState }
					},
					draftsPageActions.objectJsonChangesSaved({
						objectType: AN_OBJECT_TYPE,
						objectOperationType: ObjectOperationType.ADDED,
						objectId: mockModifiedObject.id,
						objectJson: mockModifiedObject
					})
				)
			).toEqual(reducedState);
		});
	});

	describe('saveAllDraftChanges', () => {
		it('should set the saveRequestState to LOADING', () => {
			expect(DraftsReducer(draftsPageInitialState, draftsPageActions.saveAllDraftChanges())).toEqual({
				...draftsPageInitialState,
				saveRequestState: RequestState.LOADING
			});
		});
	});

	describe('bulkPatchFailure, bulkDeleteFailure, validateFailure', () => {
		it('should set the saveRequestState to an error message', () => {
			expect(DraftsReducer(draftsPageInitialState, draftsApiActions.bulkDeleteFailure({ errorMessage }))).toEqual(
				{
					...draftsPageInitialState,
					saveRequestState: { errorMsg: errorMessage }
				}
			);
		});
	});
});
