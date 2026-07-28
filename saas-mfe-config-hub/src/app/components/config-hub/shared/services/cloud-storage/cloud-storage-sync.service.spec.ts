/*
 * Copyright (C) 2024 Acme Technologies, Inc.  All rights reserved.
 */
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';

import { AlertService } from '@acme-priv/armada-angular/src/acme/angular/components/alert';
import { ModalService } from '@acme-priv/armada-angular/src/acme/angular/components/modal';
import {
	TranslateModule,
	TranslateService
} from '@acme-priv/armada-angular/src/acme/angular/l10n/translation';

import { ApiVersion } from '@acme-priv/ui-common/src/acme/angular/api';

import { ConfigHubSyncJob, mockConfigHubSyncJob } from '../../models';
import { mockConfigHubSyncList } from '../../models/job.mock';
import { ConfigHubCloudSyncListResponse } from './../../../activity-log/activity-log.model';
import { ConfigHubCloudStorageSyncApiService } from './cloud-storage-sync.service';

describe('Cloud Storage Sync', () => {
	let service: ConfigHubCloudStorageSyncApiService;
	let httpMock: HttpTestingController;
	let modalService: ModalService;
	let alertService: AlertService;
	let apiPath: string;

	beforeEach(() => {
		TestBed.configureTestingModule({
			imports: [HttpClientTestingModule, TranslateModule.forRoot()],
			providers: [
				{
					provide: ModalService,
					useValue: { openErrorModal: jest.fn() }
				},
				TranslateService
			]
		});
		service = TestBed.inject(ConfigHubCloudStorageSyncApiService);
		httpMock = TestBed.inject(HttpTestingController);
		modalService = TestBed.inject(ModalService);
		alertService = TestBed.inject(AlertService);
		apiPath = `${ApiVersion.BETA}://${ConfigHubCloudStorageSyncApiService.API_PATH}`;
	});

	it('should be created', () => {
		expect(service).toBeTruthy();
	});

	describe('createSyncJob', () => {
		it('should return a ConfigHubSyncJob object when calling the cloud-storage-sync endpoint with a POST request', done => {
			service.createSyncJob().subscribe((response: ConfigHubSyncJob) => {
				expect(response).toEqual(mockConfigHubSyncJob);
				httpMock.verify();
				done();
			});

			const request = httpMock.expectOne({
				method: 'POST',
				url: apiPath
			});
			request.flush(mockConfigHubSyncJob);
		});

		it('should open modal if error code 404 is returned', done => {
			const openInfoModal = jest.spyOn(alertService, 'open');
			const errorResponse = {
				trackingId: 'mockTrackingId',
				messages: [{ text: 'mockMessage' }],
				detailCode: '404'
			};

			service.createSyncJob().subscribe({
				next: () => {
					fail('should have failed with 404 error');
				},
				error: err => {
					expect(err.error.detailCode).toEqual('404');
					expect(openInfoModal).toHaveBeenCalledTimes(1);
					httpMock.verify();
					done();
				}
			});

			const request = httpMock.expectOne({
				method: 'POST',
				url: apiPath
			});

			request.flush(errorResponse, { status: 404, statusText: 'No files to sync' });
			httpMock.verify();
		});

		it('should open modal if error code 400 is returned', done => {
			const openInfoModal = jest.spyOn(alertService, 'open');
			const errorResponse = {
				trackingId: 'mockTrackingId',
				messages: [{ text: 'mockMessage' }],
				detailCode: '400'
			};

			service.createSyncJob().subscribe({
				next: () => {
					fail('should have failed with 400 error');
				},
				error: err => {
					expect(err.error.detailCode).toEqual('400');
					expect(openInfoModal).toHaveBeenCalledTimes(1);
					httpMock.verify();
					done();
				}
			});

			const request = httpMock.expectOne({
				method: 'POST',
				url: apiPath
			});

			request.flush(errorResponse, { status: 400, statusText: 'Sync job in progress' });
			httpMock.verify();
		});
	});

	describe('getSyncJob', () => {
		it('should get a single ConfigHubBackupJob via GET request', done => {
			service.get(mockConfigHubSyncJob.jobId).subscribe((getResponse: ConfigHubSyncJob) => {
				expect(getResponse).toEqual(mockConfigHubSyncJob);
				httpMock.verify();
				done();
			});

			const request = httpMock.expectOne({
				method: 'GET',
				url: `${apiPath}/${mockConfigHubSyncJob.jobId}`
			});
			request.flush(mockConfigHubSyncJob);
		});
	});

	describe('handleRequestError', () => {
		it('should open error modal', () => {
			const errorResponse = { trackingId: 'mockTrackingId', messages: [{ text: 'mockMessage' }], detailCode: '' };
			const openErrorModalSpy = jest.spyOn(modalService, 'openErrorModal');
			(service as any).handleRequestError({ error: errorResponse });

			expect(openErrorModalSpy).toHaveBeenCalledTimes(1);
			expect(openErrorModalSpy).toHaveBeenCalledWith(undefined, undefined, 'mockTrackingId', ['mockMessage']);
		});
	});

	describe('getCloudSyncList', () => {
		it('should get a list of ConfigHubSyncJob via GET request', done => {
			service.getCloudSyncListPaginated('', 1).subscribe((getResponse: ConfigHubCloudSyncListResponse) => {
				expect(getResponse).toEqual(mockConfigHubSyncList);
				httpMock.verify();
				done();
			});

			const request = httpMock.expectOne({
				method: 'GET',
				url: apiPath + '?limit=1'
			});
			request.flush(mockConfigHubSyncList);
		});
	});
});
