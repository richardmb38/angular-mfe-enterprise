/*
 * Copyright (C) 2023 Acme Technologies, Inc.  All rights reserved.
 */
import { createFeatureSelector, createSelector } from '@ngrx/store';

import { RequestState } from '@acme-priv/ui-common/src/acme/angular/util';

import { objectOperationTabTitles } from '../../details/draft-details.model';
import {
	DRAFTS_PAGE_FEATURE_KEY,
	DraftsPageState,
	ObjectDetailsSearchQuery,
	objectDetailsAtomicStateAdapter
} from '../states';
import {
	BaseObjectDeletePayload,
	BaseObjectPatchDictionary,
	ConfigHubJobStatus,
	ObjectDeltaTypeNames,
	ObjectOperationType
} from 'app/components/config-hub/shared/models';
import {
	getAvailableOperationTypes,
	getCompareSummaryObjectTotals,
	getCompareSummaryRowData,
	getSingleSummaryTotal
} from 'app/components/config-hub/shared/utils';
import { compare as JSONPatchCompare } from 'fast-json-patch';

const selectDraftsPageState = createFeatureSelector<DraftsPageState>(DRAFTS_PAGE_FEATURE_KEY);

/**
 * DraftsPageState
 */
const selectSelectedObjectType = createSelector(selectDraftsPageState, state => state?.selectedObjectType);

const selectSelectedObjectId = createSelector(selectDraftsPageState, state => state?.selectedObjectId);

const selectSaveRequestState = createSelector(selectDraftsPageState, state => state?.saveRequestState);

const selectSaveStateIsLoading = createSelector(
	selectSaveRequestState,
	saveRequestState => saveRequestState === RequestState.LOADING
);

const selectSummaryState = createSelector(selectDraftsPageState, state => state?.summaryState);

const selectDeployState = createSelector(selectDraftsPageState, state => state?.deployState);

const selectScheduleDeployState = createSelector(selectDraftsPageState, state => state?.scheduledDeployState);

const selectObjectTypes = createSelector(selectDraftsPageState, state => state?.objectTypes);

const selectObjectTypeState = (objectType?: string) =>
	createSelector(selectObjectTypes, selectSelectedObjectType, (objectTypes, selectedObjectType) =>
		objectType ? objectTypes[objectType] : objectTypes[selectedObjectType]
	);

const selectObjectTypeShowErrorState = createSelector(
	selectObjectTypes,
	selectSelectedObjectType,
	(objectTypes, selectedObjectType) => objectTypes?.[selectedObjectType]?.showErrors
);

const selectIsApprovalsEnabled = createSelector(selectDraftsPageState, state => state?.approvalsEnabled);

/**
 * DraftsPageState
 * ↳ summaryState
 */
const selectSummary = createSelector(selectSummaryState, summaryState => summaryState?.summary);

const selectDeselectedObjectTypes = createSelector(
	selectSummaryState,
	summaryState => summaryState?.deselectedObjectTypes
);

const selectIsObjectTypeDeselected = (objectType: string) =>
	createSelector(selectDeselectedObjectTypes, deselectedObjectTypes => deselectedObjectTypes.includes(objectType));

const selectSummaryStateRequestState = createSelector(selectSummaryState, summaryState => summaryState?.requestState);

const selectSummaryIsInit = createSelector(
	selectSummaryStateRequestState,
	summaryStateRequestState => summaryStateRequestState === RequestState.INIT
);

const selectSummaryIsLoading = createSelector(
	selectSummaryStateRequestState,
	summaryStateRequestState => summaryStateRequestState === RequestState.LOADING
);

const selectSummaryRowData = createSelector(
	selectSummary,
	selectObjectTypes,
	(summary, objectTypes) => summary && objectTypes && getCompareSummaryRowData(summary, objectTypes)
);

const selectHasErrors = createSelector(
	selectSummaryRowData,
	rowData => rowData && !rowData.every(({ [ObjectDeltaTypeNames.ERRORS]: errors }) => errors === 0)
);

const selectSummaryObjectTotals = createSelector(
	selectSummaryRowData,
	selectDeselectedObjectTypes,
	(summaryRowData, deselectedObjectTypes) =>
		summaryRowData && getCompareSummaryObjectTotals(summaryRowData, deselectedObjectTypes)
);

