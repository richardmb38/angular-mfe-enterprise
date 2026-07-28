/*
 * Copyright (C) 2023 Acme Technologies, Inc.  All rights reserved.
 */
import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AgGridModule } from 'ag-grid-angular';
import { GridReadyEvent } from 'ag-grid-community';

import { DataGridModule } from '@acme-priv/armada-angular/src/acme/angular/components/grid';
import { TranslateModule } from '@acme-priv/armada-angular/src/acme/angular/l10n/translation';

import { mockConfigHubObjectTypes } from '../../../shared/models';
import { ConfigHubObjectSelectionGridComponent } from './object-selection-grid.component';

describe('ConfigHubObjectSelectionGridComponent', () => {
	let component: ConfigHubObjectSelectionGridComponent;
	let fixture: ComponentFixture<ConfigHubObjectSelectionGridComponent>;

	const mockGridReadyEvent = {
		api: {
			sizeColumnsToFit: jest.fn(),
			refreshHeader: jest.fn(),
			forEachNode: jest.fn()
		}
	} as unknown as GridReadyEvent;

	beforeEach(async () => {
		await TestBed.configureTestingModule({
			declarations: [ConfigHubObjectSelectionGridComponent],
			imports: [TranslateModule.forRoot(), AgGridModule, DataGridModule]
		}).compileComponents();
	});

	beforeEach(() => {
		fixture = TestBed.createComponent(ConfigHubObjectSelectionGridComponent);
		component = fixture.componentInstance;
		component.isObjectOptionsDropdownEnabled = true;
		fixture.detectChanges();
	});

	it('should create', () => {
		expect(component).toBeTruthy();
	});

	describe('ngOnInit', () => {
		it('should set column defs', () => {
			component.ngOnInit();
			expect(component.columnDefs).toBeDefined();
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
		it('should set the gridApi, update the row data and set rows as selected', () => {
			expect(component.gridApi).not.toBeDefined();
			const updateGridRowsSpy = jest.spyOn(component as any, 'updateGridRows');

			component.onGridReady(mockGridReadyEvent);
			expect(component.gridApi).toBeDefined();
			expect(updateGridRowsSpy).toHaveBeenCalled();
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

	describe('updateGridRows', () => {
		it('should update grid rows with the backup summary objectBreakdown', () => {
			component.backupObjectList = mockConfigHubObjectTypes;
			const expectedRows = mockConfigHubObjectTypes.map(object => ({
				objectType: object.objectType
			}));

			(component as any).updateGridRows();
			expect(component.rows).toEqual(expectedRows);
		});
	});
});
