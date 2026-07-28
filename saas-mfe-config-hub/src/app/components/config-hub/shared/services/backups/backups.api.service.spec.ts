/*
 * Copyright (C) 2023 Acme Technologies, Inc.  All rights reserved.
 */
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';

import { TranslateModule } from '@ngx-translate/core';

import { AlertService } from '@acme-priv/armada-angular/src/acme/angular/components/alert';
import { ModalService } from '@acme-priv/armada-angular/src/acme/angular/components/modal';
import { TranslateService } from '@acme-priv/armada-angular/src/acme/angular/l10n/translation';

import { ApiListResponse } from '@acme-priv/ui-common/src/acme/angular/api/api-service';

import * as backupListModel from '../../../backups/backup-list.model';
import {
	ConfigHubBackupJob,
	ConfigHubJobStatus,
	ConfigHubObjectConfigurationResult,
	IncludedNames,
	MAX_MANUAL_BACKUPS_ALLOWED,
	mockConfigHubBackupJob,
	mockConfigHubBackupJobPartial,
	mockConfigHubBackupUploadJob,
	mockLiveObjectDetails
} from '../../models';
import { ConfigHubBackupsApiService } from './backups.api.service';

describe('ConfigHubBackupsApiService', () => {
	let service: ConfigHubBackupsApiService;
	let httpMock: HttpTestingController;
	let alertService: AlertService;
	let modalService: ModalService;
	let translateService: TranslateService;
	let apiPath: string;
	let apiUploadsPath: string;

	beforeEach(() => {
		TestBed.configureTestingModule({
			imports: [HttpClientTestingModule, TranslateModule.forRoot()],
			providers: [
				{
					provide: AlertService,
					useValue: { open: jest.fn() }
				},
				{
					provide: ModalService,
					useValue: { openErrorModal: jest.fn() }
				},
				TranslateService
			]
		});
		service = TestBed.inject(ConfigHubBackupsApiService);
		httpMock = TestBed.inject(HttpTestingController);
		alertService = TestBed.inject(AlertService);
		modalService = TestBed.inject(ModalService);
		translateService = TestBed.inject(TranslateService);
		apiPath = `${service.API_VERSION}://${service.API_PATH}`;
		apiUploadsPath = `${service.API_VERSION}://${service.API_PATH}/uploads`;
	});

	it('should be created', () => {
		expect(service).toBeTruthy();
	});

	describe('createBackupJob', () => {
		it('should create a new ConfigHubBackupJob via POST request', done => {
			service
				.createBackupJob(<string>mockConfigHubBackupJob.name)
				.subscribe((createResponse: ConfigHubBackupJob) => {
					expect(createResponse).toEqual(mockConfigHubBackupJob);
					httpMock.verify();
					done();
				});

			const request = httpMock.expectOne({
				method: 'POST',
				url: apiPath
			});
			request.flush(mockConfigHubBackupJob);
		});

		it('should handle error alert when max number of backups was reached', done => {
			const handleErrorSpy = jest.spyOn(service as any, 'handleRequestError');
			const errorResponse = { messages: [{ text: 'error' }] };
			service.createBackupJob(<string>mockConfigHubBackupJob.name).subscribe({
				next: () => {
					fail('should have failed with 400 error');
				},
				error: error => {
					expect(error.error).toEqual(errorResponse);
					expect(error.status).toEqual(400);
					expect(handleErrorSpy).toHaveBeenCalled();
					expect(handleErrorSpy).toHaveBeenCalledWith(error);

					httpMock.verify();
					done();
				}
			});

			const request = httpMock.expectOne({
				method: 'POST',
				url: apiPath
			});
			request.flush(errorResponse, { status: 400, statusText: 'error' });
			httpMock.verify();
		});
	});

	describe('createPartialBackupJob', () => {
		it('should create a new ConfigHubBackupJob via POST request', done => {
			service
				.createPartialBackupJob(
					<string>mockConfigHubBackupJob.name,
					['AUTH_ORG'],
					new Map<string, IncludedNames>()
				)
				.subscribe((createResponse: ConfigHubBackupJob) => {
					expect(createResponse).toEqual(mockConfigHubBackupJobPartial);
					httpMock.verify();
					done();
				});

			const request = httpMock.expectOne({
				method: 'POST',
				url: apiPath
			});
			request.flush(mockConfigHubBackupJobPartial);
		});

		it('should handle error alert when max number of backups was reached', done => {
			const handleErrorSpy = jest.spyOn(service as any, 'handleRequestError');
			const errorResponse = { messages: [{ text: 'error' }] };
			service
				.createPartialBackupJob(
					<string>mockConfigHubBackupJob.name,
					['AUTH_ORG'],
					new Map<string, IncludedNames>()
				)
				.subscribe({
					next: () => {
						fail('should have failed with 400 error');
					},
					error: error => {
						expect(error.error).toEqual(errorResponse);
						expect(error.status).toEqual(400);
						expect(handleErrorSpy).toHaveBeenCalled();
						expect(handleErrorSpy).toHaveBeenCalledWith(error);

						httpMock.verify();
						done();
					}
				});

			const request = httpMock.expectOne({
				method: 'POST',
				url: apiPath
			});
			request.flush(errorResponse, { status: 400, statusText: 'error' });
			httpMock.verify();
		});
	});

	describe('loadCompletedBackupJobs', () => {
		it('should list all completed ConfigHubBackupJobs via GET request', done => {
			service.loadCompletedBackupJobs().subscribe((listResponse: ApiListResponse<ConfigHubBackupJob>) => {
				expect(listResponse.items).toEqual([mockConfigHubBackupJob]);
				httpMock.verify();
				done();
			});

			const params = encodeURI(`?filters=status eq "${ConfigHubJobStatus.COMPLETE}"`);

			const request = httpMock.expectOne({
				method: 'GET',
				url: apiPath + params
			});
			request.flush([mockConfigHubBackupJob]);
		});
		it('should list all uploaded ConfigHubBackupJobs via GET request', done => {
			service.loadUploadedBackups().subscribe((listResponse: ApiListResponse<ConfigHubBackupJob>) => {
				expect(listResponse.items).toEqual([mockConfigHubBackupJob]);
				httpMock.verify();
				done();
			});

			const params = encodeURI(`?filters=status eq "${ConfigHubJobStatus.COMPLETE}"`);

			const request = httpMock.expectOne({
				method: 'GET',
				url: apiUploadsPath + params
			});
			request.flush([mockConfigHubBackupJob]);
		});
	});

	describe('loadInProgressBackupJob', () => {
		it('should return an in-progress ConfigHubBackupJob via GET request', done => {
			service.loadInProgressBackupJob().subscribe((response: ConfigHubBackupJob) => {
				expect(response).toEqual(mockConfigHubBackupJob);
				httpMock.verify();
				done();
			});

			const params = encodeURI(`?filters=status eq "${ConfigHubJobStatus.IN_PROGRESS}"`);

			const request = httpMock.expectOne({
				method: 'GET',
				url: apiPath + params
			});
			request.flush([mockConfigHubBackupJob]);
		});
	});

	describe('getObjectLiveConfiguration', () => {
		it('should return an object with the live configuration JSON for an object via GET request', done => {
			service
				.getObjectLiveConfiguration('target-id', 'object-id')
				.subscribe((response: ConfigHubObjectConfigurationResult) => {
					expect(response).toEqual(mockLiveObjectDetails);
				});

			const request = httpMock.expectOne({
				method: 'GET',
				url: `${apiPath}/target-id/object/object-id`
			});

			expect(request.request.method).toEqual('GET');
			request.flush(mockLiveObjectDetails);
			httpMock.verify();
			done();
		});
	});

	describe('hydrateBackup', () => {
		it('should return a boolean if POST request succeeds', done => {
			service.hydrateBackup(mockConfigHubBackupJob.jobId).subscribe(() => {
				done();
			});

			const request = httpMock.expectOne({
				method: 'POST',
				url: `${apiPath}/${ConfigHubBackupsApiService.HYDRATE_PATH_SEGMENT}`
			});
			request.flush(mockConfigHubBackupJob);
		});
	});

	describe('get', () => {
		it('should get a single ConfigHubBackupJob via GET request', done => {
			service.get(mockConfigHubBackupJob.jobId).subscribe((getResponse: ConfigHubBackupJob) => {
				expect(getResponse).toEqual(mockConfigHubBackupJob);
				httpMock.verify();
				done();
			});

			const request = httpMock.expectOne({
				method: 'GET',
				url: `${apiPath}/${mockConfigHubBackupJob.jobId}`
			});
			request.flush(mockConfigHubBackupJob);
		});
	});

	describe('delete', () => {
		it('should delete a ConfigHubBackupJob via DELETE request', done => {
			service.delete(mockConfigHubBackupJob.jobId).subscribe(() => {
				done();
			});

			const request = httpMock.expectOne(
				req => req.url === `${apiPath}/${mockConfigHubBackupJob.jobId}` && req.method === 'DELETE'
			);

			request.flush({});
			httpMock.verify();
		});

		it('should delete a ConfigHubBackupJob of type Upload via DELETE request', done => {
			service.deleteUploadedBackup(mockConfigHubBackupUploadJob.jobId).subscribe(() => {
				done();
			});

			const request = httpMock.expectOne(
				req => req.url === `${apiUploadsPath}/${mockConfigHubBackupUploadJob.jobId}` && req.method === 'DELETE'
			);

			request.flush({});
			httpMock.verify();
		});
	});

	describe('handleRequestError', () => {
		it('should open custom alert when max number of backups was reached', () => {
			const openAlertSpy = jest.spyOn(alertService, 'open');
			const backupsLimitAlertSpy = jest.spyOn(backupListModel, 'getBackupsLimitReachedAlertConfig');
			(service as any).handleRequestError({ error: { detailCode: '400.1.4 Limit violation' } });

			expect(openAlertSpy).toBeCalledTimes(1);
			expect(backupsLimitAlertSpy).toBeCalledTimes(1);
			expect(backupsLimitAlertSpy).toBeCalledWith(MAX_MANUAL_BACKUPS_ALLOWED, translateService);
		});

		it('should open error modal when error is not related with max number of backups ', () => {
			const openAlertSpy = jest.spyOn(alertService, 'open');
			const errorResponse = { trackingId: 'mockTrackingId', messages: [{ text: 'mockMessage' }], detailCode: '' };
			const openErrorModalSpy = jest.spyOn(modalService, 'openErrorModal');
			(service as any).handleRequestError({ error: errorResponse });

			expect(openAlertSpy).not.toBeCalled();
			expect(openErrorModalSpy).toBeCalledTimes(1);
			expect(openErrorModalSpy).toBeCalledWith(undefined, undefined, 'mockTrackingId', ['mockMessage']);
		});
	});

	describe('getObjectsByType', () => {
		it('should call METHOD GET with correct object type', done => {
			service.getObjectsByType(mockConfigHubBackupJob.jobId, 'test-object', '', 25, 0, '').subscribe(() => {
				done();
			});

			const params = encodeURI('?limit=25&offset=0&filters=objectType eq "test-object"');

			const request = httpMock.expectOne({
				method: 'GET',
				url: `${apiPath}/${mockConfigHubBackupJob.jobId}/${ConfigHubBackupsApiService.OBJECTS_PATH_SEGMENT}${params}`
			});
			request.flush(mockConfigHubBackupJob);
		});
	});
});