/**
 * DraftsPageState
 * ↳ summaryState
 *   ↳ summary
 */
const selectDraftId = createSelector(selectSummary, summary => summary?.jobId);

const selectDraftName = createSelector(selectSummary, summary => summary?.name);

const selectSourceBackupId = createSelector(selectSummary, summary => summary?.sourceBackupId);
const selectTargetBackupId = createSelector(selectSummary, summary => summary?.targetBackupId);

const selectNumberOfObjectsSource = createSelector(selectSummary, summary => summary?.numberOfObjectsSource);
const selectNumberOfObjectsTarget = createSelector(selectSummary, summary => summary?.numberOfObjectsTarget);

const selectObjectBreakdown = createSelector(selectSummary, summary => summary?.objectBreakdown);

const selectApprovalStatus = createSelector(selectSummary, summary => summary?.approvalStatus);

const selectApprovalStatusComments = createSelector(selectSummary, summary =>
	summary?.approvalComment.filter(comment => comment.changedToStatus !== null)
);

/**
 * DraftsPageState
 * ↳ deployState
 */
const selectDeployJob = createSelector(selectDeployState, deployState => deployState?.deployJob);

const selectDeployResults = createSelector(selectDeployState, deployState => deployState?.deployResults);

const selectDeployResultsStringified = createSelector(selectDeployResults, deployResults =>
	JSON.stringify(deployResults, null, 2)
);

const selectDeployStateRequestState = createSelector(selectDeployState, deployState => deployState?.requestState);

const selectDeployIsInit = createSelector(
	selectDeployStateRequestState,
	deployStateRequestState => deployStateRequestState === RequestState.INIT
);

const selectDeployIsLoading = createSelector(
	selectDeployStateRequestState,
	deployStateRequestState => deployStateRequestState === RequestState.LOADING
);

const selectDeployStatusIsFailed = createSelector(
	selectDeployJob,
	deployJob => deployJob?.status === ConfigHubJobStatus.FAILED
);

const selectDeployStatusIsComplete = createSelector(
	selectDeployJob,
	deployJob => deployJob?.status === ConfigHubJobStatus.COMPLETE
);

const selectDeployStatusIsPartiallyComplete = createSelector(
	selectDeployJob,
	deployJob => deployJob?.status === ConfigHubJobStatus.PARTIALLY_COMPLETE
);

const selectDeployIsComplete = createSelector(
	selectDeployStateRequestState,
	deployStateRequestState =>
		deployStateRequestState === RequestState.FAILED ||
		deployStateRequestState === RequestState.STOPPED ||
		deployStateRequestState === RequestState.RESOLVED
);

/**
 * DraftsPageState
 * ↳ scheduleDeployState
 */

const selectScheduleDeployRequestState = createSelector(
	selectScheduleDeployState,
	scheduleDeployState => scheduleDeployState?.requestState
);

const selectScheduleDeployIsInit = createSelector(
	selectScheduleDeployRequestState,
	scheduleDeployRequestState => scheduleDeployRequestState === RequestState.INIT
);

const selectScheduleDeployIsLoading = createSelector(
	selectScheduleDeployRequestState,
	scheduleDeployRequestState => scheduleDeployRequestState === RequestState.LOADING
);

const selectScheduleDeployStatusIsFailed = createSelector(
	selectScheduleDeployRequestState,
	scheduleDeployRequestState => scheduleDeployRequestState === RequestState.FAILED
);

const selectScheduleDeployStatusIsResolved = createSelector(
	selectScheduleDeployRequestState,
	scheduleDeployRequestState => scheduleDeployRequestState === RequestState.RESOLVED
);

const selectScheduleDeployResults = createSelector(
	selectScheduleDeployState,
	scheduleDeployState => scheduleDeployState?.scheduledJob
);

const selectScheduledDeployIsComplete = createSelector(
	selectScheduleDeployRequestState,
	scheduleDeployRequestState =>
		scheduleDeployRequestState === RequestState.FAILED ||
		scheduleDeployRequestState === RequestState.STOPPED ||
		scheduleDeployRequestState === RequestState.RESOLVED
);

