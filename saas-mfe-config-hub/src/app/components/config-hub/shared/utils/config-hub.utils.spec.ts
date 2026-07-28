/*
 * Copyright (C) 2023 Acme Technologies, Inc.  All rights reserved.
 */
import { Store } from '@ngrx/store';

import { ConfigHubObservedIds } from '../../config-hub.model';
import { getObjectTypeInitialStates } from '../../drafts/store/states';
import {
	ConfigHubDraftSummary,
	ConfigHubJobStatus,
	ObjectOperationType,
	ObjectTypeDeltas,
	mockBaseObject,
	mockConfigHubDraftJobSummary,
	mockObjectBreakdown,
	mockObjectDetailsArray
} from '../models';
import {
	formatPropertyValue,
	getAvailableOperationTypes,
	getCompareSummaryObjectTotals,
	getCompareSummaryRowData,
	getSingleSummaryTotal,
	handleRowSelectionChange,
	isConfigHubJobDone,
	isValidJson
} from './config-hub.utils';

const store = {
	dispatch: jest.fn()
} as unknown as Store;

const selectActions = {
	singleSelectAction: jest.fn(),
	singleDeselectAction: jest.fn(),
	bulkSelectAction: jest.fn(),
	bulkDeselectAction: jest.fn()
};

const dispatchSpy = jest.spyOn(store, 'dispatch');

