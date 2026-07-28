/*
 * Copyright (C) 2023 Acme Technologies, Inc.  All rights reserved.
 */
import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GridReadyEvent } from 'ag-grid-community';

import { TranslateModule } from '@acme-priv/armada-angular/src/acme/angular/l10n/translation';

import { ConfigHubObjectMetadataGridComponent } from './object-metadata-grid.component';

describe('ObjectMetadataGridComponent', () => {
	let component: ConfigHubObjectMetadataGridComponent;
	let fixture: ComponentFixture<ConfigHubObjectMetadataGridComponent>;

	const mockGridReadyEvent = {
		api: {
			sizeColumnsToFit: jest.fn()
		}
	} as unknown as GridReadyEvent;

	beforeEach(async () => {
		await TestBed.configureTestingModule({
			declarations: [ConfigHubObjectMetadataGridComponent],
			imports: [TranslateModule.forRoot()]
		}).compileComponents();
	});

	beforeEach(() => {
		fixture = TestBed.createComponent(ConfigHubObjectMetadataGridComponent);
		component = fixture.componentInstance;
		fixture.detectChanges();
	});

	it('should create', () => {
		expect(component).toBeTruthy();
	});

	describe('onWindowSizeChangedEvent', () => {
		it('should resize the columns on window size change', () => {
			component.onGridReady(mockGridReadyEvent);
			const sizeColumnsToFitSpy = jest.spyOn((component as any).gridApi.api, 'sizeColumnsToFit');

			component.onWindowSizeChangedEvent();
			expect(sizeColumnsToFitSpy).toHaveBeenCalledTimes(1);
		});
	});

	describe('onGridReady', () => {
		it('should set the gridApi', () => {
			expect(component.gridApi).not.toBeDefined();

			component.onGridReady(mockGridReadyEvent);
			expect(component.gridApi).toBeDefined();
		});
	});
});