/**
 * DraftsPageState
 * ↳ objectTypes
 *  ↳ ACCESS_PROFILES
 */
const selectAvailableOperationTypes = (objectType?: string) =>
	createSelector(
		selectSelectedObjectType,
		selectObjectBreakdown,
		(selectedObjectType, objectBreakdown) =>
			objectBreakdown &&
			getAvailableOperationTypes(objectType ? objectBreakdown[objectType] : objectBreakdown[selectedObjectType])
	);

const selectIsOperationTypeAvailable = (operationType: ObjectOperationType, objectType?: string) =>
	createSelector(selectAvailableOperationTypes(objectType), (operationTypes: ObjectOperationType[]) =>
		operationTypes.includes(operationType)
	);

const selectSelectedOperationType = (objectType?: string) =>
	createSelector(selectObjectTypeState(objectType), objectTypeState => objectTypeState?.selectedOperationType);

const selectSelectedOperationTypeTitle = (objectType?: string) =>
	createSelector(selectSelectedOperationType(objectType), operationType => objectOperationTabTitles[operationType]);

const selectIsObjectEditingAvailable = (objectType?: string) =>
	createSelector(
		selectSelectedOperationType(objectType),
		operationType => operationType !== ObjectOperationType.REMOVED
	);

const selectObjectDetailsStates = (objectType?: string) =>
	createSelector(selectObjectTypeState(objectType), objectTypeState => objectTypeState?.objectDetailsStates);

const selectObjectDetailsStateByOperation = (objectType?: string, objectOperationType?: ObjectOperationType) =>
	createSelector(
		selectObjectDetailsStates(objectType),
		selectSelectedOperationType(objectType),
		(objectDetailsStates, selectedOperationType) =>
			objectOperationType ? objectDetailsStates[objectOperationType] : objectDetailsStates[selectedOperationType]
	);

const selectDeselectedObjectIds = (objectType?: string) =>
	createSelector(selectObjectTypeState(objectType), objectTypeState => objectTypeState?.deselectedObjectIds);

const selectIsObjectDeselected = (objectId: string, objectType?: string, objectOperationType?: ObjectOperationType) =>
	createSelector(
		selectDeselectedObjectIds(objectType),
		selectSelectedOperationType(objectType),
		(deselectedObjectIds, selectedOperationType) =>
			objectOperationType
				? deselectedObjectIds[objectOperationType].includes(objectId)
				: deselectedObjectIds[selectedOperationType].includes(objectId)
	);

const selectModifiedObjects = (objectType?: string) =>
	createSelector(selectObjectTypeState(objectType), objectTypeState => objectTypeState?.modifiedObjects);

const selectModifiedObjectsByOperation = (objectType?: string, objectOperationType?: ObjectOperationType) =>
	createSelector(
		selectObjectTypeState(objectType),
		selectSelectedOperationType(objectType),
		(objectTypeState, selectedOperationType) =>
			objectTypeState?.modifiedObjects[objectOperationType ?? selectedOperationType]
	);

const selectIsObjectModified = (objectId: string, objectType?: string, objectOperationType?: ObjectOperationType) =>
	createSelector(selectModifiedObjectsByOperation(objectType, objectOperationType), modifiedObjects =>
		modifiedObjects?.hasOwnProperty(objectId)
	);

/**
 * Retrieves all selectors for the ObjectDetailsState
 * @param objectType - The type of object, e.g. ACCESS_PROFILES.
 * @param objectOperationType - The object operation type, e.g. ADDED.
 * @returns {AtomicStateSelectors<ObjectDetails, object>} - All selectors for an ObjectDetailsState.
 */
const getObjectDetailsSelectors = (objectType?: string, objectOperationType?: ObjectOperationType) =>
	objectDetailsAtomicStateAdapter.getSelectors(selectObjectDetailsStateByOperation(objectType, objectOperationType));

const selectObjectDetails = (objectId?: string, objectType?: string, objectOperationType?: ObjectOperationType) =>
	createSelector(
		selectSelectedObjectId,
		getObjectDetailsSelectors(objectType, objectOperationType).selectEntities,
		(selectedObjectId, entities) => (objectId ? entities[objectId] : entities[selectedObjectId])
	);

