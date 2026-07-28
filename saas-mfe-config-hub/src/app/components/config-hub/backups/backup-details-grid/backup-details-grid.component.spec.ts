/*
 * Copyright (C) 2023 Acme Technologies, Inc.  All rights reserved.
 */
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute } from '@angular/router';

import { GridReadyEvent } from 'ag-grid-community';
import { of } from 'rxjs';

import { TranslateModule } from '@acme-priv/armada-angular/src/acme/angular/l10n/translation';

import { ApiListResponse } from '@acme-priv/ui-common/src/acme/angular/api';

import { ObjectDetails, mockObjectDetailsArray } from '../../shared/models';
import { ConfigHubBackupsApiService } from '../../shared/services';
import { ConfigHubBackupDetailsGridComponent } from './backup-details-grid.component';

describe('ConfigHubBackupDetailsGridComponent', () => {
	let component: ConfigHubBackupDetailsGridComponent;
	let fixture: ComponentFixture<ConfigHubBackupDetailsGridComponent>;
	let backupsApiService: ConfigHubBackupsApiService;

	const routeMock = { snapshot: { paramMap: { get: value => value } } };

	const mockGridReadyEvent = {
		api: {
			sizeColumnsToFit: jest.fn()
		}
	} as unknown as GridReadyEvent;

	beforeEach(async () => {
		await TestBed.configureTestingModule({
			declarations: [ConfigHubBackupDetailsGridComponent],
			imports: [TranslateModule.forRoot(), HttpClientTestingModule],
			providers: [
				{
					provide: ActivatedRoute,
					useValue: routeMock
				}
			]
		}).compileComponents();
	});

	beforeEach(() => {
		fixture = TestBed.createComponent(ConfigHubBackupDetailsGridComponent);
		backupsApiService = TestBed.inject(ConfigHubBackupsApiService);
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

	describe('loadObjectDetails', () => {
		it('should cleanup and load object details', () => {
			const loadObjectDetailsSpy = jest
				.spyOn(backupsApiService, 'getObjectsByType')
				.mockReturnValue(of({ items: mockObjectDetailsArray } as ApiListResponse<ObjectDetails>));
			const cleanupSpy = jest.spyOn(component as any, 'cleanup');

			component.selectedObjectType = { type: 'test-obj', totalCount: 3 };
			expect(loadObjectDetailsSpy).toHaveBeenCalled();
			expect(cleanupSpy).toHaveBeenCalled();
		});
	});

	describe('getOffset', () => {
		it('should calculate offset based on page size', () => {
			component.selectedObjectType = { type: 'test-obj', totalCount: 300 };
			component.pageSize = 25;
			component.currentPage = 2;
			const offset = (component as any).getOffset();
			expect(offset).toBe(25);
		});
		it('should set offset to total count if offset is larger', () => {
			component.selectedObjectType = { type: 'test-obj', totalCount: 43 };
			component.pageSize = 25;
			component.currentPage = 3;
			const offset = (component as any).getOffset();
			expect(offset).toBe(43);
		});
	});

	describe('handleOverlayClose', () => {
		it('should set selected object to null', () => {
			component.handleOverlayClose();
			expect(component.selectedObject).toBeNull();
		});
	});

	describe('handlePageSizeChanged', () => {
		it('should update page and load details', () => {
			const loadObjectDetailsSpy = jest.spyOn(backupsApiService, 'getObjectsByType');
			component.selectedObjectType = { type: 'test-obj', totalCount: 20 };
			component.handlePageSizeChanged(10);

			expect(loadObjectDetailsSpy).toHaveBeenCalled();
			expect(component.pageSize).toBe(10);
			expect(component.totalPages).toBe(2);
		});
	});

	describe('handlePageSizeChanged', () => {
		it('should update page and load details', () => {
			const loadObjectDetailsSpy = jest.spyOn(backupsApiService, 'getObjectsByType');
			component.selectedObjectType = { type: 'test-obj', totalCount: 20 };
			component.handlePageSizeChanged(10);

			expect(loadObjectDetailsSpy).toHaveBeenCalled();
			expect(component.pageSize).toBe(10);
			expect(component.totalPages).toBe(2);
		});
	});

	describe('handlePageChanged', () => {
		it('should update page and load details', () => {
			const loadObjectDetailsSpy = jest.spyOn(backupsApiService, 'getObjectsByType');
			component.selectedObjectType = { type: 'test-obj', totalCount: 20 };
			component.handlePageChanged(2);

			expect(loadObjectDetailsSpy).toHaveBeenCalled();
			expect(component.currentPage).toBe(2);
		});
	});

	describe('handleSearchInputChange', () => {
		it('should update page and load details', () => {
			const loadObjectDetailsSpy = jest.spyOn(backupsApiService, 'getObjectsByType');
			component.selectedObjectType = { type: 'test-obj', totalCount: 20 };
			component.handleSearchInputChange('test');

			expect(loadObjectDetailsSpy).toHaveBeenCalled();
			expect(component.searchQuery).toBe('test');
			expect(component.lastEvaluatedKey).toBeNull();
			expect(component.currentPage).toBe(1);
		});
	});
});
