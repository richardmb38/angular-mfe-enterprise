/*
 * Copyright (C) 2024 Acme Technologies, Inc.  All rights reserved.
 */
import { DatePipe } from '@angular/common';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { AbstractControl, FormBuilder, FormControl, FormGroup } from '@angular/forms';
import { Router } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';

import { of, throwError } from 'rxjs';

import { AlertService } from '@acme-priv/armada-angular/src/acme/angular/components/alert';
import { ToggleModule } from '@acme-priv/armada-angular/src/acme/angular/components/form';
import {
	TranslateModule,
	TranslateService
} from '@acme-priv/armada-angular/src/acme/angular/l10n/translation';

import { ConfigHubPatchOperations } from '../../shared/models';
import { mockCloudStorageResponse, mockConfigHubSyncJobResponse } from '../../shared/models/cloud-storage.mock.model';
import { CloudStorageInfoPatchableFields } from '../../shared/models/cloud-storage.model';
import { mockGenericResponse } from '../../shared/models/generic-response.mock.model';
import { ConfigHubAdvancedSettingsApiService } from '../../shared/services/advanced-settings/advanced-settings.service';
import { ConfigHubCloudStorageSyncApiService } from '../../shared/services/cloud-storage/cloud-storage-sync.service';
import { ConfigHubCloudStorageComponent } from './cloud-storage.component';

const routerMock = {
	navigateByUrl: () => {}
};