const selectModifiedBaseObject = (objectId?: string, objectType?: string, objectOperationType?: ObjectOperationType) =>
	createSelector(
		selectSelectedObjectId,
		selectModifiedObjectsByOperation(objectType, objectOperationType),
		(selectedObjectId, modifiedObjects) =>
			objectId ? modifiedObjects[objectId] : modifiedObjects[selectedObjectId]
	);

const selectBaseObject = (objectId?: string, objectType?: string, objectOperationType?: ObjectOperationType) =>
	createSelector(
		selectObjectDetails(objectId, objectType, objectOperationType),
		selectModifiedBaseObject(objectId, objectType),
		// If the object has been modified, return the modified version.
		(objectDetails, modifiedBaseObject) => modifiedBaseObject ?? objectDetails?.object?.object
	);

const selectFullBaseObject = (objectId?: string, objectType?: string, objectOperationType?: ObjectOperationType) =>
	createSelector(
		selectObjectDetails(objectId, objectType, objectOperationType),
		selectModifiedBaseObject(objectId, objectType),
		// If the object has been modified, return the modified version.
		(objectDetails, modifiedBaseObject) =>
			modifiedBaseObject ? { ...objectDetails?.object, object: modifiedBaseObject } : objectDetails?.object
	);

const selectBaseObjectStringified = (
	objectId?: string,
	objectType?: string,
	objectOperationType?: ObjectOperationType
) =>
	createSelector(selectBaseObject(objectId, objectType, objectOperationType), baseObject =>
		JSON.stringify(baseObject, null, 2)
	);

const selectFullBaseObjectStringified = (
	objectId?: string,
	objectType?: string,
	objectOperationType?: ObjectOperationType
) =>
	createSelector(selectFullBaseObject(objectId, objectType, objectOperationType), baseObject =>
		JSON.stringify(baseObject, null, 2)
	);

const selectLiveObject = (objectId?: string, objectType?: string, objectOperationType?: ObjectOperationType) =>
	createSelector(
		selectObjectDetails(objectId, objectType, objectOperationType),
		objectDetails => objectDetails?.liveObject
	);

const selectLiveObjectStringified = (
	objectId?: string,
	objectType?: string,
	objectOperationType?: ObjectOperationType
) =>
	createSelector(selectLiveObject(objectId, objectType, objectOperationType), liveObject =>
		liveObject ? JSON.stringify(liveObject.object, null, 2) : undefined
	);

const selectFullLiveObjectStringified = (
	objectId?: string,
	objectType?: string,
	objectOperationType?: ObjectOperationType
) =>
	createSelector(selectLiveObject(objectId, objectType, objectOperationType), liveObject =>
		liveObject ? JSON.stringify(liveObject, null, 2) : undefined
	);

const selectSearchQuery = (objectType?: string, objectOperationType?: ObjectOperationType) =>
	createSelector(
		getObjectDetailsSelectors(objectType, objectOperationType).selectSearchQuery,
		searchQuery => searchQuery as ObjectDetailsSearchQuery
	);

const selectCurrentPage = (objectType?: string, objectOperationType?: ObjectOperationType) =>
	createSelector(selectSearchQuery(objectType, objectOperationType), searchQuery => searchQuery.currentPage);

const selectFinalPage = (objectType?: string, objectOperationType?: ObjectOperationType) =>
	createSelector(selectSearchQuery(objectType, objectOperationType), searchQuery => searchQuery.finalPage);

const selectPageSize = (objectType?: string, objectOperationType?: ObjectOperationType) =>
	createSelector(selectSearchQuery(objectType, objectOperationType), searchQuery => searchQuery.limit);

const selectObjectDetailsPage = (
	currentPage?: number,
	pageSize?: number,
	objectType?: string,
	objectOperationType?: ObjectOperationType
) =>
	createSelector(
		getObjectDetailsSelectors(objectType, objectOperationType).selectAll,
		selectCurrentPage(objectType, objectOperationType),
		selectPageSize(objectType, objectOperationType),
		(objectDetails, selectedCurrentPage, selectedPageSize) =>
			objectDetails.slice(
				((currentPage ?? selectedCurrentPage) - 1) * (pageSize ?? selectedPageSize),
				(currentPage ?? selectedCurrentPage) * (pageSize ?? selectedPageSize)
			)
	);

