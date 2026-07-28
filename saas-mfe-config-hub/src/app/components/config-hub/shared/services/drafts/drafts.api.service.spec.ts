/*
 * Copyright (C) 2023 Acme Technologies, Inc.  All rights reserved.
 */
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';

import { TranslateModule } from '@ngx-translate/core';

import { ModalService } from '@acme-priv/armada-angular/src/acme/angular/components/modal';
import { TranslateService } from '@acme-priv/armada-angular/src/acme/angular/l10n/translation';

import {
	ConfigHubApprovalStatus,
	ConfigHubDraftJob,
	ObjectOperationType,
	mockBaseObjectDeletePayload,
	mockBaseObjectPatchDictionary,
	mockConfigHubDraftJob,
	mockObjectDetailsArray
} from '../../models';
import { ConfigHubDraftsApiService } from './drafts.api.service';

describe('ConfigHubDraftsApiService', () => {
	let service: ConfigHubDraftsApiService;
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
		service = TestBed.inject(ConfigHubDraftsApiService);
		httpMock = TestBed.inject(HttpTestingController);
		apiPath = `${service.API_VERSION}://${service.API_PATH}`;
	});

	it('should be created', () => {
		expect(service).toBeTruthy();
	});

	describe('createDraftJob', () => {
		it('should create a new ConfigHubDraftJob via POST request', done => {
			service
				.createDraftJob(mockConfigHubDraftJob.sourceBackupId)
				.subscribe((createResponse: ConfigHubDraftJob) => {
					expect(createResponse).toEqual(mockConfigHubDraftJob);
					httpMock.verify();
					done();
				});

			const request = httpMock.expectOne({
				method: 'POST',
				url: apiPath
			});
			request.flush(mockConfigHubDraftJob);
		});
	});

	describe('get', () => {
		it('should get a single ConfigHubDraftJob via GET request', done => {
			service.get(mockConfigHubDraftJob.jobId).subscribe((getResponse: ConfigHubDraftJob) => {
				expect(getResponse).toEqual(mockConfigHubDraftJob);
				httpMock.verify();
				done();
			});

			const request = httpMock.expectOne({
				method: 'GET',
				url: `${apiPath}/${mockConfigHubDraftJob.jobId}`
			});
			request.flush(mockConfigHubDraftJob);
		});
	});

	describe('getObjectDetails', () => {
		it('should return a list of objects for a given draft', done => {
			const lastEvaluatedKey = 'last-evaluated-key';
			const limit = 3;
			const objectType = 'ACCESS_PROFILES';
			const operation = ObjectOperationType.REMOVED;
			const nextToken = 'next-token';

			const expectedParams = [
				`lastEvaluatedKey=${lastEvaluatedKey}`,
				`limit=${limit}`,
				`filters=objectType%20eq%20%22${objectType}%22%20and%20operation%20eq%20%22${operation}%22`,
				'sorters=name'
			].join('&');

			const strigifiedObjectDetailsArray = mockObjectDetailsArray.map(objectDetails => ({
				...objectDetails,
				object: JSON.stringify(objectDetails.object)
			}));

			service
				.getObjectDetails(mockConfigHubDraftJob.jobId, limit, lastEvaluatedKey, '', objectType, operation)
				.subscribe(response => {
					expect(response).toEqual({
						items: mockObjectDetailsArray,
						nextToken: nextToken
					});
					httpMock.verify();
					done();
				});

			const request = httpMock.expectOne({
				method: 'GET',
				url: `${apiPath}/${mockConfigHubDraftJob.jobId}/${ConfigHubDraftsApiService.OBJECTS_PATH_SEGMENT}?${expectedParams}`
			});
			request.flush({ items: strigifiedObjectDetailsArray, nextToken: nextToken });
		});
	});

	describe('bulkPatchObjectDetails', () => {
		it('should post an object containing JSON patch operations by objectId', () => {
			service.bulkPatchObjectDetails(mockConfigHubDraftJob.jobId, mockBaseObjectPatchDictionary).subscribe();

			const request = httpMock.expectOne({
				method: 'POST',
				url: `${apiPath}/${mockConfigHubDraftJob.jobId}/${ConfigHubDraftsApiService.OBJECTS_PATH_SEGMENT}`
			});
			expect(request.request.body).toEqual({ draftObjectPatches: mockBaseObjectPatchDictionary });
			request.flush({});
		});
	});

	describe('bulkDeleteObjectDetails', () => {
		it('should make a request to delete objectTypes and objectIds in the bulkDeletePayload', () => {
			service.bulkDeleteObjectDetails(mockConfigHubDraftJob.jobId, mockBaseObjectDeletePayload).subscribe();

			const request = httpMock.expectOne({
				method: 'DELETE',
				url: `${apiPath}/${mockConfigHubDraftJob.jobId}/${ConfigHubDraftsApiService.OBJECTS_PATH_SEGMENT}/${ConfigHubDraftsApiService.BULK_DELETE_PATH_SEGMENT}`
			});
			expect(request.request.body).toEqual(mockBaseObjectDeletePayload);
			request.flush({});
		});
	});

	describe('validateObjectDetails', () => {
		it('should make a request to validate the draft', () => {
			service.validateObjectDetails(mockConfigHubDraftJob.jobId).subscribe();

			const request = httpMock.expectOne({
				method: 'POST',
				url: `${apiPath}/${mockConfigHubDraftJob.jobId}/${ConfigHubDraftsApiService.VALIDATE_PATH_SEGMENT}`
			});
			request.flush({});
		});
	});

	describe('getHistoricalDraft', () => {
		it('should make a GET request with the correct URL and query parameters', () => {
			const mockDraftId = mockConfigHubDraftJob.jobId;
			const mockDeployJobId = 'deployId';
			const expectedUrl = `${apiPath}/${ConfigHubDraftsApiService.HISTORICAL_PATH_SEGMENT}/${mockDeployJobId}`;

			service.getHistoricalDraft(mockDraftId, mockDeployJobId).subscribe();

			const request = httpMock.expectOne(
				req => req.method === 'GET' && req.url === expectedUrl && req.params.get('draftJobId') === mockDraftId
			);
			request.flush({});
		});
	});

	describe('postAppvoral', () => {
		it('should make a POST request with the correct URL and body', () => {
			const mockDraftId = mockConfigHubDraftJob.jobId;
			const mockComment = 'someComment';
			const expectedUrl = `${apiPath}/${mockDraftId}/${ConfigHubDraftsApiService.APPROVALS}`;
			service
				.changeApprovalStatus(mockDraftId, ConfigHubApprovalStatus.PENDING_FOR_APPROVAL, mockComment)
				.subscribe();

			const request = httpMock.expectOne({
				method: 'POST',
				url: expectedUrl
			});

			expect(request.request.body).toEqual({ approvalStatus: 'PENDING_FOR_APPROVAL', comments: mockComment });
			request.flush({});
		});
	});
});
