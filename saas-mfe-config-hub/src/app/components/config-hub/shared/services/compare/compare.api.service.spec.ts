/*
 * Copyright (C) 2023 Acme Technologies, Inc.  All rights reserved.
 */
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';

import { TranslateModule } from '@ngx-translate/core';

import { ModalService } from '@acme-priv/armada-angular/src/acme/angular/components/modal';
import { TranslateService } from '@acme-priv/armada-angular/src/acme/angular/l10n/translation';

import { ConfigHubCompareJob, mockConfigHubCompareJob } from '../../models';
import { ConfigHubCompareApiService } from './compare.api.service';

describe('ConfigHubCompareApiService', () => {
	let service: ConfigHubCompareApiService;
	let httpMock: HttpTestingController;
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
		service = TestBed.inject(ConfigHubCompareApiService);
		httpMock = TestBed.inject(HttpTestingController);
		apiPath = `${service.API_VERSION}://${service.API_PATH}`;
	});

	it('should be created', () => {
		expect(service).toBeTruthy();
	});

	describe('createCompareJob', () => {
		it('should create a new ConfigHubCompareJob via POST request', done => {
			service
				.createCompareJob(mockConfigHubCompareJob.sourceId, mockConfigHubCompareJob.targetId)
				.subscribe((createResponse: ConfigHubCompareJob) => {
					expect(createResponse).toEqual(mockConfigHubCompareJob);
					httpMock.verify();
					done();
				});

			const request = httpMock.expectOne({
				method: 'POST',
				url: apiPath
			});
			request.flush(mockConfigHubCompareJob);
		});
	});

	describe('get', () => {
		it('should get a single ConfigHubCompareJob via GET request', done => {
			service.get(mockConfigHubCompareJob.jobId).subscribe((getResponse: ConfigHubCompareJob) => {
				expect(getResponse).toEqual(mockConfigHubCompareJob);
				httpMock.verify();
				done();
			});

			const request = httpMock.expectOne({
				method: 'GET',
				url: `${apiPath}/${mockConfigHubCompareJob.jobId}`
			});
			request.flush(mockConfigHubCompareJob);
		});
	});
});