describe('config-hub.utils', () => {
	describe('getAvailableOperationTypes', () => {
		it('should return an array of available ObjectOperationTypes', () => {
			const objectTypeDeltas: ObjectTypeDeltas = mockObjectBreakdown['ACCESS_PROFILE'];
			expect(getAvailableOperationTypes(objectTypeDeltas)).toEqual([
				ObjectOperationType.CHANGED,
				ObjectOperationType.REMOVED
			]);
		});
	});

	describe('isConfigHubJobDone', () => {
		it('should return true if job is CANCELLED, COMPLETE, or FAILED', () => {
			expect(isConfigHubJobDone(ConfigHubJobStatus.CANCELLED)).toBeTruthy();
		});

		it('should return false if job is IN_PROGRESS or NOT_STARTED', () => {
			expect(isConfigHubJobDone(ConfigHubJobStatus.NOT_STARTED)).toBeFalsy();
		});
	});

	describe('isValidJson', () => {
		it('should return true for valid JSON', () => {
			const validJsonString = JSON.stringify(mockBaseObject);
			expect(isValidJson(validJsonString)).toBeTruthy();
		});

		it('should return false for invalid JSON', () => {
			const invalidJsonString = 'invalid JSON string';
			expect(isValidJson(invalidJsonString)).toBeFalsy();
		});
	});

	describe('getCompareSummaryRowData', () => {
		it('should generate a ConfigHubCompareSummaryRow[] for a given summary and ObjectTypeState', () => {
			const mockSummary = {
				...mockConfigHubDraftJobSummary,
				objectBreakdown: { ['ACCESS_PROFILE']: mockConfigHubDraftJobSummary.objectBreakdown['ACCESS_PROFILE'] }
			} as ConfigHubDraftSummary;

			const mockObjectTypeState = getObjectTypeInitialStates(mockSummary);

			mockObjectTypeState['ACCESS_PROFILE'].deselectedObjectIds[ObjectOperationType.ADDED].push('test0');
			mockObjectTypeState['ACCESS_PROFILE'].deselectedObjectIds[ObjectOperationType.CHANGED].push('test1');
			mockObjectTypeState['ACCESS_PROFILE'].deselectedObjectIds[ObjectOperationType.REMOVED].push('test2');

			const expectedResults = [
				{
					added: -1,
					different: 5,
					numberOfObjectsSource: 10,
					numberOfObjectsTarget: 13,
					objectType: 'ACCESS_PROFILE',
					removed: 0,
					same: 6,
					errors: 0
				}
			];
			expect(getCompareSummaryRowData(mockSummary, mockObjectTypeState)).toEqual(expectedResults);
		});
	});

	describe('getCompareSummaryObjectTotals', () => {
		it('should return an object with the totals of deleted, added and modified objects', () => {
			const rowData = [
				{
					added: 1,
					different: 1,
					numberOfObjectsSource: 10,
					numberOfObjectsTarget: 10,
					objectType: 'ACCESS_PROFILE',
					removed: 5,
					same: 3
				},
				{
					added: 3,
					different: 0,
					numberOfObjectsSource: 13,
					numberOfObjectsTarget: 13,
					objectType: 'SOURCE',
					removed: 10,
					same: 3
				}
			] as any;

			const expectedResult = {
				added: 4,
				removed: 15,
				different: 1,
				total: 20
			};

			expect(getCompareSummaryObjectTotals(rowData, [])).toEqual(expectedResult);
		});

		it('should not count deselected object types in return value', () => {
			const rowData = [
				{
					added: 1,
					different: 1,
					numberOfObjectsSource: 10,
					numberOfObjectsTarget: 10,
					objectType: 'ACCESS_PROFILE',
					removed: 5,
					same: 3
				},
				{
					added: 3,
					different: 0,
					numberOfObjectsSource: 13,
					numberOfObjectsTarget: 13,
					objectType: 'SOURCE',
					removed: 10,
					same: 3
				}
			] as any;

			const expectedResult = {
				added: 1,
				removed: 5,
				different: 1,
				total: 7
			};

			expect(getCompareSummaryObjectTotals(rowData, ['SOURCE'])).toEqual(expectedResult);
		});
	});

	describe('getSingleSummaryTotal', () => {
		it('should calcuate totals correctly for a given singleObjectType', () => {
			const mockSummary = {
				...mockConfigHubDraftJobSummary,
				objectBreakdown: { ['ACCESS_PROFILE']: mockConfigHubDraftJobSummary.objectBreakdown['ACCESS_PROFILE'] }
			} as ConfigHubDraftSummary;
			const singleObjectType = 'ACCESS_PROFILE';
			const total = getSingleSummaryTotal(mockSummary, singleObjectType);
			const expectedResult = 7;

			expect(total).toEqual(expectedResult);
		});
	});

	describe('handleRowSelectionAction', () => {
		it('should dispatch bulkSelect if no rows are deselected', () => {
			const observerIds: ConfigHubObservedIds = {
				selectedIds: ['id1', 'id2'],
				deselectedIds: [],
				storeDeselectedIds: ['id1', 'id2']
			};

			const actionData = {
				objectType: 'ACCESS_PROFILES',
				objectIds: ['id1', 'id2'],
				objectOperationType: ObjectOperationType.ADDED
			};

			handleRowSelectionChange(observerIds, selectActions, actionData, store, 'objectId');

			expect(dispatchSpy).toHaveBeenCalledWith(selectActions.bulkSelectAction(actionData));
		});

		it('should dispatch bulkDeselect if every row is deselected', () => {
			const objectDetailsIds = mockObjectDetailsArray.map(object => object.objectId);

			const observerIds: ConfigHubObservedIds = {
				selectedIds: [],
				deselectedIds: objectDetailsIds,
				storeDeselectedIds: []
			};

			const actionData = {
				objectType: 'ACCESS_PROFILES',
				objectIds: objectDetailsIds,
				objectOperationType: ObjectOperationType.ADDED
			};

			handleRowSelectionChange(observerIds, selectActions, actionData, store, 'objectId');

			expect(dispatchSpy).toHaveBeenCalledWith(selectActions.bulkDeselectAction(actionData));
		});

		it('should dispatch single deselect action when a row is deselected', () => {
			const mockGridIds = [...mockObjectDetailsArray].slice(0, 3).map(object => object.objectId);
			const mockStoreIds = [...mockObjectDetailsArray].slice(0, 2).map(object => object.objectId);

			const observerIds: ConfigHubObservedIds = {
				selectedIds: ['randomId'],
				deselectedIds: mockGridIds,
				storeDeselectedIds: mockStoreIds
			};

			const actionData = {
				objectType: 'ACCESS_PROFILES',
				objectId: mockGridIds[2] as string,
				objectOperationType: ObjectOperationType.ADDED
			};

			handleRowSelectionChange(observerIds, selectActions, actionData, store, 'objectId');

			expect(dispatchSpy).toHaveBeenCalledWith(selectActions.singleDeselectAction(actionData));
		});

		it('should dispatch single select action when a row is selected', () => {
			const mockGridIds = [...mockObjectDetailsArray].slice(0, 2).map(object => object.objectId);
			const mockStoreIds = [...mockObjectDetailsArray].slice(0, 3).map(object => object.objectId);

			const observerIds: ConfigHubObservedIds = {
				selectedIds: [mockStoreIds[2]],
				deselectedIds: mockGridIds,
				storeDeselectedIds: mockStoreIds
			};

			const actionData = {
				objectType: 'ACCESS_PROFILES',
				objectId: mockGridIds[2] as string,
				objectOperationType: ObjectOperationType.ADDED
			};

			handleRowSelectionChange(observerIds, selectActions, actionData, store, 'objectId');

			expect(dispatchSpy).toHaveBeenCalledWith(selectActions.singleSelectAction(actionData));
		});

		it('should dispatch bulk deselect action when multiple rows are deselected', () => {
			const mockObjectDetailsIds = mockObjectDetailsArray.map(object => object.objectId);
			const mockSelectedIds = [...mockObjectDetailsIds].slice(0, 2);
			const mockDeselectedIds = [...mockObjectDetailsIds].slice(2, 5);
			const mockStoreIds = [...mockObjectDetailsIds].slice(2, 3);

			const observerIds: ConfigHubObservedIds = {
				selectedIds: mockSelectedIds,
				deselectedIds: mockDeselectedIds,
				storeDeselectedIds: mockStoreIds
			};

			const actionData = {
				objectType: 'ACCESS_PROFILES',
				objectIds: [mockObjectDetailsIds[3], mockObjectDetailsIds[4]],
				objectOperationType: ObjectOperationType.ADDED
			};

			handleRowSelectionChange(observerIds, selectActions, actionData, store, 'objectId');

			expect(dispatchSpy).toHaveBeenCalledWith(selectActions.bulkDeselectAction(actionData));
		});

		it('should dispatch bulk select action when multiple rows are selected', () => {
			const mockObjectDetailsIds = mockObjectDetailsArray.map(object => object.objectId);
			const mockSelectedIds = [...mockObjectDetailsIds].slice(0, 2);
			const mockDeselectedIds = [...mockObjectDetailsIds].slice(2, 4);
			const mockStoreIds = [...mockObjectDetailsIds].slice(0, 4);

			const observerIds: ConfigHubObservedIds = {
				selectedIds: mockSelectedIds,
				deselectedIds: mockDeselectedIds,
				storeDeselectedIds: mockStoreIds
			};

			const actionData = {
				objectType: 'ACCESS_PROFILES',
				objectId: [mockObjectDetailsIds[0], mockObjectDetailsIds[1]],
				objectOperationType: ObjectOperationType.ADDED
			};

			handleRowSelectionChange(observerIds, selectActions, actionData, store, 'objectId');

			expect(dispatchSpy).toHaveBeenCalledWith(selectActions.bulkSelectAction(actionData));
		});
	});

	describe('formatPropertyValue', () => {
		it('should turn array into a string', () => {
			expect(typeof formatPropertyValue(['value1', 'value2'])).toBe('string');
		});

		it('should turn object into a string', () => {
			expect(typeof formatPropertyValue({ prop1: 'value1' })).toBe('string');
		});
	});
});
