/*
 * Copyright (C) 2023 Acme Technologies, Inc.  All rights reserved.
 */
import { createReducer, on } from '@ngrx/store';

import { RequestState } from '@acme-priv/ui-common/src/acme/angular/util';

import * as draftsApiActions from '../actions/drafts-api.actions';
import * as draftsPageActions from '../actions/drafts-page.actions';

import {
	DraftsPageState,
	ObjectTypeState,
	draftsPageInitialState,
	getObjectTypeInitialStates,
	objectDetailsAtomicStateAdapter,
	objectTypeInitialState
} from '../states';
import { ObjectOperationType } from 'app/components/config-hub/shared/models';

export const DraftsReducer = createReducer(
	draftsPageInitialState,

	on(draftsPageActions.draftsPageLeave, draftsApiActions.validateSuccess, () => ({ ...draftsPageInitialState })),

	/**
	 * Summary Page
	 */
	on(
		draftsPageActions.summaryPageLoadSummary,
		(state): DraftsPageState => ({
			...state,
			summaryState: {
				...state.summaryState,
				requestState: RequestState.LOADING
			}
		})
	),

	on(
		draftsApiActions.draftSummaryLoadSuccess,
		(state, { draftSummary, approvalsEnabled }): DraftsPageState => ({
			...state,
			summaryState: {
				...state.summaryState,
				requestState: RequestState.RESOLVED,
				summary: draftSummary
			},
			objectTypes: getObjectTypeInitialStates(draftSummary),
			approvalsEnabled: approvalsEnabled
		})
	),

	on(
		draftsApiActions.draftSummaryLoadFailure,
		(state, { errorMessage }): DraftsPageState => ({
			...state,
			summaryState: {
				...state.summaryState,
				requestState: { errorMsg: errorMessage }
			}
		})
	),

	on(
		draftsPageActions.objectTypeSelect,
		(state, { objectType }): DraftsPageState => ({
			...state,
			summaryState: {
				...state.summaryState,
				deselectedObjectTypes: state.summaryState.deselectedObjectTypes.filter(
					deselectedObjectType => deselectedObjectType !== objectType
				)
			}
		})
	),

	on(
		draftsPageActions.objectTypeDeselect,
		(state, { objectType }): DraftsPageState => ({
			...state,
			summaryState: {
				...state.summaryState,
				deselectedObjectTypes: state.summaryState.deselectedObjectTypes.includes(objectType)
					? state.summaryState.deselectedObjectTypes
					: [...state.summaryState.deselectedObjectTypes, objectType]
			}
		})
	),

	on(
		draftsPageActions.objectTypesBulkSelect,
		(state, { objectTypes }): DraftsPageState => ({
			...state,
			summaryState: {
				...state.summaryState,
				deselectedObjectTypes: state.summaryState.deselectedObjectTypes.filter(
					deselectedObjectType => !objectTypes.includes(deselectedObjectType)
				)
			}
		})
	),

	on(
		draftsPageActions.objectTypesBulkDeselect,
		(state, { objectTypes }): DraftsPageState => ({
			...state,
			summaryState: {
				...state.summaryState,
				deselectedObjectTypes: [...new Set([...state.summaryState.deselectedObjectTypes, ...objectTypes])]
			}
		})
	),

	on(
		draftsPageActions.discardAllDraftChanges,
		(state): DraftsPageState => ({
			...state,
			summaryState: {
				...state.summaryState,
				deselectedObjectTypes: []
			},
			objectTypes: Object.keys(state.objectTypes).reduce<{ [objectType: string]: ObjectTypeState }>(
				(updatedObjectTypes, objectType) => ({
					...updatedObjectTypes,
					[objectType]: {
						...state.objectTypes[objectType],
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
				}),
				{}
			)
		})
	),

	on(
		draftsPageActions.viewObjectList,
		draftsPageActions.operationTypeChange,
		(state, { objectType, objectOperationType, showErrors }): DraftsPageState => ({
			...state,
			selectedObjectType: objectType,
			objectTypes: {
				...state.objectTypes,
				[objectType]: {
					...state.objectTypes[objectType],
					selectedOperationType: objectOperationType,
					showErrors,
					objectDetailsStates: {
						...(showErrors || state.objectTypes[objectType].showErrors
							? objectTypeInitialState.objectDetailsStates
							: state.objectTypes[objectType].objectDetailsStates)
					}
				}
			}
		})
	),

	on(
		draftsPageActions.deployDraft,
		(state): DraftsPageState => ({
			...state,
			deployState: {
				...state.deployState,
				requestState: RequestState.LOADING
			}
		})
	),

	on(
		draftsApiActions.createDeploySuccess,
		draftsApiActions.deploySuccess,
		(state, { deployJob }): DraftsPageState => ({
			...state,
			deployState: {
				...state.deployState,
				deployJob: deployJob
			}
		})
	),

	on(
		draftsApiActions.createDeployFailure,
		draftsApiActions.deployFailure,
		draftsApiActions.loadDeployResultsFailure,
		(state, { errorMessage }): DraftsPageState => ({
			...state,
			deployState: {
				...state.deployState,
				requestState: { errorMsg: errorMessage }
			}
		})
	),

	on(
		draftsApiActions.loadDeployResultsSuccess,
		(state, { deployResults }): DraftsPageState => ({
			...state,
			deployState: {
				...state.deployState,
				deployResults: deployResults,
				requestState: RequestState.RESOLVED
			}
		})
	),

	on(
		draftsPageActions.scheduleDeployDraft,
		(state): DraftsPageState => ({
			...state,
			scheduledDeployState: {
				...state.scheduledDeployState,
				requestState: RequestState.LOADING
			}
		})
	),

	on(
		draftsApiActions.scheduleDeploySuccess,
		(state, { scheduledJob }): DraftsPageState => ({
			...state,
			scheduledDeployState: {
				...state.scheduledDeployState,
				scheduledJob: scheduledJob,
				requestState: RequestState.RESOLVED
			}
		})
	),

	on(
		draftsApiActions.scheduleDeployFailure,
		(state): DraftsPageState => ({
			...state,
			scheduledDeployState: {
				...state.scheduledDeployState,
				requestState: RequestState.FAILED
			}
		})
	),

	/**
	 * Objects List Page
	 */
	on(
		draftsPageActions.objectListLoadMore,
		(state, { objectType, objectOperationType }): DraftsPageState => ({
			...state,
			objectTypes: {
				...state.objectTypes,
				[objectType]: {
					...state.objectTypes[objectType],
					objectDetailsStates: {
						...state.objectTypes[objectType].objectDetailsStates,
						[objectOperationType]: {
							...state.objectTypes[objectType].objectDetailsStates[objectOperationType],
							requestState: RequestState.LOADING
						}
					}
				}
			}
		})
	),

	on(
		draftsApiActions.objectDetailsLoadSuccess,
		(state, { objectType, objectOperationType, objectDetailsListResponse }): DraftsPageState => ({
			...state,
			objectTypes: {
				...state.objectTypes,
				[objectType]: {
					...state.objectTypes[objectType],
					objectDetailsStates: {
						...state.objectTypes[objectType].objectDetailsStates,
						[objectOperationType]: objectDetailsAtomicStateAdapter.addMany(
							objectDetailsListResponse.items,
							{
								...state.objectTypes[objectType].objectDetailsStates[objectOperationType],
								searchQuery: {
									...state.objectTypes[objectType].objectDetailsStates[objectOperationType]
										.searchQuery,
									lastEvaluatedKey: objectDetailsListResponse.nextToken,

									// If the received nextToken is null, we are on the final page of available data.
									finalPage: objectDetailsListResponse.nextToken
										? null
										: state.objectTypes[objectType].objectDetailsStates[objectOperationType]
												.searchQuery.currentPage
								},
								requestState: RequestState.RESOLVED
							}
						)
					}
				}
			}
		})
	),

	on(
		draftsApiActions.objectDetailsLoadFailure,
		(state, { objectType, objectOperationType, errorMessage }): DraftsPageState => ({
			...state,
			objectTypes: {
				...state.objectTypes,
				[objectType]: {
					...state.objectTypes[objectType],
					objectDetailsStates: {
						...state.objectTypes[objectType].objectDetailsStates,
						[objectOperationType]: {
							...state.objectTypes[objectType].objectDetailsStates[objectOperationType],
							requestState: { errorMsg: errorMessage }
						}
					}
				}
			}
		})
	),

	on(
		draftsApiActions.loadObjectLiveConfigurationSuccess,
		(state, { objectId, objectType, operationType, objectConfiguration }): DraftsPageState => ({
			...state,
			objectTypes: {
				...state.objectTypes,
				[objectType]: {
					...state.objectTypes[objectType],
					objectDetailsStates: {
						...state.objectTypes[objectType].objectDetailsStates,
						[operationType]: objectDetailsAtomicStateAdapter.updateOne(
							{
								id: objectId,
								changes: {
									liveObject: JSON.parse(objectConfiguration.object)
								}
							},
							{
								...state.objectTypes[objectType].objectDetailsStates[operationType],
								requestState: RequestState.RESOLVED
							}
						)
					}
				}
			}
		})
	),

	on(
		draftsApiActions.loadObjectLiveConfigurationFailure,
		(state, { objectId, objectType, operationType, errorMessage }): DraftsPageState => ({
			...state,
			objectTypes: {
				...state.objectTypes,
				[objectType]: {
					...state.objectTypes[objectType],
					objectDetailsStates: {
						...state.objectTypes[objectType].objectDetailsStates,
						[operationType]: objectDetailsAtomicStateAdapter.updateOne(
							{
								id: objectId,
								changes: {
									liveObject: undefined
								}
							},
							{
								...state.objectTypes[objectType].objectDetailsStates[operationType],
								requestState: { errorMsg: errorMessage }
							}
						)
					}
				}
			}
		})
	),

	on(
		draftsPageActions.objectListSearchTermChange,
		(state, { objectType, objectOperationType, searchQuery }): DraftsPageState => ({
			...state,
			objectTypes: {
				...state.objectTypes,
				[objectType]: {
					...state.objectTypes[objectType],
					objectDetailsStates: {
						...state.objectTypes[objectType].objectDetailsStates,
						[objectOperationType]: objectDetailsAtomicStateAdapter.removeAll({
							...state.objectTypes[objectType].objectDetailsStates[objectOperationType],
							searchQuery: {
								...state.objectTypes[objectType].objectDetailsStates[objectOperationType].searchQuery,
								query: searchQuery,
								lastEvaluatedKey: null,
								finalPage: null,
								currentPage: 1
							}
						})
					}
				}
			}
		})
	),

	on(
		draftsPageActions.objectListSortChange,
		(state, { objectType, objectOperationType, sortAttribute }): DraftsPageState => ({
			...state,
			objectTypes: {
				...state.objectTypes,
				[objectType]: {
					...state.objectTypes[objectType],
					objectDetailsStates: {
						...state.objectTypes[objectType].objectDetailsStates,
						[objectOperationType]: {
							...state.objectTypes[objectType].objectDetailsStates[objectOperationType],
							searchQuery: {
								...state.objectTypes[objectType].objectDetailsStates[objectOperationType].searchQuery,
								sortAttribute: sortAttribute
							}
						}
					}
				}
			}
		})
	),

	on(
		draftsPageActions.objectListPageNumberChange,
		(state, { objectType, objectOperationType, pageNumber }): DraftsPageState => ({
			...state,
			objectTypes: {
				...state.objectTypes,
				[objectType]: {
					...state.objectTypes[objectType],
					objectDetailsStates: {
						...state.objectTypes[objectType].objectDetailsStates,
						[objectOperationType]: {
							...state.objectTypes[objectType].objectDetailsStates[objectOperationType],
							searchQuery: {
								...state.objectTypes[objectType].objectDetailsStates[objectOperationType].searchQuery,
								currentPage: pageNumber
							}
						}
					}
				}
			}
		})
	),

	on(
		draftsPageActions.objectListPageSizeChange,
		(state, { objectType, objectOperationType, pageSize }): DraftsPageState => ({
			...state,
			objectTypes: {
				...state.objectTypes,
				[objectType]: {
					...state.objectTypes[objectType],
					objectDetailsStates: {
						...state.objectTypes[objectType].objectDetailsStates,
						[objectOperationType]: {
							...state.objectTypes[objectType].objectDetailsStates[objectOperationType],
							searchQuery: {
								...state.objectTypes[objectType].objectDetailsStates[objectOperationType].searchQuery,
								limit: pageSize,
								currentPage: 1,
								finalPage: state.objectTypes[objectType].objectDetailsStates[objectOperationType]
									.searchQuery.finalPage
									? Math.ceil(
											state.objectTypes[objectType].objectDetailsStates[objectOperationType].ids
												.length / pageSize
										)
									: null
							}
						}
					}
				}
			}
		})
	),

	on(
		draftsPageActions.objectSelect,
		(state, { objectType, objectOperationType, objectId }): DraftsPageState => ({
			...state,
			objectTypes: {
				...state.objectTypes,
				[objectType]: {
					...state.objectTypes[objectType],
					deselectedObjectIds: {
						...state.objectTypes[objectType].deselectedObjectIds,
						[objectOperationType]: state.objectTypes[objectType].deselectedObjectIds[
							objectOperationType
						].filter(deselectedObjectId => deselectedObjectId !== objectId)
					}
				}
			}
		})
	),

	on(
		draftsPageActions.objectDeselect,
		(state, { objectType, objectOperationType, objectId }): DraftsPageState => ({
			...state,
			objectTypes: {
				...state.objectTypes,
				[objectType]: {
					...state.objectTypes[objectType],
					deselectedObjectIds: {
						...state.objectTypes[objectType].deselectedObjectIds,
						[objectOperationType]: state.objectTypes[objectType].deselectedObjectIds[
							objectOperationType
						].includes(objectId)
							? state.objectTypes[objectType].deselectedObjectIds[objectOperationType]
							: [...state.objectTypes[objectType].deselectedObjectIds[objectOperationType], objectId]
					}
				}
			}
		})
	),

	on(
		draftsPageActions.objectBulkSelect,
		(state, { objectType, objectOperationType, objectIds }): DraftsPageState => ({
			...state,
			objectTypes: {
				...state.objectTypes,
				[objectType]: {
					...state.objectTypes[objectType],
					deselectedObjectIds: {
						...state.objectTypes[objectType].deselectedObjectIds,
						[objectOperationType]: state.objectTypes[objectType].deselectedObjectIds[
							objectOperationType
						].filter(deselectedObjectId => !objectIds.includes(deselectedObjectId))
					}
				}
			}
		})
	),

	on(
		draftsPageActions.objectBulkDeselect,
		(state, { objectType, objectOperationType, objectIds }): DraftsPageState => ({
			...state,
			objectTypes: {
				...state.objectTypes,
				[objectType]: {
					...state.objectTypes[objectType],
					deselectedObjectIds: {
						...state.objectTypes[objectType].deselectedObjectIds,
						[objectOperationType]: [
							...new Set([
								...state.objectTypes[objectType].deselectedObjectIds[objectOperationType],
								...objectIds
							])
						]
					}
				}
			}
		})
	),

	on(
		draftsPageActions.viewObjectDetails,
		(state, { objectId }): DraftsPageState => ({
			...state,
			selectedObjectId: objectId
		})
	),

	on(
		draftsPageActions.closeObjectDetails,
		(state): DraftsPageState => ({
			...state,
			selectedObjectId: null
		})
	),

	on(
		draftsPageActions.objectJsonChangesSaved,
		(state, { objectType, objectOperationType, objectId, objectJson }): DraftsPageState => ({
			...state,
			objectTypes: {
				...state.objectTypes,
				[objectType]: {
					...state.objectTypes[objectType],
					modifiedObjects: {
						...state.objectTypes[objectType].modifiedObjects,
						[objectOperationType]: {
							...state.objectTypes[objectType].modifiedObjects[objectOperationType],
							[objectId]: objectJson
						}
					}
				}
			}
		})
	),

	/**
	 * Save Draft
	 */
	on(
		draftsPageActions.saveAllDraftChanges,
		(state): DraftsPageState => ({
			...state,
			saveRequestState: RequestState.LOADING
		})
	),

	on(
		draftsApiActions.bulkPatchFailure,
		draftsApiActions.bulkDeleteFailure,
		draftsApiActions.initValidateFailure,
		draftsApiActions.validateFailure,
		(state, { errorMessage }): DraftsPageState => ({
			...state,
			saveRequestState: { errorMsg: errorMessage }
		})
	),

	on(
		draftsApiActions.updateApprovalStatus,
		(state): DraftsPageState => ({
			...state,
			summaryState: {
				...state.summaryState,
				requestState: RequestState.LOADING
			}
		})
	),

	on(
		draftsApiActions.updateApprovalStatusSuccess,
		(state, { approvalStatus, approvalComment }): DraftsPageState => ({
			...state,
			summaryState: {
				...state.summaryState,
				requestState: RequestState.RESOLVED,
				summary: {
					...state.summaryState.summary,
					approvalStatus: approvalStatus,
					approvalComment: approvalComment
				}
			}
		})
	),

	on(
		draftsApiActions.updateApprovalStatusFailure,
		(state, { errorMessage }): DraftsPageState => ({
			...state,
			summaryState: {
				...state.summaryState,
				requestState: { errorMsg: errorMessage }
			}
		})
	)
);
