/*
 * Copyright (C) 2023 Acme Technologies, Inc.  All rights reserved.
 */
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';

import { GridReadyEvent } from 'ag-grid-community';
import { of, throwError } from 'rxjs';

import { AlertService } from '@acme-priv/armada-angular/src/acme/angular/components/alert';
import { ModalService } from '@acme-priv/armada-angular/src/acme/angular/components/modal';
import {
	TranslateModule,
	TranslateService
} from '@acme-priv/armada-angular/src/acme/angular/l10n/translation';

import {
	ConfigHubPatchOperations,
	ObjectMappingsValidFields,
	getDeleteObjectMappingModalConfig,
	mockConfigHubObjectMappingList
} from '../../shared/models';
import { ConfigHubObjectMappingService } from '../../shared/services/object-mappings/object-mappings.service';
import { ConfigHubObjectMappingGridComponent } from './object-mapping-grid.component';

const mockGridReadyEvent = {
	api: {
		sizeColumnsToFit: jest.fn(),
		applyTransaction: jest.fn()
	}
} as unknown as GridReadyEvent;

describe('ConfigHubObjectMappingGridComponent', () => {
	let component: ConfigHubObjectMappingGridComponent;
	let fixture: ComponentFixture<ConfigHubObjectMappingGridComponent>;
	let configHubObjectMappingService: ConfigHubObjectMappingService;
	let alertService: AlertService;
	let modalService: ModalService;

	beforeEach(async () => {
		await TestBed.configureTestingModule({
			imports: [TranslateModule.forRoot(), HttpClientTestingModule, NoopAnimationsModule],
			declarations: [ConfigHubObjectMappingGridComponent],
			providers: [TranslateService]
		}).compileComponents();
	});

	beforeEach(() => {
		fixture = TestBed.createComponent(ConfigHubObjectMappingGridComponent);
		configHubObjectMappingService = TestBed.inject(ConfigHubObjectMappingService);
		alertService = TestBed.inject(AlertService);
		modalService = TestBed.inject(ModalService);
		component = fixture.componentInstance;
		fixture.detectChanges();
	});

	it('should create', () => {
		expect(component).toBeTruthy();
	});

	describe('ngOnInit', () => {
		it('should have called column def function', () => {
			component.ngOnInit();
			expect(component.columnDefs.length).toBeGreaterThan(0);
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

	describe('onWindowSizeChangedEvent', () => {
		it('should resize the columns on window size change', () => {
			component.onGridReady(mockGridReadyEvent);
			const sizeColumnsToFitSpy = jest.spyOn((component as any).gridApi.api, 'sizeColumnsToFit');

			component.onWindowSizeChangedEvent();
			expect(sizeColumnsToFitSpy).toHaveBeenCalledTimes(1);
		});
	});

	describe('handleDeleteObjectMapping', () => {
		it('should open confirmation modal', () => {
			component.selectedTenant = 'testTenant';
			const modalOpenSpy = jest.spyOn(modalService, 'open');
			component.handleDeleteObjectMapping(mockConfigHubObjectMappingList[0]);
			expect(modalOpenSpy).toHaveBeenCalledWith(
				getDeleteObjectMappingModalConfig(mockConfigHubObjectMappingList[0], 'testTenant')
			);
		});

		it('should do nothing if modal is cancelled', fakeAsync(() => {
			const deleteSpy = jest.spyOn(configHubObjectMappingService, 'deleteObjectMapping');
			const modalSpy = jest.spyOn(modalService, 'open').mockReturnValue(Promise.resolve(false));
			component.handleDeleteObjectMapping(mockConfigHubObjectMappingList[0]);
			tick();

			expect(modalSpy).toHaveBeenCalled();
			expect(deleteSpy).not.toHaveBeenCalled();
		}));

		it('should call deleteObjectMapping function on modal confirmation', fakeAsync(() => {
			const deleteSpy = jest.spyOn(configHubObjectMappingService, 'deleteObjectMapping');
			component.selectedTenant = 'testTenant';
			jest.spyOn(modalService, 'open').mockReturnValue(Promise.resolve(true));
			component.handleDeleteObjectMapping(mockConfigHubObjectMappingList[0]);
			tick();

			expect(component.loading).toBe(true);
			expect(deleteSpy).toHaveBeenCalledWith('testTenant', mockConfigHubObjectMappingList[0].objectMappingId);
		}));

		it('should success alert and filter connections list upon successful deletion', fakeAsync(() => {
			jest.spyOn(configHubObjectMappingService, 'deleteObjectMapping').mockReturnValue(of({}));
			component.selectedTenant = 'testTenant';
			component.objectMappingList = mockConfigHubObjectMappingList;
			jest.spyOn(modalService, 'open').mockReturnValue(Promise.resolve(true));

			const alertOpenSpy = jest.spyOn(alertService, 'open');

			component.handleDeleteObjectMapping(mockConfigHubObjectMappingList[0]);
			tick();

			expect(alertOpenSpy).toHaveBeenCalled();
			expect(component.objectMappingList).toStrictEqual([mockConfigHubObjectMappingList[1]]);
			expect(component.loading).toBeFalsy();
		}));

		it('should not show alert nor filter list upon failing a delete', fakeAsync(() => {
			jest.spyOn(configHubObjectMappingService, 'deleteObjectMapping').mockReturnValue(throwError(() => 'error'));
			component.selectedTenant = 'testTenant';
			component.objectMappingList = mockConfigHubObjectMappingList;
			jest.spyOn(modalService, 'open').mockReturnValue(Promise.resolve(true));

			const alertOpenSpy = jest.spyOn(alertService, 'open');

			component.handleDeleteObjectMapping(mockConfigHubObjectMappingList[0]);
			tick();

			expect(alertOpenSpy).not.toHaveBeenCalled();
			expect(component.objectMappingList).toStrictEqual(mockConfigHubObjectMappingList);
			expect(component.loading).toBeFalsy();
		}));
	});

	describe('handleBulkUpdateObjectMapping', () => {
		it('should toggle the the selected object mapping enabled property on success', fakeAsync(() => {
			component.onGridReady(mockGridReadyEvent);
			component.objectMappingList = [...mockConfigHubObjectMappingList];
			component.objectMappingList[0].enabled = true;
			component.selectedTenant = 'testTenant';
			jest.spyOn(configHubObjectMappingService, 'bulkPatchObjectMappings').mockReturnValue(
				of({ body: { patchedObjects: [mockConfigHubObjectMappingList[0]] } })
			);

			(component as any).handleBulkUpdateObjectMapping(
				mockConfigHubObjectMappingList[0].objectMappingId,
				false,
				true,
				ObjectMappingsValidFields.ENABLED
			);
			tick();

			expect(component.objectMappingList[0].enabled).toBe(false);
		}));

		it('should revert to old value on failure', fakeAsync(() => {
			component.onGridReady(mockGridReadyEvent);
			component.objectMappingList = [...mockConfigHubObjectMappingList];
			component.objectMappingList[0].enabled = true;
			component.selectedTenant = 'testTenant';
			jest.spyOn(configHubObjectMappingService, 'bulkPatchObjectMappings').mockReturnValue(
				throwError(() => 'error')
			);
			(component as any).handleBulkUpdateObjectMapping(
				mockConfigHubObjectMappingList[0].objectMappingId,
				false,
				true,
				ObjectMappingsValidFields.ENABLED
			);

			tick();
			expect(component.objectMappingList[0].enabled).toBe(true);
		}));
	});

	describe('updateFieldValue', () => {
		it('should update field value and call apply transaction', () => {
			component.onGridReady(mockGridReadyEvent);
			component.objectMappingList = [...mockConfigHubObjectMappingList];
			const applyTransactionSpy = jest.spyOn((component as any).gridApi.api, 'applyTransaction');

			(component as any).updateFieldValue(0, 'enabled', true);
			expect(applyTransactionSpy).toHaveBeenCalled();
			expect(component.objectMappingList[0].enabled).toBe(true);
		});
	});

	describe('getPatchOperationPayload', () => {
		it('should format payload properly', () => {
			const payload = (component as any).getPatchOperationPayload('test', 'enabled', true);
			expect(payload).toEqual({
				['test']: [
					{
						op: ConfigHubPatchOperations.REPLACE,
						path: '/enabled',
						value: true
					}
				]
			});
		});
	});
});