/**
 * Meta
 */
const selectIsDraftDirty = createSelector(
	selectDeselectedObjectTypes,
	selectObjectTypes,
	(deselectedObjectTypes, objectTypes) =>
		deselectedObjectTypes.length > 0 ||
		!Object.values(objectTypes).every(
			objectTypeState =>
				Object.values(objectTypeState?.deselectedObjectIds).every(
					objectIdsArray => objectIdsArray.length === 0
				) &&
				Object.values(objectTypeState?.modifiedObjects).every(
					objectOperationType => Object.keys(objectOperationType).length === 0
				)
		)
);

const selectIsDraftEmpty = createSelector(selectSummaryRowData, rowData => rowData?.length === 0);

const selectIsDraftDeleteOnly = createSelector(
	selectObjectBreakdown,
	breakdown =>
		!Object.values(breakdown || {}).some(obj => obj.added > 0 || obj.different > 0) &&
		Object.values(breakdown || {}).some(obj => obj.removed > 0)
);

const selectIsDraftDeployable = createSelector(
	selectIsDraftDirty,
	selectIsDraftEmpty,
	selectIsDraftDeleteOnly,
	selectSaveStateIsLoading,
	(isDirty, isEmpty, isDeleteOnly, isLoading) => !(isDirty || isEmpty || isDeleteOnly || isLoading)
);

const selectIsDraftWithError = createSelector(
	selectHasErrors,
	selectDeployStateRequestState,
	(isError, deployStateRequestState) => isError && deployStateRequestState === RequestState.INIT
);

/**
 * Iterates through all modifiedObjects in each objectType and generates an array of
 * JSON patch operations required to transform the original object into the modified object.
 *
 * Returns a BaseObjectPatchDictionary of objectIds to their JSON patch operation arrays.
 */
const selectBaseObjectPatchDictionary = createSelector(selectObjectTypes, objectTypes =>
	Object.values(objectTypes).reduce<BaseObjectPatchDictionary>((patchesObject, objectTypeState) => {
		Object.values(ObjectOperationType).forEach(objectOperationType =>
			Object.entries(objectTypeState.modifiedObjects[objectOperationType]).forEach(
				([objectId, modifiedBaseObject]) =>
					(patchesObject[objectId] = JSONPatchCompare(
						objectTypeState.objectDetailsStates[objectOperationType].entities[objectId].object.object,
						modifiedBaseObject
					))
			)
		);
		return patchesObject;
	}, {})
);

const selectHasObjectsToPatch = createSelector(
	selectBaseObjectPatchDictionary,
	baseObjectPatchDictionary => Object.keys(baseObjectPatchDictionary).length > 0
);

/**
 * Iterates through all deselectedObjectIds in each objectType and adds them to a single array.
 *
 * Returns a BaseObjectDeletePayload that includes an array of objectIdsToDelete along with an array of typesToDelete.
 */
const selectBaseObjectDeletePayload = createSelector(
	selectObjectTypes,
	selectDeselectedObjectTypes,
	(objectTypes, deselectedObjectTypes) =>
		({
			objectIdsToDelete: Object.values(objectTypes).reduce<string[]>(
				(allDeselectedObjectIds, objectTypeState) =>
					allDeselectedObjectIds.concat(
						Object.values(objectTypeState.deselectedObjectIds).flatMap(
							deselectedObjectIds => deselectedObjectIds
						)
					),
				[]
			),
			typesToDelete: deselectedObjectTypes,
			objectsToDelete: Object.entries(objectTypes).reduce((typesAndIdsMap, objectTypeState) => {
				if (deselectedObjectTypes.includes(objectTypeState[0])) {
					typesAndIdsMap[objectTypeState[0]] = [];
				} else {
					const objectIdsToDelete = Object.values(objectTypeState[1].deselectedObjectIds).flatMap(
						deselectedObjectIds => deselectedObjectIds
					);

					if (objectIdsToDelete.length > 0) {
						typesAndIdsMap[objectTypeState[0]] = objectIdsToDelete;
					}
				}

				return typesAndIdsMap;
			}, {})
		}) as BaseObjectDeletePayload
);