describe('CloudStorageComponent', () => {
	let component: ConfigHubCloudStorageComponent;
	let fixture: ComponentFixture<ConfigHubCloudStorageComponent>;
	let alertService: AlertService;
	let routerService: Router;
	let configHubAdvancedSettingsApiService: ConfigHubAdvancedSettingsApiService;
	let syncService: ConfigHubCloudStorageSyncApiService;

	beforeEach(async () => {
		await TestBed.configureTestingModule({
			imports: [TranslateModule.forRoot(), ToggleModule, RouterTestingModule, HttpClientTestingModule],
			declarations: [ConfigHubCloudStorageComponent],
			providers: [TranslateService, FormBuilder, { provide: Router, useValue: routerMock }, DatePipe]
		}).compileComponents();
	});

	beforeEach(() => {
		fixture = TestBed.createComponent(ConfigHubCloudStorageComponent);
		alertService = TestBed.inject(AlertService);
		routerService = TestBed.inject(Router);
		configHubAdvancedSettingsApiService = TestBed.inject(ConfigHubAdvancedSettingsApiService);
		syncService = TestBed.inject(ConfigHubCloudStorageSyncApiService);
		component = fixture.componentInstance;
		fixture.detectChanges();

		component.cloudStorageForm = new FormGroup({
			bucketName: new FormControl('')
		});
	});

	it('should create', () => {
		expect(component).toBeTruthy();
	});

	describe('ngOnInit', () => {
		it('should fetch cloud storage and retrieve latest sync job', fakeAsync(() => {
			jest.spyOn(configHubAdvancedSettingsApiService, 'getCloudStorage').mockReturnValue(
				of(mockCloudStorageResponse)
			);
			const retrieveSyncJob = jest
				.spyOn(syncService, 'getLatestSyncJob')
				.mockReturnValue(of(mockConfigHubSyncJobResponse));
			const fetchCloudStorageInfoSpy = jest.spyOn(component, 'fetchCloudStorageInfo');
			component.ngOnInit();
			tick();

			expect(fetchCloudStorageInfoSpy).toHaveBeenCalled();
			expect(retrieveSyncJob).toHaveBeenCalled();
		}));
	});

	describe('create cloud storage', () => {
		it('should not call config hub if the bucket name is empty', fakeAsync(() => {
			jest.spyOn(configHubAdvancedSettingsApiService, 'createCloudStorage').mockReturnValue(
				of(mockCloudStorageResponse)
			);
			const saveCloudStorageInfo = jest.spyOn(component, 'saveCloudStorageInfo');

			component.ngOnInit();
			const bucketName = component.cloudStorageForm.get('bucketName') as AbstractControl;
			bucketName.patchValue('');

			component.handleSaveCloudStorage(false);
			tick();

			expect(saveCloudStorageInfo).not.toHaveBeenCalled();
		}));

		it('should call config hub if the bucket name is not empty', fakeAsync(() => {
			jest.spyOn(configHubAdvancedSettingsApiService, 'createCloudStorage').mockReturnValue(
				of(mockCloudStorageResponse)
			);

			const saveCloudStorageInfo = jest.spyOn(component, 'saveCloudStorageInfo');
			const alertOpenSpy = jest.spyOn(alertService, 'open');

			component.ngOnInit();
			const bucketName = component.cloudStorageForm.get('bucketName') as AbstractControl;
			bucketName.patchValue('a bucket');
			tick();

			component.handleSaveCloudStorage(false);
			tick();

			expect(saveCloudStorageInfo).toHaveBeenCalled();
			expect(alertOpenSpy).toHaveBeenCalled();
		}));

		it('should not call the sync service if the cloud storage config is not enabled', fakeAsync(() => {
			const response = mockCloudStorageResponse;
			response.cloudStorageEnabled = false;
			jest.spyOn(configHubAdvancedSettingsApiService, 'createCloudStorage').mockReturnValue(of(response));

			const startSync = jest.spyOn(syncService, 'createSyncJob');

			component.ngOnInit();
			const bucketName = component.cloudStorageForm.get('bucketName') as AbstractControl;
			bucketName.patchValue('a bucket');
			tick();

			component.handleSaveCloudStorage(false);
			tick();

			expect(startSync).not.toHaveBeenCalled();
		}));
	});

	describe('test cloud storage', () => {
		it('should call the test cloud storage endpoint if cloud storage info was saved', fakeAsync(() => {
			const testCloudStorageSpy = jest.spyOn(component, 'testCloudStorageConnection');
			const alertOpenSpy = jest.spyOn(alertService, 'open');
			jest.spyOn(configHubAdvancedSettingsApiService, 'testCloudStorageConnection').mockReturnValue(
				of({ mockGenericResponse } as any)
			);

			component.ngOnInit();
			component.infoWasSaved = true;
			component.bucketName = 'bucket';

			component.testCloudStorageConnection();
			tick();

			expect(testCloudStorageSpy).toHaveBeenCalled();
			expect(alertOpenSpy).toHaveBeenCalled();
		}));
	});

	describe('leaving cloud storage', () => {
		it('should call the router if the cancel button is clicked', fakeAsync(() => {
			component.ngOnInit();

			const routerSpy = jest.spyOn(routerService, 'navigateByUrl');
			component.returnToBackupList();
			tick();

			expect(routerSpy).toHaveBeenCalled();
		}));
	});

	describe('bucket name validation', () => {
		it('should call saveCloudStorageInfo if the bucketName is valid', () => {
			const saveCloudStorageInfoSpy = jest.spyOn(component, 'saveCloudStorageInfo');
			component.cloudStorageForm.get('bucketName')?.setValue('valid-bucket-name');
			component.handleSaveCloudStorage(false);
			expect(saveCloudStorageInfoSpy).toHaveBeenCalled();
		});
	});

	describe('syncFiles', () => {
		it('should handle successful file synchronization', fakeAsync(() => {
			// Set up spies for the service calls and alert service
			const createSyncJobSpy = jest
				.spyOn(syncService, 'createSyncJob')
				.mockReturnValue(of({ mockGenericResponse } as any));
			const alertOpenSpy = jest.spyOn(alertService, 'open');

			component.syncFiles();
			tick(); // Simulate passage of time for the asynchronous operation to complete

			// Assertions to verify the behavior on success
			expect(createSyncJobSpy).toHaveBeenCalled();
			expect(component.loading).toBeFalsy();
			expect(alertOpenSpy).toHaveBeenCalled();
		}));

		it('should not handle sync errors, as those are handled in the service', fakeAsync(() => {
			// Set up spies for the service calls and alert service
			const errorResponse = new Error('An error occurred');
			const createSyncJobSpy = jest
				.spyOn(syncService, 'createSyncJob')
				.mockReturnValue(throwError(() => errorResponse));
			const alertOpenSpy = jest.spyOn(alertService, 'open');

			component.syncFiles();
			tick(); // Simulate passage of time for the asynchronous operation to complete

			// Assertions to verify the behavior on error
			expect(createSyncJobSpy).toHaveBeenCalled();
			expect(component.loading).toBeFalsy();
			expect(alertOpenSpy).not.toHaveBeenCalled();
		}));
	});

	describe('getPatchOperationPayload', () => {
		it('should return a valid PATCH payload', () => {
			const payload = (component as any).getPatchOperationPayload(
				CloudStorageInfoPatchableFields.CLOUD_STORAGE_ENABLED,
				true
			);
			expect(payload).toEqual([
				{
					op: ConfigHubPatchOperations.REPLACE,
					path: '/cloudStorageEnabled',
					value: true
				}
			]);
		});
	});
});
