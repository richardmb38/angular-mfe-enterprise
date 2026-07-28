/*
 * Copyright (C) 2023 Acme Technologies, Inc.  All rights reserved.
 */
import { HttpClient } from '@angular/common/http';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { Injectable } from '@angular/core';
import { TestBed, fakeAsync, tick } from '@angular/core/testing';

import { TranslateModule } from '@ngx-translate/core';

import { ModalService } from '@acme-priv/armada-angular/src/acme/angular/components/modal';
import { TranslateService } from '@acme-priv/armada-angular/src/acme/angular/l10n/translation';

import { ApiVersion } from '@acme-priv/ui-common/src/acme/angular/api';

import {
	ConfigHubBackupJob,
	ConfigHubBackupSummary,
	ConfigHubDeployResults,
	ConfigHubJobType,
	JOB_STATUS_POLL_PERIOD,
	mockConfigHubBackupJob,
	mockConfigHubBackupJobSummary,
	mockConfigHubDeployJob,
	mockConfigHubDeployResults
} from '../../models';
import { ConfigHubBaseApiService } from './base.api.service';

@Injectable({ providedIn: 'root' })
class MockApiService extends ConfigHubBaseApiService<
	ConfigHubBackupJob,
	ConfigHubBackupSummary,
	ConfigHubDeployResults
> {
	constructor(httpClient: HttpClient, modalService: ModalService) {
		super(ApiVersion.BETA, 'sp-config/backups', ConfigHubJobType.BACKUP, httpClient, modalService);
	}
}

describe('ConfigHubBaseApiService', () => {
	let service: MockApiService;
	let httpMock: HttpTestingController;
	let modalService: ModalService;
	let apiPath: string;

	beforeEach(() => {
		TestBed.configureTestingModule({
			imports: [HttpClientTestingModule, TranslateModule.forRoot()],
			providers: [
				{
					provide: ModalService,
					useValue: { openErrorModal: jest.fn() }
				},
				TranslateService,
				MockApiService
			]
		});
		service = TestBed.inject(MockApiService);
		httpMock = TestBed.inject(HttpTestingController);
		modalService = TestBed.inject(ModalService);

		apiPath = `${service.API_VERSION}://${service.API_PATH}`;
	});

	it('should be created', () => {
		expect(service).toBeTruthy();
	});

	describe('get', () => {
		it('should get a single item via GET request', done => {
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

	describe('getSummary', () => {
		it('should return a summary via GET request', done => {
			service.getSummary(mockConfigHubBackupJobSummary.jobId).subscribe(getResponse => {
				expect(getResponse).toEqual(mockConfigHubBackupJobSummary);
				httpMock.verify();
				done();
			});

			const request = httpMock.expectOne({
				method: 'GET',
				url: `${apiPath}/${mockConfigHubBackupJobSummary.jobId}/${ConfigHubBaseApiService.SUMMARY_PATH_SEGMENT}`
			});
			request.flush(mockConfigHubBackupJobSummary);
		});
	});

	describe('getDownload', () => {
		it('should return download results via GET request', done => {
			service.getDownload(mockConfigHubDeployJob.jobId).subscribe(getResponse => {
				expect(getResponse).toEqual(mockConfigHubDeployResults);
				httpMock.verify();
				done();
			});

			const request = httpMock.expectOne({
				method: 'GET',
				url: `${apiPath}/${mockConfigHubDeployJob.jobId}/${ConfigHubBaseApiService.DOWNLOAD_PATH_SEGMENT}`
			});
			request.flush(mockConfigHubDeployResults);
		});
	});

	describe('watchInProgressJob', () => {
		it('should watch a job for the given jobId', fakeAsync(() => {
			let invoked = false;
			service.watchInProgressJob(mockConfigHubBackupJob.jobId, JOB_STATUS_POLL_PERIOD).subscribe(() => {
				invoked = true;
			});
			tick(0);

			const request = httpMock.expectOne({
				method: 'GET',
				url: `${apiPath}/${mockConfigHubBackupJob.jobId}`
			});

			request.flush(mockConfigHubBackupJob);
			httpMock.verify();
			tick(1);
			expect(invoked).toBeTruthy();
		}));
	});

	describe('watchStatusInProgress', () => {
		it('should watch a job for the given jobId', fakeAsync(() => {
			let invoked = false;
			service
				.watchStatusInProgress(mockConfigHubBackupJob.jobId, JOB_STATUS_POLL_PERIOD, () => false)
				.subscribe(() => {
					invoked = true;
				});
			tick(0);

			const request = httpMock.expectOne({
				method: 'GET',
				url: `${apiPath}/${mockConfigHubBackupJob.jobId}`
			});

			request.flush(mockConfigHubBackupJob);
			httpMock.verify();
			tick(1);
			expect(invoked).toBeTruthy();
		}));
	});

	describe('handleRequestError', () => {
		it('should open error modal', () => {
			const errorResponse = { trackingId: 'mockTrackingId', messages: [{ text: 'mockMessage' }], detailCode: '' };
			const openErrorModalSpy = jest.spyOn(modalService, 'openErrorModal');
			(service as any).handleRequestError({ error: errorResponse });

			expect(openErrorModalSpy).toBeCalledTimes(1);
			expect(openErrorModalSpy).toBeCalledWith(undefined, undefined, 'mockTrackingId', ['mockMessage']);
		});
	});
});