const selectHasObjectsToDelete = createSelector(selectBaseObjectDeletePayload, baseObjectDeletePayload =>
	Object.values(baseObjectDeletePayload).some((deletionArray: string[]) => deletionArray.length > 0)
);

const selectSelectedOperationObject = () =>
	createSelector(
		selectSelectedObjectType,
		selectObjectBreakdown,
		(selectedObjectType, objectBreakdown) => objectBreakdown && objectBreakdown[selectedObjectType]
	);

const selectObjectDetailsHasErrors = createSelector(
	selectSelectedOperationObject(),
	operationsObject => !!operationsObject.errors
);

const selectSingleSummarydTotal = createSelector(
	selectSummary,
	selectSelectedObjectType,
	(summary, ObjectType) => summary && getSingleSummaryTotal(summary, ObjectType)
);

const selectSelectedObjectAmount = (objectType?: string) =>
	createSelector(
		selectSingleSummarydTotal,
		selectDeselectedObjectIds(objectType),
		(singleTotal, deselectedObject) =>
			singleTotal -
			(deselectedObject.ADDED.length + deselectedObject.CHANGED.length + deselectedObject.REMOVED.length)
	);

export const fromDraftsPage = {
	selectSelectedObjectType,
	selectSelectedObjectId,
	selectSaveRequestState,
	selectSaveStateIsLoading,
	selectSummaryState,
	selectDeployState,
	selectObjectTypes,
	selectObjectTypeState,
	selectSummary,
	selectDeselectedObjectTypes,
	selectIsObjectTypeDeselected,
	selectSummaryStateRequestState,
	selectSummaryIsInit,
	selectSummaryIsLoading,
	selectSummaryRowData,
	selectHasErrors,
	selectSummaryObjectTotals,
	selectSingleSummarydTotal,
	selectSelectedObjectAmount,
	selectDraftId,
	selectDraftName,
	selectSourceBackupId,
	selectTargetBackupId,
	selectNumberOfObjectsSource,
	selectNumberOfObjectsTarget,
	selectObjectBreakdown,
	selectDeployJob,
	selectDeployResults,
	selectDeployResultsStringified,
	selectDeployStateRequestState,
	selectDeployIsInit,
	selectDeployIsLoading,
	selectDeployStatusIsFailed,
	selectDeployStatusIsComplete,
	selectDeployIsComplete,
	selectDeployStatusIsPartiallyComplete,
	selectAvailableOperationTypes,
	selectIsOperationTypeAvailable,
	selectSelectedOperationType,
	selectSelectedOperationTypeTitle,
	selectObjectDetailsStates,
	selectObjectDetailsStateByOperation,
	selectDeselectedObjectIds,
	selectIsObjectDeselected,
	selectModifiedObjects,
	selectModifiedObjectsByOperation,
	selectIsObjectModified,
	selectIsObjectEditingAvailable,
	getObjectDetailsSelectors,
	selectObjectDetails,
	selectModifiedBaseObject,
	selectBaseObject,
	selectBaseObjectStringified,
	selectSearchQuery,
	selectCurrentPage,
	selectFinalPage,
	selectPageSize,
	selectObjectDetailsPage,
	selectIsDraftDirty,
	selectIsDraftEmpty,
	selectIsDraftDeleteOnly,
	selectIsDraftDeployable,
	selectIsDraftWithError,
	selectBaseObjectPatchDictionary,
	selectHasObjectsToPatch,
	selectBaseObjectDeletePayload,
	selectHasObjectsToDelete,
	selectSelectedOperationObject,
	selectLiveObject,
	selectLiveObjectStringified,
	selectObjectDetailsHasErrors,
	selectObjectTypeShowErrorState,
	selectFullBaseObject,
	selectFullLiveObjectStringified,
	selectFullBaseObjectStringified,
	selectApprovalStatus,
	selectApprovalStatusComments,
	selectIsApprovalsEnabled,
	selectScheduleDeployState,
	selectScheduleDeployRequestState,
	selectScheduleDeployIsInit,
	selectScheduleDeployIsLoading,
	selectScheduleDeployResults,
	selectScheduleDeployStatusIsResolved,
	selectScheduleDeployStatusIsFailed,
	selectScheduledDeployIsComplete
};
