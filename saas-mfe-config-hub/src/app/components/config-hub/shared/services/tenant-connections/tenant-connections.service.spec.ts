/*
 * Copyright (C) 2023 Acme Technologies, Inc.  All rights reserved.
 */
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';

import { Observable } from 'rxjs';

import { ModalService } from '@acme-priv/armada-angular/src/acme/angular/components/modal';
import {
	TranslateModule,
	TranslateService
} from '@acme-priv/armada-angular/src/acme/angular/l10n/translation';

import { ApiListResponse, ApiVersion } from '@acme-priv/ui-common/src/acme/angular/api';

import {
	ConfigHubBackupJob,
	ConfigHubBackupSummary,
	ConfigHubTenantConnection,
	CreateTenantConnectionParams,
	mockConfigHubBackupJob,
	mockConfigHubBackupJobSummary,
	mockConfigHubTenantConnection,
	mockConfigHubTenantConnectionsList
} from '../../models';
import { ConfigHubTenantConnectionsService } from './tenant-connections.service';

describe('ConfigHubTenantConnectionsApiService', () => {
	let service: ConfigHubTenantConnectionsService;
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
		service = TestBed.inject(ConfigHubTenantConnectionsService);
		httpMock = TestBed.inject(HttpTestingController);
		modalService = TestBed.inject(ModalService);
		apiPath = `${ApiVersion.BETA}://${ConfigHubTenantConnectionsService.API_PATH}`;
	});

	it('should be created', () => {
		expect(service).toBeTruthy();
	});

	describe('getConnections', () => {
		const mockApiListResponse: ApiListResponse<ConfigHubTenantConnection> = {
			items: mockConfigHubTenantConnectionsList,
			offset: 0,
			limit: 6,
			count: 2
		};

		it('should list all tenant connections via GET request', done => {
			service.listTenantConnections('me').subscribe((response: ApiListResponse<ConfigHubTenantConnection>) => {
				expect(response).toEqual(mockApiListResponse);
			});
			const queryParam = '?requested-for=me';
			const request = httpMock.expectOne({
				method: 'GET',
				url: apiPath + queryParam
			});
			expect(request.request.method).toEqual('GET');
			request.flush(mockApiListResponse);
			httpMock.verify();
			done();
		});
	});

	describe('createNewTenantConnection', () => {
		it('should create a new tenant connection via POST request', done => {
			const mockParams: CreateTenantConnectionParams = {
				sourcePatClientId: mockConfigHubTenantConnection.sourcePatClientId,
				sourcePatClientSecret: 'mock-secret',
				sourceTenant: mockConfigHubTenantConnection.sourceTenant
			};
			service.createNewTenantConnection(mockParams).subscribe((response: ConfigHubTenantConnection) => {
				expect(response).toEqual(mockConfigHubTenantConnection);
				httpMock.verify();
				done();
			});

			const request = httpMock.expectOne({
				method: 'POST',
				url: apiPath
			});
			request.flush(mockConfigHubTenantConnection);
		});
	});

	describe('listTenantConnectionsBackups', () => {
		it('should list all backups from the selected tenant', done => {
			service.listTenantConnectionsBackups('tenant-id').subscribe((response: ConfigHubBackupJob[]) => {
				expect(response).toEqual([mockConfigHubBackupJob]);
			});

			const request = httpMock.expectOne({
				method: 'GET',
				url: `${ApiVersion.BETA}://${ConfigHubTenantConnectionsService.API_PATH}/tenant-id/${ConfigHubTenantConnectionsService.CONNECTION_BACKUPS_PATH}`
			});
			expect(request.request.method).toEqual('GET');
			request.flush([mockConfigHubBackupJob]);
			httpMock.verify();
			done();
		});
	});

	describe('getTenantConnectionsBackupSummary', () => {
		it('should list all backups from the selected tenant', done => {
			service
				.getTenantConnectionsBackupSummary('tenant-id', 'job-id')
				.subscribe((response: ConfigHubBackupSummary) => {
					expect(response).toEqual(mockConfigHubBackupJobSummary);
				});

			const request = httpMock.expectOne({
				method: 'GET',
				url: `${ApiVersion.BETA}://${ConfigHubTenantConnectionsService.API_PATH}/tenant-id/${ConfigHubTenantConnectionsService.CONNECTION_BACKUPS_PATH}/job-id/summary`
			});
			expect(request.request.method).toEqual('GET');
			request.flush(mockConfigHubBackupJobSummary);
			httpMock.verify();
			done();
		});
	});

	describe(`deleteTenantConnection`, () => {
		it('should delete a new tenant connection via DELETE request', done => {
			service
				.deleteTenantConnection(mockConfigHubTenantConnection.sourceTenant)
				.subscribe((response: Observable<any>) => {
					httpMock.verify();
					done();
				});

			const request = httpMock.expectOne({
				method: 'DELETE',
				url: apiPath + `/${mockConfigHubTenantConnection.sourceTenant}`
			});
			request.flush(mockConfigHubTenantConnection);
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
