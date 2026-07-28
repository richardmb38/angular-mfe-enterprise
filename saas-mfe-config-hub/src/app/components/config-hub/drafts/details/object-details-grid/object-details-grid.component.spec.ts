/*
 * Copyright (C) 2023 Acme Technologies, Inc.  All rights reserved.
 */
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';

import { MockStore, provideMockStore } from '@ngrx/store/testing';
import { TranslateLoader } from '@ngx-translate/core';
import { GridApi, GridReadyEvent } from 'ag-grid-community';

import { DataGridColumnsFactoryService } from '@acme-priv/armada-angular/src/acme/angular/components/grid';
import { TranslateStaticLoader } from '@acme-priv/armada-angular/src/acme/angular/l10n/translate-static-loader';
import { TranslateModule } from '@acme-priv/armada-angular/src/acme/angular/l10n/translation';

import { draftsPageActions } from '../../store/actions';

import { ConfigHubObservedIds } from '../../../config-hub.model';
import { ObjectOperationType, mockObjectDetailsArray } from '../../../shared/models';
import * as utils from '../../../shared/utils/config-hub.utils';
import { draftsPageInitialState } from '../../store/states';
import { ConfigHubObjectDetailsGridComponent } from './object-details-grid.component';

const mockGridReadyEvent = {
	api: {
		getSelectedRows: () => mockObjectDetailsArray,
		sizeColumnsToFit: jest.fn(),
		refreshCells: jest.fn()
	}
} as unknown as GridReadyEvent;

