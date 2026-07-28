/*
 * Copyright (C) 2023 Acme Technologies, Inc.  All rights reserved.
 */
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';

import { TranslateLoader } from '@ngx-translate/core';
import { GridReadyEvent } from 'ag-grid-community';

import { LoadingMaskModule } from '@acme-priv/armada-angular/src/acme/angular/components/loading-mask';
import { TranslateStaticLoader } from '@acme-priv/armada-angular/src/acme/angular/l10n/translate-static-loader';
import { TranslateModule } from '@acme-priv/armada-angular/src/acme/angular/l10n/translation';

import { mockConfigHubBackupJobSummary } from '../../../shared/models';
import { ConfigHubBackupSummaryGridComponent } from './backup-summary-grid.component';

const mockGridReadyEvent = {
	api: {
		sizeColumnsToFit: jest.fn()
	}
} as unknown as GridReadyEvent;

describe('ConfigHubBackupSummaryGridComponent', () => {
	let component: ConfigHubBackupSummaryGridComponent;
	let fixture: ComponentFixture<ConfigHubBackupSummaryGridComponent>;

	beforeEach(async () => {
		await TestBed.configureTestingModule({
			declarations: [ConfigHubBackupSummaryGridComponent],
			imports: [
				TranslateModule.forRoot({
					loader: {
						provide: TranslateLoader,
						useClass: TranslateStaticLoader
					}
				}),
				HttpClientTestingModule,
				NoopAnimationsModule,
				LoadingMaskModule
			]
		}).compileComponents();
	});

	beforeEach(() => {
		fixture = TestBed.createComponent(ConfigHubBackupSummaryGridComponent);
		component = fixture.componentInstance;
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
	});

	describe('onGridReady', () => {
		it('should set the gridApi', () => {
			expect(component.gridApi).not.toBeDefined();

			component.onGridReady(mockGridReadyEvent);
			expect(component.gridApi).toBeDefined();
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
			component.backupSummary = mockConfigHubBackupJobSummary;
			const expectedRows = Object.entries(mockConfigHubBackupJobSummary.objectBreakdown).map(entry => ({
				objectType: entry[0],
				totalCount: entry[1]
			}));

			(component as any).updateGridRows();
			expect(component.rows).toEqual(expectedRows);
		});
	});
});
