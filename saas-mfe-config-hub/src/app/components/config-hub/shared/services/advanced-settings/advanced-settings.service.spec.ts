/*
 * Copyright (C) 2024 Acme Technologies, Inc.  All rights reserved.
 */
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';

import { ModalService } from '@acme-priv/armada-angular/src/acme/angular/components/modal';
import {
	TranslateModule,
	TranslateService
} from '@acme-priv/armada-angular/src/acme/angular/l10n/translation';

import { ApiVersion } from '@acme-priv/ui-common/src/acme/angular/api';

import {
	mockCloudStoragePatch,
	mockCloudStoragePayload,
	mockCloudStorageResponse
} from '../../models/cloud-storage.mock.model';
import { ConfigHubAdvancedSettings, ConfigHubAdvancedSettingsApiResponse } from '../../models/cloud-storage.model';
import { mockGenericApiResponse, mockGenericResponse } from '../../models/generic-response.mock.model';
import { GenericResponse } from '../../models/generic-response.model';
import { ConfigHubAdvancedSettingsApiService } from './advanced-settings.service';

describe('Cloud Storage', () => {
	let service: ConfigHubAdvancedSettingsApiService;
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
		service = TestBed.inject(ConfigHubAdvancedSettingsApiService);
		httpMock = TestBed.inject(HttpTestingController);
		modalService = TestBed.inject(ModalService);
		apiPath = `${ApiVersion.BETA}://${ConfigHubAdvancedSettingsApiService.API_PATH}`;
	});

	it('should be created', () => {
		expect(service).toBeTruthy();
	});

	describe('getS3Info', () => {
		it('should return a ConfigHubAdvancedSettings object when calling the s3-info endpoint with a GET request', done => {
			service.getCloudStorage().subscribe((response: ConfigHubAdvancedSettings) => {
				expect(response).toEqual(mockCloudStorageResponse);
				httpMock.verify();
				done();
			});

			const request = httpMock.expectOne({
				method: 'GET',
				url: apiPath
			});
			request.flush(mockCloudStorageResponse);
		});
	});

	describe('createS3Info', () => {
		it('should create a new cloud storage object and return it', done => {
			service.createCloudStorage(mockCloudStoragePayload).subscribe((response: ConfigHubAdvancedSettings) => {
				expect(response).toEqual(mockCloudStorageResponse);
				httpMock.verify();
				done();
			});

			const request = httpMock.expectOne({
				method: 'POST',
				url: apiPath
			});
			request.flush(mockCloudStorageResponse);
		});
	});

	describe('updateS3Info', () => {
		it('should update an existing cloud storage object and return it', done => {
			service.updateCloudStorage(mockCloudStoragePayload).subscribe((response: ConfigHubAdvancedSettings) => {
				expect(response).toEqual(mockCloudStorageResponse);
				httpMock.verify();
				done();
			});

			const request = httpMock.expectOne({
				method: 'PUT',
				url: apiPath
			});
			request.flush(mockCloudStorageResponse);
		});
	});

	describe('patchS3Info', () => {
		it('should patch an existing cloud storage object and return it', done => {
			service.patchCloudStorage(mockCloudStoragePatch).subscribe((response: ConfigHubAdvancedSettings) => {
				expect(response).toEqual(mockCloudStorageResponse);
				httpMock.verify();
				done();
			});

			const request = httpMock.expectOne({
				method: 'PATCH',
				url: apiPath
			});
			request.flush(mockCloudStorageResponse);
		});
	});

	describe('deleteS3Info', () => {
		it('should delete an existing cloud storage object and return an empty response', done => {
			service.deleteCloudStorage().subscribe(() => {
				done();
			});

			const request = httpMock.expectOne(req => req.url === `${apiPath}` && req.method === 'DELETE');

			request.flush({});
			httpMock.verify();
		});
	});

	describe('testS3InfoConnection', () => {
		it('should test the connection between config hub and the customer S3 bucket', done => {
			service
				.testCloudStorageConnection()
				.subscribe((response: ConfigHubAdvancedSettingsApiResponse<GenericResponse>) => {
					expect(response.body).toEqual(mockGenericResponse);
					httpMock.verify();
					done();
				});

			const request = httpMock.expectOne({
				method: 'POST',
				url: apiPath + '/test-connection'
			});
			request.flush(mockGenericApiResponse);
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

	describe('getIsApprovalsSettingEnabled', () => {
		it('should return a boolean value for the approvals setting enablement', done => {
			service.getIsApprovalsSettingEnabled().subscribe((response: Boolean) => {
				expect(response).toEqual(true);
				httpMock.verify();
				done();
			});

			const request = httpMock.expectOne({
				method: 'GET',
				url: `${ApiVersion.BETA}://${ConfigHubAdvancedSettingsApiService.ADVANCE_SETTINGS_API_PATH}/${ConfigHubAdvancedSettingsApiService.APPROVALS_API_PATH}`
			});
			request.flush(true);
		});
	});
});
