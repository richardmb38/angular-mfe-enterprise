/*
 * Copyright (C) 2023 Acme Technologies, Inc.  All rights reserved.
 */
import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GridReadyEvent } from 'ag-grid-community';

import { TranslateModule } from '@acme-priv/armada-angular/src/acme/angular/l10n/translation';

import { ConfigHubObjectChangelogGridComponent } from './object-changelog-grid.component';

describe('ObjectChangelogGridComponent', () => {
	let component: ConfigHubObjectChangelogGridComponent;
	let fixture: ComponentFixture<ConfigHubObjectChangelogGridComponent>;

	const mockGridReadyEvent = {
		api: {
			sizeColumnsToFit: jest.fn()
		}
	} as unknown as GridReadyEvent;

	beforeEach(async () => {
		await TestBed.configureTestingModule({
			declarations: [ConfigHubObjectChangelogGridComponent],
			imports: [TranslateModule.forRoot()]
		}).compileComponents();
	});

	beforeEach(() => {
		fixture = TestBed.createComponent(ConfigHubObjectChangelogGridComponent);
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
			expect(component.gridApi).not.toBeDefined();

			component.onGridReady(mockGridReadyEvent);
			expect(component.gridApi).toBeDefined();
		});
	});

	describe('Json path formatting', () => {
		it('should format json path', () => {
			const formattedPath = component['jsonPatchToJsonPath']('/entitlements/0/attributes');
			expect(formattedPath).toBe('$.entitlements[0].attributes');
		});
	});
});
