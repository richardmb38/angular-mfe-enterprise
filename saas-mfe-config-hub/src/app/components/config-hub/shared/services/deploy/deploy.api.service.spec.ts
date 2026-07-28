/*
 * Copyright (C) 2023 Acme Technologies, Inc.  All rights reserved.
 */
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';

import { TranslateModule } from '@ngx-translate/core';

import { ModalService } from '@acme-priv/armada-angular/src/acme/angular/components/modal';
import { TranslateService } from '@acme-priv/armada-angular/src/acme/angular/l10n/translation';

import { ConfigHubDeployJob, mockConfigHubDeployJob } from '../../models';
import { ConfigHubDeployApiService } from './deploy.api.service';

describe('ConfigHubDeployApiService', () => {
	let service: ConfigHubDeployApiService;
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
		service = TestBed.inject(ConfigHubDeployApiService);
		httpMock = TestBed.inject(HttpTestingController);
		apiPath = `${service.API_VERSION}://${service.API_PATH}`;
	});

	it('should be created', () => {
		expect(service).toBeTruthy();
	});

	describe('createDeployJob', () => {
		it('should create a new ConfigHubDeployJob via POST request', done => {
			service.createDeployJob(mockConfigHubDeployJob.draftId).subscribe((createResponse: ConfigHubDeployJob) => {
				expect(createResponse).toEqual(mockConfigHubDeployJob);
				httpMock.verify();
				done();
			});

			const request = httpMock.expectOne({
				method: 'POST',
				url: apiPath
			});
			request.flush(mockConfigHubDeployJob);
		});
	});

	describe('get', () => {
		it('should get a single ConfigHubDeployJob via GET request', done => {
			service.get(mockConfigHubDeployJob.jobId).subscribe((getResponse: ConfigHubDeployJob) => {
				expect(getResponse).toEqual(mockConfigHubDeployJob);
				httpMock.verify();
				done();
			});

			const request = httpMock.expectOne({
				method: 'GET',
				url: `${apiPath}/${mockConfigHubDeployJob.jobId}`
			});
			request.flush(mockConfigHubDeployJob);
		});
	});
});
