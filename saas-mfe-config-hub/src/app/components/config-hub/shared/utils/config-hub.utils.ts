/*
 * Copyright (C) 2023 Acme Technologies, Inc.  All rights reserved.
 */
import { Router } from '@angular/router';

import { Store } from '@ngrx/store';
import { SelectionChangedEvent } from 'ag-grid-community';
import { Observable, filter, map, of, switchMap, take, withLatestFrom } from 'rxjs';

import { tenantConnectionsApiActions } from '../../tenant-connections/store/actions';
import { fromTenantConnections } from '../../tenant-connections/store/selectors';

import { CONFIG_HUB_URL, ConfigHubObservedIds, ConfigHubSelectionChangedActions } from '../../config-hub.model';
import { ObjectTypeState } from '../../drafts/store/states';
import {
	ConfigHubCompareSummary,
	ConfigHubCompareSummaryRow,
	ConfigHubDraftObjectTotals,
	ConfigHubDraftSummary,
	ConfigHubJobStatus,
	ObjectDeltaTypeNames,
	ObjectOperationType,
	ObjectTypeDeltas
} from '../models';

/**
 * Checks whether a given ConfigHubJobStatus is "done."
 * CANCELLED, COMPLETE, and FAILED are considered to be done.
 * @param jobStatus - The job status to check.
 * @returns {boolean}
 */
export const isConfigHubJobDone = (jobStatus: ConfigHubJobStatus): boolean =>
	[
		ConfigHubJobStatus.CANCELLED,
		ConfigHubJobStatus.COMPLETE,
		ConfigHubJobStatus.FAILED,
		ConfigHubJobStatus.FAILED_EXTERNAL_COMMUNICATION,
		ConfigHubJobStatus.PARTIALLY_COMPLETE
	].includes(jobStatus);

/**
 * Returns ObjectOperationTypes have a delta greater than 0 for given objectTypeDeltas.
 * @param objectTypeDeltas - ObjectTypeDeltas for an object type.
 * @returns {ObjectOperationType[]}
 */
export const getAvailableOperationTypes = (objectTypeDeltas: ObjectTypeDeltas): ObjectOperationType[] =>
	Object.values(ObjectOperationType).filter(objectOperationType =>
		objectOperationType === ObjectOperationType.CHANGED
			? objectTypeDeltas['different'] > 0
			: objectTypeDeltas[objectOperationType.toLowerCase()] > 0
	);

/**
 * Checks whether or not a given string can be parsed to valid JSON.
 * @param json - The JSON string to validate.
 * @returns {boolean}
 */
export const isValidJson = (json: string): boolean => {
	try {
		const parsedJson = JSON.parse(json);

		return parsedJson && typeof parsedJson === 'object';
	} catch (error) {
		return false;
	}
};

/**
 * Generates grid row data for a given summary and ObjectTypeState.
 * @param summary - The summary to generate row data for.
 * @param objectTypes - A dictionary of object types to their states.
 * @returns  {ConfigHubCompareSummaryRow[]}
 */
export const getCompareSummaryRowData = (
	summary: ConfigHubCompareSummary | ConfigHubDraftSummary,
	objectTypes: { [objectType: string]: ObjectTypeState }
): ConfigHubCompareSummaryRow[] =>
	Object.entries(summary.objectBreakdown).reduce<ConfigHubCompareSummaryRow[]>(
		(rowData, [objectType, objectTypeDeltas]) => {
			const { same, errors } = objectTypeDeltas;
			let { added, removed, different } = objectTypeDeltas;

			// Filter out objectTypes that only have a 'same' value
			if (added + removed + different !== 0) {
				added -= objectTypes[objectType].deselectedObjectIds[ObjectOperationType.ADDED].length;
				removed -= objectTypes[objectType].deselectedObjectIds[ObjectOperationType.REMOVED].length;
				different -= objectTypes[objectType].deselectedObjectIds[ObjectOperationType.CHANGED].length;

				// Take original values until changes are actually saved
				const numberOfObjectsTarget = same + objectTypeDeltas.different + objectTypeDeltas.removed;
				const numberOfObjectsSource = same + different + added;

				rowData.push({
					same,
					added,
					removed,
					different,
					errors,
					numberOfObjectsTarget,
					numberOfObjectsSource,
					objectType
				});
			}
			return rowData;
		},
		[]
	);

/**
 * Generates an object containing the total of added, modified and removed objects
 * @param {ConfigHubCompareSummaryRow[]} summaryRowData - The row data from the summary
 * @param {string[]} deselectedObjectTypes An array containing the currently deselected objectTypes
 * @returns  {Partial<ConfigHubDraftObjectTotals>}
 */
export const getCompareSummaryObjectTotals = (
	summaryRowData: ConfigHubCompareSummaryRow[],
	deselectedObjectTypes: string[]
): Partial<ConfigHubDraftObjectTotals> => {
	return summaryRowData.reduce<Partial<ConfigHubDraftObjectTotals>>(
		(totals, { added, removed, different, objectType }) => {
			const isObjectSelected = !deselectedObjectTypes.some(
				deselectedObjectType => deselectedObjectType === objectType
			);
			if (isObjectSelected) {
				totals[ObjectDeltaTypeNames.ADDED] += added;
				totals[ObjectDeltaTypeNames.REMOVED] += removed;
				totals[ObjectDeltaTypeNames.DIFFERENT] += different;
				totals[ObjectDeltaTypeNames.TOTAL] += added + removed + different;
			}
			return totals;
		},
		{
			[ObjectDeltaTypeNames.ADDED]: 0,
			[ObjectDeltaTypeNames.REMOVED]: 0,
			[ObjectDeltaTypeNames.DIFFERENT]: 0,
			[ObjectDeltaTypeNames.TOTAL]: 0
		}
	);
};

