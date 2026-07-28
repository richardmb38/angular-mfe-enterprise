/*
 * Copyright (C) 2023 Acme Technologies, Inc.  All rights reserved.
 */
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { ActivatedRoute, Router } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';

import { EffectsModule } from '@ngrx/effects';
import { StoreModule, createSelector } from '@ngrx/store';
import { MockStore, provideMockStore } from '@ngrx/store/testing';
import { TranslateLoader } from '@ngx-translate/core';
import { GridApi, GridReadyEvent, SelectionChangedEvent } from 'ag-grid-community';

import { LoadingMaskModule } from '@acme-priv/armada-angular/src/acme/angular/components/loading-mask';
import { TranslateStaticLoader } from '@acme-priv/armada-angular/src/acme/angular/l10n/translate-static-loader';
import { TranslateModule } from '@acme-priv/armada-angular/src/acme/angular/l10n/translation';

import { draftsPageActions } from '../../../drafts/store/actions';
import { fromDraftsPage } from '../../../drafts/store/selectors';

import { ConfigHubObservedIds } from '../../../config-hub.model';
import { draftsPageInitialState } from '../../../drafts/store/states';
import * as utils from '../../../shared/utils/config-hub.utils';
import {
	ConfigHubCompareSummaryRow,
	GRID_SELECT_COLUMN_ID,
	ObjectDeltaTypeNames,
	ObjectOperationType,
	mockConfigHubCompareJobSummary
} from '../../models';
import { ConfigHubCompareSummaryGridComponent } from './compare-summary-grid.component';

const mockGridReadyEvent = {
	api: {
		sizeColumnsToFit: jest.fn(),
		selectAll: jest.fn(),
		forEachNode: () => {},
		refreshHeader: () => {},
		refreshCells: () => {}
	}
} as unknown as GridReadyEvent;

const objectBreakdown = Object.entries(mockConfigHubCompareJobSummary.objectBreakdown).map(entry => ({
	objectType: entry[0],
	objectTypeDeltas: entry[1]
}));

const mockRows: ConfigHubCompareSummaryRow[] = objectBreakdown.map(entry => {
	const deltas = entry.objectTypeDeltas;

	const numberOfObjectsTarget = deltas.same + deltas.different + deltas.removed;
	const numberOfObjectsSource = deltas.same + deltas.different + deltas.added;

	return {
		objectType: entry.objectType,
		numberOfObjectsTarget: numberOfObjectsTarget,
		numberOfObjectsSource: numberOfObjectsSource,
		same: deltas.same,
		added: deltas.added,
		removed: deltas.removed,
		errors: deltas.errors,
		different: deltas.different
	};
});

const mockActivatedRoute = {} as ActivatedRoute;

