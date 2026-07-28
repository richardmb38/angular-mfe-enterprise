/*
 * Copyright (C) 2023 Acme Technologies, Inc.  All rights reserved.
 */
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';

import { ModalService } from '@acme-priv/armada-angular/src/acme/angular/components/modal';
import {
	TranslateModule,
	TranslateService
} from '@acme-priv/armada-angular/src/acme/angular/l10n/translation';

import { ApiListResponse, ApiVersion } from '@acme-priv/ui-common/src/acme/angular/api';

import {
	ConfigHubJobType,
	ConfigHubScheduledJob,
	ConfigHubScheduledJobPayload,
	MOCK_SCHEDULE_JOB_ARRAY,
	mockConfigHubBackupJobPartial,
	mockScheduleJobResponse
} from '../../models';
import { ConfigHubScheduledJobsApiService } from './scheduled-jobs.api.service';

describe('ConfigHubScheduledJobsApiService', () => {
	let service: ConfigHubScheduledJobsApiService;
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
				TranslateService
			]
		});
		service = TestBed.inject(ConfigHubScheduledJobsApiService);
		httpMock = TestBed.inject(HttpTestingController);
		modalService = TestBed.inject(ModalService);
		apiPath = `${ApiVersion.BETA}://${ConfigHubScheduledJobsApiService.API_PATH}`;
	});

	it('should be created', () => {
		expect(service).toBeTruthy();
	});

	describe('getJobs', () => {
		const mockApiListResponse: ApiListResponse<any> = {
			items: MOCK_SCHEDULE_JOB_ARRAY,
			offset: 0,
			limit: 6,
			count: 2
		};

		it('should list all scheduled jobs via GET request', done => {
			service.listScheduledJob().subscribe((response: ApiListResponse<any>) => {
				expect(response).toEqual(mockApiListResponse);
			});

			const request = httpMock.expectOne({
				method: 'GET',
				url: apiPath
			});
			expect(request.request.method).toEqual('GET');
			request.flush(mockApiListResponse);
			httpMock.verify();
			done();
		});
	});

	describe('createScheduledJob', () => {
		it('should create a new scheduled job via POST request', done => {
			const mockCronExpression = '0 0 0 * * * *';

			const payload: ConfigHubScheduledJobPayload = {
				jobType: ConfigHubJobType.BACKUP,
				cronString: mockCronExpression,
				content: {
					backupOptions: mockConfigHubBackupJobPartial.backupOptions,
					name: 'test'
				}
			};

			service.createScheduledJob(payload).subscribe((response: ConfigHubScheduledJob) => {
				expect(response).toEqual(mockScheduleJobResponse);
			});

			const request = httpMock.expectOne({
				method: 'POST',
				url: apiPath
			});

			expect(request.request.method).toEqual('POST');
			request.flush(mockScheduleJobResponse);
			httpMock.verify();
			done();
		});
	});

	describe('editScheduledJob', () => {
		it('should patch an existing scheduled backup job', done => {
			const mockCronExpression = '0 0 0 * * * *';

			const mockId = '123456';

			const payload: ConfigHubScheduledJobPayload = {
				jobType: ConfigHubJobType.BACKUP,
				cronString: mockCronExpression,
				startTime: '01-12-2025T13:00:00Z00.00',
				content: {
					backupOptions: mockConfigHubBackupJobPartial.backupOptions,
					name: 'test'
				}
			};

			service.editScheduledJob(payload, mockId).subscribe((response: ConfigHubScheduledJob) => {
				expect(response).toEqual(mockScheduleJobResponse);
			});

			const request = httpMock.expectOne({
				method: 'PATCH',
				url: `${apiPath}/${mockId}`
			});

			expect(request.request.method).toEqual('PATCH');
			expect(request.request.body.length).toBe(3);

			request.flush(mockScheduleJobResponse);
			httpMock.verify();
			done();
		});

		it('should patch an existing scheduled deploy job', done => {
			const mockId = '123456';

			const payload: ConfigHubScheduledJobPayload = {
				jobType: ConfigHubJobType.DEPLOY,
				startTime: '01-12-2025T13:00:00Z00.00'
			};

			service.editScheduledJob(payload, mockId).subscribe((response: ConfigHubScheduledJob) => {
				expect(response).toEqual(mockScheduleJobResponse);
			});

			const request = httpMock.expectOne({
				method: 'PATCH',
				url: `${apiPath}/${mockId}`
			});

			expect(request.request.method).toEqual('PATCH');
			expect(request.request.body.length).toBe(1);

			request.flush(mockScheduleJobResponse);
			httpMock.verify();
			done();
		});
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
