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

import { ConfigHubPatchOperations } from '../../models';
import { mockConfigHubObjectMappingList } from '../../models/object-mapping.mock';
import { ConfigHubObjectMapping, ObjectMappingPatchDictionary } from '../../models/object-mapping.model';
import { ConfigHubObjectMappingService } from './object-mappings.service';

describe('ConfigHubTenantConnectionsApiService', () => {
	let service: ConfigHubObjectMappingService;
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
		service = TestBed.inject(ConfigHubObjectMappingService);
		httpMock = TestBed.inject(HttpTestingController);
		modalService = TestBed.inject(ModalService);
		apiPath = `${ApiVersion.BETA}://${ConfigHubObjectMappingService.API_PATH}`;
	});

	it('should be created', () => {
		expect(service).toBeTruthy();
	});

	describe('getConnections', () => {
		const mockApiListResponse: ApiListResponse<ConfigHubObjectMapping> = {
			items: mockConfigHubObjectMappingList,
			offset: 0,
			limit: 6,
			count: 2
		};

		it('should list all tenant connections via GET request', done => {
			service
				.listObjectMappingsSourceOrg('test')
				.subscribe((response: ApiListResponse<ConfigHubObjectMapping>) => {
					expect(response).toEqual(mockApiListResponse);
				});

			const request = httpMock.expectOne({
				method: 'GET',
				url: apiPath + '/test'
			});
			expect(request.request.method).toEqual('GET');
			request.flush(mockApiListResponse);
			httpMock.verify();
			done();
		});
	});

	describe('deleteObjectMapping', () => {
		it('should delete a new tenant connection via DELETE request', done => {
			service
				.deleteObjectMapping('testTenant', (mockConfigHubObjectMappingList as any)[0].objectMappingId)
				.subscribe(() => {
					httpMock.verify();
					done();
				});

			const request = httpMock.expectOne({
				method: 'DELETE',
				url: `${ApiVersion.BETA}://${ConfigHubObjectMappingService.API_PATH}/testTenant/${mockConfigHubObjectMappingList[0].objectMappingId}`
			});
			request.flush(mockConfigHubObjectMappingList[0]);
		});
	});

	describe('createObjectMappingsSourceOrg', () => {
		it('should create a new tenant connection via CREATE request', done => {
			service.createObjectMappingsSourceOrg('testTenant', mockConfigHubObjectMappingList).subscribe(() => {
				httpMock.verify();
				done();
			});

			const request = httpMock.expectOne({
				method: 'POST',
				url: `${ApiVersion.BETA}://${ConfigHubObjectMappingService.API_PATH}/testTenant/bulk-create`
			});
			request.flush(mockConfigHubObjectMappingList);
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

	describe('bulkPatchObjectMappings', () => {
		it('should apply patch updates via POST request', done => {
			const jsonPatchOperation: ObjectMappingPatchDictionary = {
				[mockConfigHubObjectMappingList[0].objectMappingId as string]: [
					{
						op: ConfigHubPatchOperations.REPLACE,
						path: 'enabled',
						value: true
					}
				]
			};
			service.bulkPatchObjectMappings('testTenant', jsonPatchOperation).subscribe(() => {
				httpMock.verify();
				done();
			});

			const request = httpMock.expectOne({
				method: 'POST',
				url: `${ApiVersion.BETA}://${ConfigHubObjectMappingService.API_PATH}/testTenant/bulk-patch`
			});
			request.flush({ body: { patchedObjects: mockConfigHubObjectMappingList[0] } });
		});
	});
});
