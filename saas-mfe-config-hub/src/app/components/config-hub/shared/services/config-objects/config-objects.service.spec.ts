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

import { ApiVersion } from '@acme-priv/ui-common/src/acme/angular/api';

import { ConfigHubBackupObjectType, mockConfigHubObjectTypes } from '../../models';
import { ConfigHubConfigObjectsService } from './config-objects.service';

describe('ConfigObjectsService', () => {
	let service: ConfigHubConfigObjectsService;
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
		service = TestBed.inject(ConfigHubConfigObjectsService);
		httpMock = TestBed.inject(HttpTestingController);
		modalService = TestBed.inject(ModalService);
		apiPath = `${ApiVersion.BETA}://${ConfigHubConfigObjectsService.API_PATH}`;
	});

	it('should be created', () => {
		expect(service).toBeTruthy();
	});

	describe('getObjectTypes', () => {
		it('should list available configuration object types for a backup via GET request', done => {
			service.getObjectTypes().subscribe((response: ConfigHubBackupObjectType[]) => {
				expect(response).toEqual(mockConfigHubObjectTypes);
				httpMock.verify();
				done();
			});

			const request = httpMock.expectOne({
				method: 'GET',
				url: apiPath
			});
			request.flush(mockConfigHubObjectTypes);
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