describe('ConfigHubObjectDetailsGridComponent', () => {
	let component: ConfigHubObjectDetailsGridComponent;
	let fixture: ComponentFixture<ConfigHubObjectDetailsGridComponent>;
	let mockStore: MockStore;
	let columnsService: DataGridColumnsFactoryService;
	const mockGridApi = mockGridReadyEvent.api;

	beforeEach(async () => {
		await TestBed.configureTestingModule({
			declarations: [ConfigHubObjectDetailsGridComponent],
			imports: [
				TranslateModule.forRoot({
					loader: {
						provide: TranslateLoader,
						useClass: TranslateStaticLoader
					}
				}),
				NoopAnimationsModule,
				HttpClientTestingModule
			],
			providers: [
				provideMockStore({
					initialState: draftsPageInitialState
				})
			],
			schemas: [CUSTOM_ELEMENTS_SCHEMA]
		}).compileComponents();

		mockStore = TestBed.inject(MockStore);
		columnsService = TestBed.inject(DataGridColumnsFactoryService);
		fixture = TestBed.createComponent(ConfigHubObjectDetailsGridComponent);
		component = fixture.componentInstance;

		component.selectedObjectType = 'ACCESS_PROFILE';
		component.selectedOperationType = ObjectOperationType.CHANGED;
		component.objectDetails = mockObjectDetailsArray;

		fixture.detectChanges();
	});
	it('should create', () => {
		expect(component).toBeTruthy();
	});

	describe('ngOnDestroy', () => {
		it('should complete unsubscribe$ subject', () => {
			const nextSpy = jest.spyOn((component as any).unsubscribe$, 'next');
			const completeSpy = jest.spyOn((component as any).unsubscribe$, 'complete');

			component.ngOnDestroy();
			expect(nextSpy).toHaveBeenCalled();
			expect(completeSpy).toHaveBeenCalled();
		});

		it('should dispatch the closeObjectDetails action if there is a selected object id', () => {
			const dispatchSpy = jest.spyOn(mockStore, 'dispatch');
			component.selectedObjectId = 'any-id';

			component.ngOnDestroy();
			expect(dispatchSpy).toHaveBeenCalledWith(draftsPageActions.closeObjectDetails());
		});

		it('should not dispatch the closeObjectDetails action if no object is is selected', () => {
			const dispatchSpy = jest.spyOn(mockStore, 'dispatch');

			component.ngOnDestroy();
			expect(dispatchSpy).not.toHaveBeenCalled();
		});
	});

	describe('onGridReady', () => {
		it('should set the gridApi', () => {
			expect(component.gridApi).not.toBeDefined();

			component.onGridReady(mockGridReadyEvent);
			expect(component.gridApi).toBeDefined();
		});
	});

	describe('updateGrid', () => {
		it('should add select and actions column', fakeAsync(() => {
			component.canUserEditDrafts$ = Promise.resolve(true);
			const addActionsColumnSpy = jest.spyOn(component as any, 'addActionsColumn');
			const createSelectColumnSpy = jest.spyOn(columnsService, 'createSelectColumn');
			(component as any).updateGrid();
			tick();
			expect(addActionsColumnSpy).toHaveBeenCalled();
			expect(createSelectColumnSpy).toHaveBeenCalled();
			expect(component.columnDefs.some(col => col.field === 'hasErrors')).toBeFalsy();
		}));

		it('should add errors column if passed true to update grid', fakeAsync(() => {
			component.canUserEditDrafts$ = Promise.resolve(true);
			(component as any).updateGrid(true);
			tick();
			expect(component.columnDefs.some(col => col.field === 'hasErrors')).toBeTruthy();
		}));
	});

	describe('addActionsColumn', () => {
		it('should create actions column', () => {
			const addActionsColumnSpy = jest.spyOn(columnsService, 'createActionsColumnWithDropdown');
			component.columnDefs = [];
			(component as any).addActionsColumn();
			expect(addActionsColumnSpy).toHaveBeenCalled();
		});
	});

	describe('onWindowSizeChangedEvent', () => {
		it('should resize the columns on window size change', () => {
			component.onGridReady(mockGridReadyEvent);
			const sizeColumnsToFitSpy = jest.spyOn((component as any).gridApi.api, 'sizeColumnsToFit');

			component.onWindowSizeChangedEvent();
			expect(sizeColumnsToFitSpy).toHaveBeenCalledTimes(1);
		});
	});

	describe('handleSearchInputChange', () => {
		it('should dispatch the objectListSearchTermChange action', () => {
			const dispatchSpy = jest.spyOn(mockStore, 'dispatch');

			(component as any).handleSearchInputChange('test');
			expect(dispatchSpy).toHaveBeenCalledWith(
				draftsPageActions.objectListSearchTermChange({
					objectType: 'ACCESS_PROFILE',
					objectOperationType: ObjectOperationType.CHANGED,
					searchQuery: 'test'
				})
			);
		});
	});

	describe('handlePageChanged', () => {
		it('should dispatch the objectListPageNumberChange event', () => {
			const dispatchSpy = jest.spyOn(mockStore, 'dispatch');
			const pageNumber = 5;

			component.handlePageChanged(pageNumber);
			expect(dispatchSpy).toHaveBeenCalledWith(
				draftsPageActions.objectListPageNumberChange({
					objectType: 'ACCESS_PROFILE',
					objectOperationType: ObjectOperationType.CHANGED,
					pageNumber
				})
			);
		});
	});

	describe('handlePageSizeChanged', () => {
		it('should dispatch the objectListPageSizeChange event', () => {
			const dispatchSpy = jest.spyOn(mockStore, 'dispatch');
			const pageSize = 50;

			component.handlePageSizeChanged(pageSize);
			expect(dispatchSpy).toHaveBeenCalledWith(
				draftsPageActions.objectListPageSizeChange({
					objectType: 'ACCESS_PROFILE',
					objectOperationType: ObjectOperationType.CHANGED,
					pageSize
				})
			);
		});
	});

	describe('handleCellClicked', () => {
		it("should call dispatchViewObjectDetails if the cell isn't the select column", () => {
			const dispatchViewObjectDetailsSpy = jest.spyOn(component as any, 'dispatchViewObjectDetails');

			(component as any).handleCellClicked({
				column: { getColId: () => 'col-id' },
				data: { objectId: 'object-id' }
			});

			expect(dispatchViewObjectDetailsSpy).toHaveBeenCalled();
		});
	});

	describe('dispatchViewObjectDetails', () => {
		it('should dispatch the viewObjectDetails action', () => {
			const dispatchSpy = jest.spyOn(mockStore, 'dispatch');

			(component as any).dispatchViewObjectDetails('object-id');
			expect(dispatchSpy).toHaveBeenCalledWith(
				draftsPageActions.viewObjectDetails({
					objectId: 'object-id'
				})
			);
		});
	});

	describe('handleRowSelectionAction', () => {
		it('should call handleRowSelectionChange', () => {
			component['gridApi'] = {
				api: <GridApi>(<any>mockGridApi)
			} as unknown as GridReadyEvent<any>;

			const handleRowSelectionChangeSpy = jest.spyOn(utils, 'handleRowSelectionChange' as never);

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