/**
 * Generates an object containing the total of added, modified and removed objects
 * @param summary The summary to generate row data for.
 * @param singleObjectType A string of single object type.
 * @returns number
 */
export const getSingleSummaryTotal = (
	summary: ConfigHubCompareSummary | ConfigHubDraftSummary,
	singleObjectType: string
): number => {
	return Object.entries(summary.objectBreakdown).reduce((total, [objectType, objectTypeDeltas]) => {
		if (objectType === singleObjectType) {
			const { added, removed, different } = objectTypeDeltas;
			total += added + removed + different;
		}

		return total;
	}, 0);
};

/**
 * Get the selected status of each row
 * @param {SelectionChangedEvent} event selection changed event
 * @param {string} idFieldName name of the field containing the id
 */
export const getNodeSelectedStatus = (
	event: SelectionChangedEvent,
	idFieldName: string
): Partial<ConfigHubObservedIds> => {
	const selectedIds = [];
	const deselectedIds = [];

	event.api.forEachNode(node => {
		const id = node.data[idFieldName];
		node.isSelected() ? selectedIds.push(id) : deselectedIds.push(id);
	});

	return { selectedIds, deselectedIds };
};

/**
 * Handle row selection change actions
 * This is handled using this approach because at this time there's no way to handle
 * bulk selection and single selection separately in ag-grid.
 * Using onRowSelected is avoided because there's no way to stop firing it
 * during bulk selection.
 * @param {ConfigHubObservedIds} observedIds lists of selected and deselected ids in the grid and store
 * @param {ConfigHubSelectionChangedActions} actions store actions for bulk and single select/deselect
 * @param actionData generic data that's passed to the actions
 * @param {Store} store ngrx store instance
 *
 */
export const handleRowSelectionChange = (
	observedIds: ConfigHubObservedIds,
	actions: ConfigHubSelectionChangedActions,
	actionData: any,
	store: Store,
	idFieldName: string
): void => {
	const { selectedIds, deselectedIds, storeDeselectedIds } = observedIds;
	const { bulkDeselectAction, bulkSelectAction, singleDeselectAction, singleSelectAction } = actions;

	// Get deselected ids that aren't in the store
	const newDeselected = deselectedIds.filter(id => !storeDeselectedIds.includes(id));

	// Get the selected ids that are in the deselected list from the store
	const newSelected = selectedIds.filter(id => storeDeselectedIds.includes(id));

	if (newDeselected.length > 0) {
		if (newDeselected.length === 1) {
			// Dispatch single deselection action if only one row has been deselected
			store.dispatch(singleDeselectAction({ ...actionData, [idFieldName]: newDeselected[0] }));
		} else {
			// Dispatch bulk deselection action if more than one row has been deselected
			store.dispatch(bulkDeselectAction({ ...actionData, [`${idFieldName}s`]: newDeselected }));
		}
	}

	if (newSelected.length > 0) {
		if (newSelected.length === 1) {
			// Dispatch single selection action if only one row has been selected
			store.dispatch(singleSelectAction({ ...actionData, [idFieldName]: newSelected[0] }));
		} else {
			// Dispatch bulk selection action if more than one row has been selected
			store.dispatch(bulkSelectAction({ ...actionData, [`${idFieldName}s`]: newSelected }));
		}
	}
};

/**
 * Check if the connection from the url exists before navigating
 * @param urlTenant The tenant id from the url
 * @param store ngrx store
 * @param router Angular router
 */
export function checkConnections(urlTenant: string, store: Store, router: Router): Observable<boolean> {
	return store.select(fromTenantConnections.getTenantConnectionsSelectors().selectIsInit).pipe(
		take(1),
		switchMap(isInit => {
			// Load connections if they haven't been loaded yet
			if (isInit) {
				store.dispatch(tenantConnectionsApiActions.tenantConnectionsLoadList());
			}

			return store.select(fromTenantConnections.getTenantConnectionsSelectors().selectAll).pipe(
				withLatestFrom(store.select(fromTenantConnections.getTenantConnectionsSelectors().selectIsLoading)),
				filter(([, isLoading]) => !isLoading), // Wait for connections to finish loading before checking
				map(
					([tenantConnections]) => tenantConnections.some(connection => connection.sourceTenant === urlTenant) // Check if the connection exists
				),
				switchMap(tenantExists => {
					if (tenantExists) {
						return of(true);
					}
					router.navigate([CONFIG_HUB_URL]);
					return of(false);
				})
			);
		})
	);
}

/**
 * Format the value of a property in a cell renderer
 * @param value - The value that needs to be formatted
 */
export const formatPropertyValue = (value: any): string => {
	if (Array.isArray(value)) {
		return value.map(element => (element ? JSON.stringify(element) : element)).join(', ');
	}
	return value ? JSON.stringify(value) : value;
};
