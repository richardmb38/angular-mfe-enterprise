/*
 * Copyright (C) 2023 Acme Technologies, Inc.  All rights reserved.
 */
import { RequestState } from '@acme-priv/ui-common/src/acme/angular/util';

import { fromDraftsPage } from '../selectors';

import {
	BaseObject,
	ConfigHubDraftSummary,
	ConfigHubJobStatus,
	ObjectDetails,
	ObjectOperationType,
	mockBaseObjectDeletePayload,
	mockBaseObjectPatchDictionary,
	mockConfigHubDeployJob,
	mockConfigHubDeployResults,
	mockConfigHubDraftJobSummary,
	mockObjectDetailsArray
} from '../../../shared/models';
import {
	getAvailableOperationTypes,
	getCompareSummaryObjectTotals,
	getCompareSummaryRowData,
	getSingleSummaryTotal
} from '../../../shared/utils';
import { objectOperationTabTitles } from '../../details/draft-details.model';
import { DraftsPageState, ObjectDetailsSearchQuery, draftsPageInitialState, objectTypeInitialState } from '../states';
import { compare as JSONPatchCompare } from 'fast-json-patch';

describe('fromDraftsPage', () => {
	const AN_OBJECT_TYPE = 'AN_OBJECT_TYPE';
	const DESELECTED_OBJECT_TYPE = 'DESELECTED_OBJECT_TYPE';
	const ACCESS_PROFILE = 'ACCESS_PROFILE';
	const mockModifiedObject: BaseObject = {
		...mockObjectDetailsArray[3].object.object,
		testAttribute: 'test'
	};

	const state: DraftsPageState = {
		...draftsPageInitialState,
		selectedObjectType: ACCESS_PROFILE,
		summaryState: {
			...draftsPageInitialState.summaryState,
			summary: mockConfigHubDraftJobSummary,
			deselectedObjectTypes: [DESELECTED_OBJECT_TYPE]
		},
		deployState: {
			...draftsPageInitialState.deployState,
			deployJob: mockConfigHubDeployJob,
			deployResults: mockConfigHubDeployResults
		},
		objectTypes: {
			[ACCESS_PROFILE]: objectTypeInitialState,
			[DESELECTED_OBJECT_TYPE]: objectTypeInitialState,
			[AN_OBJECT_TYPE]: {
				...objectTypeInitialState,
				deselectedObjectIds: {
					...objectTypeInitialState.deselectedObjectIds,
					[ObjectOperationType.ADDED]: [
						mockObjectDetailsArray[0].objectId,
						mockObjectDetailsArray[1].objectId
					]
				},
				modifiedObjects: {
					...objectTypeInitialState.modifiedObjects,
					[ObjectOperationType.ADDED]: {
						[mockModifiedObject.id]: mockModifiedObject
					}
				},
				objectDetailsStates: {
					...objectTypeInitialState.objectDetailsStates,
					[ObjectOperationType.ADDED]: {
						...objectTypeInitialState.objectDetailsStates[ObjectOperationType.ADDED],
						entities: mockObjectDetailsArray.reduce<{ [key: string]: ObjectDetails }>(
							(updatedEntities, objectDetails) => {
								return { ...updatedEntities, [objectDetails.objectId]: objectDetails };
							},
							{}
						)
					},
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

	describe('DraftsPageState', () => {
		describe('selectSelectedObjectType', () => {
			it('should return the selectedObjectType', () => {
				expect(fromDraftsPage.selectSelectedObjectType.projector(state)).toEqual(state.selectedObjectType);
			});
		});

		describe('selectSelectedObjectId', () => {
			it('should return the selectedObjectId', () => {
				expect(fromDraftsPage.selectSelectedObjectId.projector(state)).toEqual(state.selectedObjectId);
			});
		});

		describe('selectSaveRequestState', () => {
			it('should return the saveRequestState', () => {
				expect(fromDraftsPage.selectSaveRequestState.projector(state)).toEqual(state.saveRequestState);
			});
		});

		describe('selectSaveStateIsLoading', () => {
			it('should return whether the saveRequestState is LOADING', () => {
				expect(fromDraftsPage.selectSaveStateIsLoading.projector(state.saveRequestState)).toEqual(
					state.saveRequestState === RequestState.LOADING
				);
			});
		});

		describe('selectSummaryState', () => {
			it('should return the summaryState', () => {
				expect(fromDraftsPage.selectSummaryState.projector(state)).toEqual(state.summaryState);
			});
		});

		describe('selectDeployState', () => {
			it('should return the deployState', () => {
				expect(fromDraftsPage.selectDeployState.projector(state)).toEqual(state.deployState);
			});
		});

		describe('selectObjectTypes', () => {
			it('should return the objectTypes', () => {
				expect(fromDraftsPage.selectObjectTypes.projector(state)).toEqual(state.objectTypes);
			});
		});

		describe('selectObjectTypeState', () => {
			it('should return the ObjectTypeState for the given objectType', () => {
				expect(
					fromDraftsPage
						.selectObjectTypeState('AN_OBJECT_TYPE')
						.projector(state.objectTypes, state.selectedObjectType)
				).toEqual(state.objectTypes['AN_OBJECT_TYPE']);
			});

			it('should return the ObjectTypeState for the selected object when no objectType is given', () => {
				expect(
					fromDraftsPage.selectObjectTypeState().projector(state.objectTypes, state.selectedObjectType)
				).toEqual(state.objectTypes[ACCESS_PROFILE]);
			});
		});

		describe('selectObjectTypeShowErrorState', () => {
			it('should return the selectObjectTypeShowErrorState for the given objectType and select type', () => {
				expect(
					fromDraftsPage.selectObjectTypeShowErrorState.projector(state.objectTypes, state.selectedObjectType)
				).toEqual(state.objectTypes['AN_OBJECT_TYPE'].showErrors);
			});
		});
	});

	describe('DraftsPageState.summaryState', () => {
		const mockSummary = {
			...state.summaryState.summary,
			objectBreakdown: {
				AN_OBJECT_TYPE: state.summaryState.summary.objectBreakdown[ACCESS_PROFILE]
			}
		} as ConfigHubDraftSummary;

		describe('selectSummary', () => {
			it('should return the summary', () => {
				expect(fromDraftsPage.selectSummary.projector(state.summaryState)).toEqual(state.summaryState.summary);
			});
		});

		describe('selectDeselectedObjectTypes', () => {
			it('should return the deselectedObjectTypes', () => {
				expect(fromDraftsPage.selectDeselectedObjectTypes.projector(state.summaryState)).toEqual(
					state.summaryState.deselectedObjectTypes
				);
			});
		});

		describe('selectIsObjectTypeDeselected', () => {
			it('should return whether or not the given objectType is included in the deselectedObjectTypes array ', () => {
				expect(
					fromDraftsPage
						.selectIsObjectTypeDeselected(AN_OBJECT_TYPE)
						.projector(state.summaryState.deselectedObjectTypes)
				).toEqual(state.summaryState.deselectedObjectTypes.includes(AN_OBJECT_TYPE));
			});
		});

		describe('selectSummaryStateRequestState', () => {
			it("should return the summaryState's requestState", () => {
				expect(fromDraftsPage.selectSummaryStateRequestState.projector(state.summaryState)).toEqual(
					state.summaryState.requestState
				);
			});
		});

		describe('selectSummaryIsInit', () => {
			it("should return whether the summaryState's requestState is INIT", () => {
				expect(fromDraftsPage.selectSummaryIsInit.projector(state.summaryState.requestState)).toEqual(
					state.summaryState.requestState === RequestState.INIT
				);
			});
		});

		describe('selectSummaryIsLoading', () => {
			it("should return whether the summaryState's requestState is LOADING", () => {
				expect(fromDraftsPage.selectSummaryIsLoading.projector(state.summaryState.requestState)).toEqual(
					state.summaryState.requestState === RequestState.LOADING
				);
			});
		});

		describe('selectSummaryRowData', () => {
			it('should return ConfigHubCompareSummaryRow[] data', () => {
				expect(fromDraftsPage.selectSummaryRowData.projector(mockSummary, state.objectTypes)).toEqual(
					getCompareSummaryRowData(mockSummary, state.objectTypes)
				);
			});
		});

		describe('selectHasErrors', () => {
			it('should return false if no objectTypes in the objectBreakdown have errors > 0', () => {
				expect(
					fromDraftsPage.selectHasErrors.projector(getCompareSummaryRowData(mockSummary, state.objectTypes))
				).toEqual(false);
			});

			it('should return true if any objectType in the objectBreakdown has errors > 0', () => {
				mockSummary.objectBreakdown[AN_OBJECT_TYPE].errors = 2;

				expect(
					fromDraftsPage.selectHasErrors.projector(getCompareSummaryRowData(mockSummary, state.objectTypes))
				).toEqual(true);
			});
		});

		describe('selectSummaryObjectTotals', () => {
			it('should return ConfigHubDraftObjectTotals data', () => {
				const rowData = getCompareSummaryRowData(mockSummary, state.objectTypes);

				expect(fromDraftsPage.selectSummaryObjectTotals.projector(rowData, [])).toEqual(
					getCompareSummaryObjectTotals(rowData, [])
				);
			});
		});

		describe('selectSingleSummarydTotal', () => {
			it('should return ConfigHubCompareSummaryRow[] data', () => {
				expect(fromDraftsPage.selectSingleSummarydTotal.projector(mockSummary, ACCESS_PROFILE)).toEqual(
					getSingleSummaryTotal(mockSummary, ACCESS_PROFILE)
				);
			});
		});
	});

	describe('DraftsPageState.deployState', () => {
		describe('selectDeployJob', () => {
			it('should return the deployJob', () => {
				expect(fromDraftsPage.selectDeployJob.projector(state.deployState)).toEqual(
					state.deployState.deployJob
				);
			});
		});

		describe('selectDeployResults', () => {
			it('should return the deploy results', () => {
				expect(fromDraftsPage.selectDeployResults.projector(state.deployState)).toEqual(
					state.deployState.deployResults
				);
			});
		});

		describe('selectDeployStateRequestState', () => {
			it("should return the deployState's requestState", () => {
				expect(fromDraftsPage.selectDeployStateRequestState.projector(state.deployState)).toEqual(
					state.deployState.requestState
				);
			});
		});

		describe('selectDeployIsInit', () => {
			it("should return whether the deployState's requestState is INIT", () => {
				expect(fromDraftsPage.selectDeployIsInit.projector(state.deployState.requestState)).toEqual(
					state.deployState.requestState === RequestState.INIT
				);
			});
		});

		describe('selectDeployIsLoading', () => {
			it("should return whether the deployState's requestState is LOADING", () => {
				expect(fromDraftsPage.selectDeployIsLoading.projector(state.deployState.requestState)).toEqual(
					state.deployState.requestState === RequestState.LOADING
				);
			});
		});

		describe('selectDeployStatusIsFailed', () => {
			it("should return whether the deployJob's status is FAILED", () => {
				expect(fromDraftsPage.selectDeployStatusIsFailed.projector(state.deployState.deployJob)).toEqual(
					state.deployState.deployJob.status === ConfigHubJobStatus.FAILED
				);
			});
		});

		describe('selectDeployStatusIsComplete', () => {
			it("should return whether the deployJob's status is COMPLETE", () => {
				expect(fromDraftsPage.selectDeployStatusIsComplete.projector(state.deployState.deployJob)).toEqual(
					state.deployState.deployJob.status === ConfigHubJobStatus.COMPLETE
				);
			});
		});

		describe('selectDeployIsComplete', () => {
			it("should return whether the deployState's requestState is FAILED, STOPPED, or RESOLVED", () => {
				const deployStateRequestState = state.deployState.requestState;

				expect(fromDraftsPage.selectDeployIsComplete.projector(state.deployState.requestState)).toEqual(
					deployStateRequestState === RequestState.FAILED ||
						deployStateRequestState === RequestState.STOPPED ||
						deployStateRequestState === RequestState.RESOLVED
				);
			});
		});
	});

	describe('DraftsPageState.summaryState.summary', () => {
		describe('selectDraftId', () => {
			it('should return the draftId', () => {
				expect(fromDraftsPage.selectDraftId.projector(state.summaryState.summary)).toEqual(
					state.summaryState.summary.jobId
				);
			});
		});

		describe('selectDraftName', () => {
			it('should return the draft name', () => {
				expect(fromDraftsPage.selectDraftName.projector(state.summaryState.summary)).toEqual(
					state.summaryState.summary.name
				);
			});
		});

		describe('selectSourceBackupId', () => {
			it('should return the sourceBackupId', () => {
				expect(fromDraftsPage.selectSourceBackupId.projector(state.summaryState.summary)).toEqual(
					state.summaryState.summary.sourceBackupId
				);
			});
		});

		describe('selectTargetBackupId', () => {
			it('should return the targetBackupId', () => {
				expect(fromDraftsPage.selectTargetBackupId.projector(state.summaryState.summary)).toEqual(
					state.summaryState.summary.targetBackupId
				);
			});
		});

		describe('selectNumberOfObjectsSource', () => {
			it('should return the numberOfObjectsSource', () => {
				expect(fromDraftsPage.selectNumberOfObjectsSource.projector(state.summaryState.summary)).toEqual(
					state.summaryState.summary.numberOfObjectsSource
				);
			});
		});

		describe('selectNumberOfObjectsTarget', () => {
			it('should return the numberOfObjectsTarget', () => {
				expect(fromDraftsPage.selectNumberOfObjectsTarget.projector(state.summaryState.summary)).toEqual(
					state.summaryState.summary.numberOfObjectsTarget
				);
			});
		});

		describe('selectObjectBreakdown', () => {
			it('should return the objectBreakdown', () => {
				expect(fromDraftsPage.selectObjectBreakdown.projector(state.summaryState.summary)).toEqual(
					state.summaryState.summary.objectBreakdown
				);
			});
		});
	});

	describe('DraftsPageState.objectTypes[AN_OBJECT_TYPE]', () => {
		describe('selectAvailableOperationTypes', () => {
			it('should return available ObjectOperationTypes', () => {
				expect(
					fromDraftsPage
						.selectAvailableOperationTypes(ACCESS_PROFILE)
						.projector(AN_OBJECT_TYPE, state.summaryState.summary.objectBreakdown)
				).toEqual(getAvailableOperationTypes(state.summaryState.summary.objectBreakdown[ACCESS_PROFILE]));
			});
		});

		describe('selectIsOperationTypeAvailable', () => {
			it('should return if an ObjectOperationType is available for AN_OBJECT_TYPE', () => {
				expect(
					fromDraftsPage
						.selectIsOperationTypeAvailable(ObjectOperationType.ADDED, AN_OBJECT_TYPE)
						.projector(
							getAvailableOperationTypes(state.summaryState.summary.objectBreakdown[ACCESS_PROFILE])
						)
				).toEqual(
					getAvailableOperationTypes(state.summaryState.summary.objectBreakdown[ACCESS_PROFILE]).includes(
						ObjectOperationType.ADDED
					)
				);
			});
		});

		describe('selectSelectedOperationTypeTitle', () => {
			it('should return the operationType title', () => {
				expect(
					fromDraftsPage.selectSelectedOperationTypeTitle(AN_OBJECT_TYPE).projector(ObjectOperationType.ADDED)
				).toEqual(objectOperationTabTitles[ObjectOperationType.ADDED]);
			});
		});

		describe('selectIsObjectEditingAvailable', () => {
			it('should return true if the operation type is not "REMOVED"', () => {
				expect(
					fromDraftsPage.selectIsObjectEditingAvailable(AN_OBJECT_TYPE).projector(ObjectOperationType.ADDED)
				).toEqual(true);
			});

			it('should return false if the operation type not "REMOVED"', () => {
				expect(
					fromDraftsPage.selectIsObjectEditingAvailable(AN_OBJECT_TYPE).projector(ObjectOperationType.REMOVED)
				).toEqual(false);
			});
		});

		describe('selectSelectedOperationType', () => {
			it('should return the selectedOperationType for AN_OBJECT_TYPE', () => {
				expect(
					fromDraftsPage
						.selectSelectedOperationType(AN_OBJECT_TYPE)
						.projector(state.objectTypes[AN_OBJECT_TYPE])
				).toEqual(state.objectTypes[AN_OBJECT_TYPE].selectedOperationType);
			});
		});

		describe('selectObjectDetailsStates', () => {
			it('should return the objectDetailsStates for AN_OBJECT_TYPE', () => {
				expect(
					fromDraftsPage
						.selectObjectDetailsStates(AN_OBJECT_TYPE)
						.projector(state.objectTypes[AN_OBJECT_TYPE])
				).toEqual(state.objectTypes[AN_OBJECT_TYPE].objectDetailsStates);
			});
		});

		describe('selectObjectDetailsStateByOperation', () => {
			it('should return the objectDetailsStates for AN_OBJECT_TYPE by ADDED', () => {
				expect(
					fromDraftsPage
						.selectObjectDetailsStateByOperation(AN_OBJECT_TYPE, ObjectOperationType.ADDED)
						.projector(state.objectTypes[AN_OBJECT_TYPE].objectDetailsStates, ObjectOperationType.ADDED)
				).toEqual(state.objectTypes[AN_OBJECT_TYPE].objectDetailsStates[ObjectOperationType.ADDED]);
			});
		});

		describe('selectDeselectedObjectIds', () => {
			it('should return the deselectedObjectIds for AN_OBJECT_TYPE', () => {
				expect(
					fromDraftsPage
						.selectDeselectedObjectIds(AN_OBJECT_TYPE)
						.projector(state.objectTypes[AN_OBJECT_TYPE])
				).toEqual(state.objectTypes[AN_OBJECT_TYPE].deselectedObjectIds);
			});
		});

		describe('selectIsObjectDeselected', () => {
			it('should return whether or not an id is included in deselectedObjectIds', () => {
				expect(
					fromDraftsPage
						.selectIsObjectDeselected(mockModifiedObject.id, AN_OBJECT_TYPE, ObjectOperationType.ADDED)
						.projector(state.objectTypes[AN_OBJECT_TYPE].deselectedObjectIds, null as any)
				).toEqual(
					state.objectTypes[AN_OBJECT_TYPE].deselectedObjectIds[ObjectOperationType.ADDED].includes(
						mockModifiedObject.id
					)
				);
			});
		});

		describe('selectModifiedObjects', () => {
			it('should return the modifiedObjects for AN_OBJECT_TYPE', () => {
				expect(
					fromDraftsPage.selectModifiedObjects(AN_OBJECT_TYPE).projector(state.objectTypes[AN_OBJECT_TYPE])
				).toEqual(state.objectTypes[AN_OBJECT_TYPE].modifiedObjects);
			});
		});

		describe('selectModifiedObjectsByOperation', () => {
			it('should return the modifiedObjects for AN_OBJECT_TYPE', () => {
				expect(
					fromDraftsPage
						.selectModifiedObjectsByOperation(AN_OBJECT_TYPE, ObjectOperationType.ADDED)
						.projector(state.objectTypes[AN_OBJECT_TYPE], ObjectOperationType.ADDED)
				).toEqual(state.objectTypes[AN_OBJECT_TYPE].modifiedObjects[ObjectOperationType.ADDED]);
			});
		});

		describe('selectIsObjectModified', () => {
			it('should return whether or not an id is included in modifiedObjects', () => {
				expect(
					fromDraftsPage
						.selectIsObjectModified(mockModifiedObject.id, AN_OBJECT_TYPE, ObjectOperationType.ADDED)
						.projector(state.objectTypes[AN_OBJECT_TYPE].modifiedObjects as any)
				).toEqual(state.objectTypes[AN_OBJECT_TYPE].modifiedObjects.hasOwnProperty(mockModifiedObject.id));
			});
		});

		describe('selectLiveObject', () => {
			it('should return the live object configuration for a given objectId', () => {
				expect(
					fromDraftsPage
						.selectLiveObject(
							mockObjectDetailsArray[1].objectId,
							AN_OBJECT_TYPE,
							ObjectOperationType.CHANGED
						)
						.projector(
							state.objectTypes[AN_OBJECT_TYPE].objectDetailsStates[ObjectOperationType.CHANGED].entities[
								mockObjectDetailsArray[1].objectId
							]
						)
				).toEqual(
					state.objectTypes[AN_OBJECT_TYPE].objectDetailsStates[ObjectOperationType.CHANGED].entities[
						mockObjectDetailsArray[1].objectId
					]?.liveObject
				);
			});
		});

		describe('selectLiveObjectStringified', () => {
			it('should return the live object configuration for a given objectId', () => {
				expect(
					fromDraftsPage
						.selectLiveObjectStringified(
							mockObjectDetailsArray[1].objectId,
							AN_OBJECT_TYPE,
							ObjectOperationType.CHANGED
						)
						.projector(
							state.objectTypes[AN_OBJECT_TYPE].objectDetailsStates[ObjectOperationType.CHANGED].entities[
								mockObjectDetailsArray[1].objectId
							]?.liveObject
						)
				).toEqual(
					JSON.stringify(
						state.objectTypes[AN_OBJECT_TYPE].objectDetailsStates[ObjectOperationType.CHANGED].entities[
							mockObjectDetailsArray[1].objectId
						]?.liveObject?.object,
						null,
						2
					)
				);
			});
		});

		describe('selectObjectDetails', () => {
			it('should return ObjectDetails for a given objectId', () => {
				expect(
					fromDraftsPage
						.selectObjectDetails(mockModifiedObject.id, AN_OBJECT_TYPE, ObjectOperationType.ADDED)
						.projector(
							mockModifiedObject.id,
							state.objectTypes[AN_OBJECT_TYPE].objectDetailsStates[ObjectOperationType.ADDED].entities
						)
				).toEqual(
					state.objectTypes[AN_OBJECT_TYPE].objectDetailsStates[ObjectOperationType.ADDED].entities[
						mockModifiedObject.id
					]
				);
			});
		});

		describe('selectModifiedBaseObject', () => {
			it('should return the modified BaseObject for a given objectId if it has been modified', () => {
				expect(
					fromDraftsPage
						.selectModifiedBaseObject(mockModifiedObject.id, AN_OBJECT_TYPE, ObjectOperationType.ADDED)
						.projector(mockModifiedObject.id, state.objectTypes[AN_OBJECT_TYPE].modifiedObjects as any)
				).toEqual(state.objectTypes[AN_OBJECT_TYPE].modifiedObjects[mockModifiedObject.id]);
			});
		});

		describe('selectBaseObject', () => {
			it('should return the modified BaseObject for a given objectId if it has been modified', () => {
				expect(
					fromDraftsPage
						.selectBaseObject(mockModifiedObject.id, AN_OBJECT_TYPE, ObjectOperationType.ADDED)
						.projector(
							state.objectTypes[AN_OBJECT_TYPE].objectDetailsStates[ObjectOperationType.ADDED].entities[
								mockModifiedObject.id
							],
							state.objectTypes[AN_OBJECT_TYPE].modifiedObjects[ObjectOperationType.ADDED][
								mockModifiedObject.id
							]
						)
				).toEqual(
					state.objectTypes[AN_OBJECT_TYPE].modifiedObjects[ObjectOperationType.ADDED][mockModifiedObject.id]
				);
			});

			it('should return the original BaseObject for a given objectId if it has not been modified', () => {
				expect(
					fromDraftsPage
						.selectBaseObject(mockObjectDetailsArray[0].objectId, AN_OBJECT_TYPE, ObjectOperationType.ADDED)
						.projector(
							state.objectTypes[AN_OBJECT_TYPE].objectDetailsStates[ObjectOperationType.ADDED].entities[
								mockObjectDetailsArray[0].objectId
							],
							state.objectTypes[AN_OBJECT_TYPE].modifiedObjects[mockObjectDetailsArray[0].objectId]
						)
				).toEqual(
					state.objectTypes[AN_OBJECT_TYPE].objectDetailsStates[ObjectOperationType.ADDED].entities[
						mockObjectDetailsArray[0].objectId
					]?.object.object
				);
			});
		});

		describe('selectBaseObjectStringified', () => {
			it('should return the stringified BaseObject for a given objectId', () => {
				expect(
					fromDraftsPage
						.selectBaseObjectStringified(mockModifiedObject.id, AN_OBJECT_TYPE, ObjectOperationType.ADDED)
						.projector(state.objectTypes[AN_OBJECT_TYPE].modifiedObjects[mockModifiedObject.id])
				).toEqual(
					JSON.stringify(state.objectTypes[AN_OBJECT_TYPE].modifiedObjects[mockModifiedObject.id], null, 2)
				);
			});
		});

		describe('selectSearchQuery', () => {
			it('should return the searchQuery for AN_OBJECT_TYPE by ADDED', () => {
				expect(
					fromDraftsPage
						.selectSearchQuery(AN_OBJECT_TYPE, ObjectOperationType.ADDED)
						.projector(
							state.objectTypes[AN_OBJECT_TYPE].objectDetailsStates[ObjectOperationType.ADDED].searchQuery
						)
				).toEqual(state.objectTypes[AN_OBJECT_TYPE].objectDetailsStates[ObjectOperationType.ADDED].searchQuery);
			});
		});

		describe('selectCurrentPage', () => {
			it('should return the current page for AN_OBJECT_TYPE by ADDED', () => {
				expect(
					fromDraftsPage
						.selectCurrentPage(AN_OBJECT_TYPE, ObjectOperationType.ADDED)
						.projector(
							state.objectTypes[AN_OBJECT_TYPE].objectDetailsStates[ObjectOperationType.ADDED]
								.searchQuery as ObjectDetailsSearchQuery
						)
				).toEqual(
					state.objectTypes[AN_OBJECT_TYPE].objectDetailsStates[ObjectOperationType.ADDED].searchQuery
						.currentPage
				);
			});
		});

		describe('selectFinalPage', () => {
			it('should return the final page for AN_OBJECT_TYPE by ADDED', () => {
				expect(
					fromDraftsPage
						.selectFinalPage(AN_OBJECT_TYPE, ObjectOperationType.ADDED)
						.projector(
							state.objectTypes[AN_OBJECT_TYPE].objectDetailsStates[ObjectOperationType.ADDED]
								.searchQuery as ObjectDetailsSearchQuery
						)
				).toEqual(
					state.objectTypes[AN_OBJECT_TYPE].objectDetailsStates[ObjectOperationType.ADDED].searchQuery
						.finalPage
				);
			});
		});

		describe('selectPageSize', () => {
			it('should return the page size for AN_OBJECT_TYPE by ADDED', () => {
				expect(
					fromDraftsPage
						.selectPageSize(AN_OBJECT_TYPE, ObjectOperationType.ADDED)
						.projector(
							state.objectTypes[AN_OBJECT_TYPE].objectDetailsStates[ObjectOperationType.ADDED]
								.searchQuery as ObjectDetailsSearchQuery
						)
				).toEqual(
					state.objectTypes[AN_OBJECT_TYPE].objectDetailsStates[ObjectOperationType.ADDED].searchQuery.limit
				);
			});
		});

		describe('selectObjectDetailsPage', () => {
			it('should return an array of objectDetails for a given page and pageSize for AN_OBJECT_TYPE by ADDED', () => {
				expect(
					fromDraftsPage
						.selectObjectDetailsPage(1, 2, AN_OBJECT_TYPE, ObjectOperationType.ADDED)
						.projector(mockObjectDetailsArray, 2, 1)
				).toEqual(mockObjectDetailsArray.slice(0, 2));
			});
		});
	});

	describe('Meta', () => {
		describe('selectIsDraftDirty', () => {
			it('should return true if the draft has been modified', () => {
				expect(
					fromDraftsPage.selectIsDraftDirty.projector(
						state.summaryState.deselectedObjectTypes,
						state.objectTypes
					)
				).toEqual(true);
			});

			it('should return false if the draft has not been modified', () => {
				expect(
					fromDraftsPage.selectIsDraftDirty.projector(
						draftsPageInitialState.summaryState.deselectedObjectTypes,
						draftsPageInitialState.objectTypes
					)
				).toEqual(false);
			});
		});

		describe('selectIsDraftEmpty', () => {
			const mockSummary = {
				...state.summaryState.summary,
				objectBreakdown: {
					AN_OBJECT_TYPE: state.summaryState.summary.objectBreakdown[ACCESS_PROFILE]
				}
			} as ConfigHubDraftSummary;

			it('should return true if the object breakdown from the draft is empty', () => {
				expect(fromDraftsPage.selectIsDraftEmpty.projector([])).toEqual(true);
			});

			it('should return true if the object breakdown from the draft is not empty', () => {
				expect(
					fromDraftsPage.selectIsDraftEmpty.projector(
						getCompareSummaryRowData(mockSummary, state.objectTypes)
					)
				).toEqual(false);
			});
		});

		describe('selectIsDraftDeleteOnly', () => {
			const mockSummaryDelete = {
				...state.summaryState.summary,
				objectBreakdown: {
					ROLE: { same: 0, added: 0, removed: 1, different: 0, errors: 0 },
					ACCESS_PROFILE: { same: 0, added: 0, removed: 1, different: 0, errors: 0 }
				}
			} as ConfigHubDraftSummary;

			const mockSummaryNotJustDelete = {
				...state.summaryState.summary,
				objectBreakdown: {
					ROLE: { same: 0, added: 1, removed: 0, different: 0, errors: 0 },
					ACCESS_PROFILE: { same: 0, added: 1, removed: 1, different: 0, errors: 0 }
				}
			} as ConfigHubDraftSummary;

			const mockSummaryNotJustDeleteScenario2 = {
				...state.summaryState.summary,
				objectBreakdown: {
					ROLE: { same: 0, added: 1, removed: 0, different: 0, errors: 0 },
					ACCESS_PROFILE: { same: 0, added: 1, removed: 0, different: 1, errors: 0 }
				}
			} as ConfigHubDraftSummary;

			it('should return true if the object breakdown from the draft contains only deletions', () => {
				expect(fromDraftsPage.selectIsDraftDeleteOnly.projector(mockSummaryDelete.objectBreakdown)).toBe(true);
			});

			it('should return false if the object breakdown from the draft contains more than just deletions', () => {
				expect(fromDraftsPage.selectIsDraftDeleteOnly.projector(mockSummaryNotJustDelete.objectBreakdown)).toBe(
					false
				);
			});

			it('should return false if the object breakdown from the draft contains no deletions but other properties count', () => {
				expect(
					fromDraftsPage.selectIsDraftDeleteOnly.projector(mockSummaryNotJustDeleteScenario2.objectBreakdown)
				).toBe(false);
			});
		});

		describe('selectIsDraftDeployable', () => {
			it('should return true the draft is not empty, is not dirty and does not have errors', () => {
				expect(fromDraftsPage.selectIsDraftDeployable.projector(false, false, false, false)).toEqual(true);
			});

			it('should return false the draft is dirty', () => {
				expect(fromDraftsPage.selectIsDraftDeployable.projector(true, false, false, false)).toEqual(false);
			});

			it('should return false the draft is empty', () => {
				expect(fromDraftsPage.selectIsDraftDeployable.projector(false, true, false, false)).toEqual(false);
			});

			it('should return false the draft is delete only', () => {
				expect(fromDraftsPage.selectIsDraftDeployable.projector(false, false, true, false)).toEqual(false);
			});

			it('should return false the draft if loading', () => {
				expect(fromDraftsPage.selectIsDraftDeployable.projector(false, false, false, true)).toEqual(false);
			});
		});

		describe('selectIsDraftWithError', () => {
			it('should return true the draft with error, and the deployState is INIT', () => {
				expect(fromDraftsPage.selectIsDraftWithError.projector(true, RequestState.INIT)).toEqual(true);
			});

			it('should return false the deployState is not INIT', () => {
				expect(fromDraftsPage.selectIsDraftWithError.projector(true, RequestState.RESOLVED)).toEqual(false);
			});

			it('should return false the draft without error', () => {
				expect(fromDraftsPage.selectIsDraftWithError.projector(false, RequestState.INIT)).toEqual(false);
			});

			it('should return false the draft without error, and the deployState is not INIT', () => {
				expect(fromDraftsPage.selectIsDraftWithError.projector(false, RequestState.RESOLVED)).toEqual(false);
			});
		});

		describe('selectBaseObjectPatchDictionary', () => {
			it('should return the baseObjectPatchDictionary', () => {
				expect(fromDraftsPage.selectBaseObjectPatchDictionary.projector(state.objectTypes)).toEqual({
					[mockModifiedObject.id]: JSONPatchCompare(
						mockObjectDetailsArray[3].object.object,
						mockModifiedObject
					)
				});
			});
		});

		describe('selectHasObjectsToPatch', () => {
			it('should return true when there are modified objects', () => {
				expect(fromDraftsPage.selectHasObjectsToPatch.projector(mockBaseObjectPatchDictionary)).toEqual(true);
			});

			it('should return false when there are no modified objects', () => {
				expect(fromDraftsPage.selectHasObjectsToPatch.projector({})).toEqual(false);
			});
		});

		describe('selectBaseObjectDeletePayload', () => {
			it('should return the baseObjectDeletePayload', () => {
				expect(
					fromDraftsPage.selectBaseObjectDeletePayload.projector(
						state.objectTypes,
						state.summaryState.deselectedObjectTypes
					)
				).toEqual({
					objectIdsToDelete: state.objectTypes[AN_OBJECT_TYPE].deselectedObjectIds[ObjectOperationType.ADDED],
					typesToDelete: [DESELECTED_OBJECT_TYPE],
					objectsToDelete: {
						AN_OBJECT_TYPE:
							state.objectTypes[AN_OBJECT_TYPE].deselectedObjectIds[ObjectOperationType.ADDED],
						DESELECTED_OBJECT_TYPE: []
					}
				});
			});
		});

		describe('selectHasObjectsToDelete', () => {
			it('should return true when there are deselected object IDs', () => {
				expect(fromDraftsPage.selectHasObjectsToDelete.projector(mockBaseObjectDeletePayload)).toEqual(true);
			});

			it('should return false when there are no deselected object IDs', () => {
				expect(fromDraftsPage.selectHasObjectsToDelete.projector({} as any)).toEqual(false);
			});
		});
	});
});