describe('ConfigHubCompareSummaryGridComponent', () => {
	let component: ConfigHubCompareSummaryGridComponent;
	let fixture: ComponentFixture<ConfigHubCompareSummaryGridComponent>;
	let mockStore: MockStore;
	let router: Router;
	const mockGridApi = mockGridReadyEvent.api;

	const selectAvailableOperationTypesSpy = jest.spyOn(fromDraftsPage, 'selectAvailableOperationTypes');
	const selectDeselectedObjectTypesSpy = jest.spyOn(fromDraftsPage, 'selectDeselectedObjectTypes');

	beforeEach(async () => {
		await TestBed.configureTestingModule({
			declarations: [ConfigHubCompareSummaryGridComponent],
			imports: [
				StoreModule.forRoot([]),
				EffectsModule.forRoot([]),
				TranslateModule.forRoot({
					loader: {
						provide: TranslateLoader,
						useClass: TranslateStaticLoader
					}
				}),
				RouterTestingModule,
				HttpClientTestingModule,
				NoopAnimationsModule,
				LoadingMaskModule
			],
			providers: [
				provideMockStore({
					initialState: draftsPageInitialState
				}),
				{ provide: ActivatedRoute, useValue: mockActivatedRoute }
			]
		}).compileComponents();
	});

	beforeEach(() => {
		mockStore = TestBed.inject(MockStore);
		router = TestBed.inject(Router);
		fixture = TestBed.createComponent(ConfigHubCompareSummaryGridComponent);
		component = fixture.componentInstance;
		component['gridApi'] = <GridApi>(<any>mockGridApi);
		fixture.detectChanges();
	});

	it('should create', () => {
		expect(component).toBeTruthy();
	});

	describe('initializeGridOptions', () => {
		it('should add checkbox column if isEditingEnabled is set to true', () => {
			component.isEditingEnabled = true;
			(component as any).initializeGridOptions();
			expect(component.columnDefs[0].colId).toEqual(GRID_SELECT_COLUMN_ID);
		});
	});

	describe('ngOnDestroy', () => {
		it('should complete unsubscribe$ subject', () => {
			const nextSpy = jest.spyOn((component as any).unsubscribe$, 'next');
			const completeSpy = jest.spyOn((component as any).unsubscribe$, 'complete');

			component.ngOnDestroy();
			expect(nextSpy).toHaveBeenCalled();
			expect(completeSpy).toHaveBeenCalled();
		});
	});

	describe('onGridReady', () => {
		it('should set the gridApi', () => {
			component.gridApi = undefined as any;
			expect(component.gridApi).not.toBeDefined();

			component.onGridReady(mockGridReadyEvent);
			expect(component.gridApi).toBeDefined();
		});
	});

	describe('onWindowSizeChangedEvent', () => {
		it('should resize the columns on window size change', () => {
			component.onGridReady(mockGridReadyEvent);
			const sizeColumnsToFitSpy = jest.spyOn((component as any).gridApi, 'sizeColumnsToFit');

			component.onWindowSizeChangedEvent();
			expect(sizeColumnsToFitSpy).toHaveBeenCalledTimes(1);
		});
	});

	describe('navigateToObjectDetails', () => {
		it('should dispatch the viewObjectList action to the store', () => {
			jest.spyOn(router, 'navigate').mockImplementation();
			selectAvailableOperationTypesSpy.mockImplementation(
				() =>
					createSelector(
						() => null,
						() => null,
						() => [ObjectOperationType.CHANGED, ObjectOperationType.REMOVED]
					) as any
			);

			const dispatchSpy = jest.spyOn(mockStore, 'dispatch');

			(component as any).navigateToObjectDetails(mockRows[0]);

			expect(dispatchSpy).toHaveBeenCalledWith(
				draftsPageActions.viewObjectList({
					objectType: mockRows[0].objectType,
					objectOperationType: ObjectOperationType.CHANGED,
					showErrors: false
				})
			);
		});

		it('should navigate to the details component', () => {
			jest.spyOn(router, 'navigate').mockImplementation();
			selectAvailableOperationTypesSpy.mockImplementation(
				() =>
					createSelector(
						() => null,
						() => null,
						() => [ObjectOperationType.CHANGED, ObjectOperationType.REMOVED]
					) as any
			);

			(component as any).navigateToObjectDetails(mockRows[0]);

			expect(router.navigate).toHaveBeenCalledWith(['details'], { relativeTo: mockActivatedRoute });
		});
	});

	describe('handleSelectionChange', () => {
		it('should call getNodeSelectedStatus', () => {
			const mockSelectionChangedEvent = {} as unknown as SelectionChangedEvent;
			selectDeselectedObjectTypesSpy.mockImplementation(
				() =>
					createSelector(
						() => null,
						() => []
					) as any
			);
			const getNodeSelectedStatusSpy = jest.spyOn(utils, 'getNodeSelectedStatus');
			component.handleSelectionChange(mockSelectionChangedEvent);
			expect(getNodeSelectedStatusSpy).toHaveBeenCalled();
		});
	});

	describe('handleCellClicked', () => {
		it('should call navigateToObjectDetails if node is selected', () => {
			const navigateToObjectDetailsSpy = jest.spyOn(component as any, 'navigateToObjectDetails');
			const cellData = { ...mockRows[0], added: 3 };
			const cellClickedData = {
				colDef: { field: ObjectDeltaTypeNames.ADDED },
				data: cellData,
				node: { isSelected: () => true }
			} as any;

			const selectIsOperationTypeAvailableSpy = jest.spyOn(fromDraftsPage, 'selectIsOperationTypeAvailable');
			selectIsOperationTypeAvailableSpy.mockImplementation(
				() =>
					createSelector(
						() => null,
						() => null,
						() => true
					) as any
			);

			component.handleCellClicked(cellClickedData);

			expect(navigateToObjectDetailsSpy).toHaveBeenCalledWith(cellData, ObjectOperationType.ADDED);
		});

		it('should not call navigateToObjectDetails if node is not selected', () => {
			const navigateToObjectDetailsSpy = jest.spyOn(component as any, 'navigateToObjectDetails');
			const cellData = { ...mockRows[0], added: 0 };
			const cellClickedData = {
				colDef: { field: ObjectDeltaTypeNames.ADDED },
				data: cellData,
				node: { isSelected: () => false }
			} as any;

			const selectIsOperationTypeAvailableSpy = jest.spyOn(fromDraftsPage, 'selectIsOperationTypeAvailable');
			selectIsOperationTypeAvailableSpy.mockImplementation(
				() =>
					createSelector(
						() => null,
						() => null,
						() => false
					) as any
			);

			component.handleCellClicked(cellClickedData);

			expect(navigateToObjectDetailsSpy).not.toHaveBeenCalled();
		});
	});

	describe('setSelectedRows', () => {
		it('should update nodes and refresh the grid', () => {
			const forEachNodeSpy = jest.spyOn(mockGridApi, 'forEachNode');
			const refreshHeaderSpy = jest.spyOn(mockGridApi, 'refreshHeader');
			const refreshCellsSpy = jest.spyOn(mockGridApi, 'refreshCells');

			(component as any).setSelectedRows(mockGridApi);

			expect(forEachNodeSpy).toHaveBeenCalled();
			expect(refreshHeaderSpy).toHaveBeenCalled();
			expect(refreshCellsSpy).toHaveBeenCalled();
		});
	});

	describe('handleRowSelectionAction', () => {
		it('should call handleRowSelectionChange', () => {
			const handleRowSelectionChangeSpy = jest.spyOn(utils, 'handleRowSelectionChange');
			component.onGridReady(mockGridReadyEvent);

			const observedIds: ConfigHubObservedIds = {
				selectedIds: [],
				deselectedIds: [],
				storeDeselectedIds: []
			};

			(component as any).handleRowSelectionAction(observedIds);

			expect(handleRowSelectionChangeSpy).toHaveBeenCalled();
		});
	});
});
