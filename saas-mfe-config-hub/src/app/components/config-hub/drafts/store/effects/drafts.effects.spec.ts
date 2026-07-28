/*
 * Copyright (C) 2023 Acme Technologies, Inc.  All rights reserved.
 */
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';

import { EffectsModule } from '@ngrx/effects';
import { provideMockActions } from '@ngrx/effects/testing';
import { createSelector } from '@ngrx/store';
import { provideMockStore } from '@ngrx/store/testing';
import { ReplaySubject, of, throwError } from 'rxjs';

import {
	TranslateModule,
	TranslateService
} from '@acme-priv/armada-angular/src/acme/angular/l10n/translation';

import { MemoizedAtomicStateSelectors } from '@acme-priv/ui-common/src/acme/angular/util';

import { draftsApiActions, draftsPageActions } from '../actions';
import { fromDraftsPage } from '../selectors';
import { DraftsPageEffects } from './drafts.effects';

import {
	ConfigHubApprovalStatus,
	ObjectDetails,
	ObjectOperationType,
	mockBaseObjectDeletePayload,
	mockBaseObjectPatchDictionary,
	mockConfigHubDeployJob,
	mockConfigHubDeployResults,
	mockConfigHubDraftJob,
	mockConfigHubDraftJobSummary,
	mockLiveObjectDetails,
	mockObjectDetailsArray,
	mockScheduleJobResponse
} from '../../../shared/models';
import {
	ConfigHubAdvancedSettingsApiService,
	ConfigHubBackupsApiService,
	ConfigHubDeployApiService,
	ConfigHubDraftsApiService,
	ConfigHubScheduledJobsApiService
} from '../../../shared/services';
import { ObjectDetailsSearchQuery, draftsPageInitialState } from '../states';

describe('DraftsPageEffects', () => {
	let actions$: ReplaySubject<any>;
	let draftsPageEffects: DraftsPageEffects;
	let configHubDraftsApiService: ConfigHubDraftsApiService;
	let configHubDeployApiService: ConfigHubDeployApiService;
	let configHubBackupsApiService: ConfigHubBackupsApiService;
	let configHubAdvancedSettingsApiService: ConfigHubAdvancedSettingsApiService;
	let configHubScheduledJobsApiService: ConfigHubScheduledJobsApiService;
	let requestedAmount = 5;

	const errorMessage = 'Error!';
	const objectType = 'AN_OBJECT_TYPE';
	const objectOperationType = ObjectOperationType.ADDED;
	const pageSize = 25;

	const mockApiListResponse = {
		items: mockObjectDetailsArray,
		offset: 0,
		limit: 6,
		count: 12
	};

	beforeEach(() => {
		// Because of the factory selectors, we need to spy on these *before* compilingComponents.
		jest.spyOn(fromDraftsPage, 'selectDraftId').mockReturnValue(mockConfigHubDraftJobSummary.jobId);
		jest.spyOn(fromDraftsPage, 'selectSummaryIsInit').mockReturnValue(true);
		jest.spyOn(fromDraftsPage, 'selectPageSize').mockImplementation(
			() =>
				createSelector(
					() => null,
					() => pageSize
				) as any
		);

		jest.spyOn(fromDraftsPage, 'selectFinalPage').mockImplementation(
			() =>
				createSelector(
					() => null,
					() => null
				) as any
		);

		jest.spyOn(fromDraftsPage, 'getObjectDetailsSelectors').mockReturnValue({
			selectIsInit: () => true
		} as unknown as MemoizedAtomicStateSelectors<ObjectDetails, object>);

		jest.spyOn(fromDraftsPage, 'selectObjectDetailsPage').mockImplementation(
			() =>
				createSelector(
					() => null,
					() => null,
					() => null,
					() => mockObjectDetailsArray
				) as any
		);

		jest.spyOn(fromDraftsPage, 'selectSearchQuery').mockImplementation(
			() =>
				createSelector(
					() => null,
					() => ({ limit: 0, lastEvaluatedKey: 'last-evaluated-key' }) as ObjectDetailsSearchQuery
				) as any
		);

		jest.spyOn(fromDraftsPage, 'selectBaseObjectPatchDictionary').mockImplementation(
			() =>
				createSelector(
					() => null,
					() => mockBaseObjectPatchDictionary
				) as any
		);

		jest.spyOn(fromDraftsPage, 'selectHasObjectsToPatch').mockImplementation(
			() =>
				createSelector(
					() => null,
					() => true
				) as any
		);

		jest.spyOn(fromDraftsPage, 'selectBaseObjectDeletePayload').mockImplementation(
			() =>
				createSelector(
					() => null,
					() => null,
					() => mockBaseObjectDeletePayload
				) as any
		);

		jest.spyOn(fromDraftsPage, 'selectHasObjectsToDelete').mockImplementation(
			() =>
				createSelector(
					() => null,
					() => true
				) as any
		);

		jest.spyOn(fromDraftsPage, 'selectSummary').mockImplementation(
			() =>
				createSelector(
					() => null,
					() => mockConfigHubDraftJobSummary
				) as any
		);

		jest.spyOn(fromDraftsPage, 'selectSelectedObjectType').mockReturnValue(objectType);

		jest.spyOn(fromDraftsPage, 'selectSelectedOperationType').mockImplementation(
			() =>
				createSelector(
					() => null,
					() => ObjectOperationType.CHANGED
				) as any
		);

		TestBed.configureTestingModule({
			imports: [
				RouterTestingModule,
				HttpClientTestingModule,
				EffectsModule.forRoot([DraftsPageEffects]),
				TranslateModule.forRoot()
			],
			providers: [
				TranslateService,
				provideMockStore({ initialState: draftsPageInitialState }),
				provideMockActions(() => actions$),
				DraftsPageEffects,
				ConfigHubDraftsApiService
			]
		}).compileComponents();

		draftsPageEffects = TestBed.inject(DraftsPageEffects);
		configHubDraftsApiService = TestBed.inject(ConfigHubDraftsApiService);
		configHubDeployApiService = TestBed.inject(ConfigHubDeployApiService);
		configHubBackupsApiService = TestBed.inject(ConfigHubBackupsApiService);
		configHubAdvancedSettingsApiService = TestBed.inject(ConfigHubAdvancedSettingsApiService);
		configHubScheduledJobsApiService = TestBed.inject(ConfigHubScheduledJobsApiService);

		actions$ = new ReplaySubject(1);
		requestedAmount = 5;
	});

	describe('shouldInitLoadDraftSummary$', () => {
		it('should dispatch summaryPageLoadSummary if the summary request state is INIT', done => {
			actions$.next(draftsPageActions.summaryPageOpen({ draftId: mockConfigHubDraftJobSummary.jobId }));
			draftsPageEffects.shouldInitLoadDraftSummary$.subscribe(action => {
				expect(action).toEqual(
					draftsPageActions.summaryPageLoadSummary({ draftId: mockConfigHubDraftJobSummary.jobId })
				);
				done();
			});
		});
	});

	describe('loadDraftSummary$', () => {
		it('should dispatch draftSummaryLoadSuccess upon successful loading of draftSummary', done => {
			jest.spyOn(configHubDraftsApiService, 'getSummary').mockReturnValue(of(mockConfigHubDraftJobSummary));
			jest.spyOn(configHubDraftsApiService, 'getDraftDetails').mockReturnValue(of(mockConfigHubDraftJobSummary));
			jest.spyOn(configHubAdvancedSettingsApiService, 'getIsApprovalsSettingEnabled').mockReturnValue(of(true));
			jest.spyOn(configHubAdvancedSettingsApiService, 'getIsApprovalsSettingEnabled').mockReturnValue(of(false));

			actions$.next(draftsPageActions.summaryPageLoadSummary({ draftId: mockConfigHubDraftJobSummary.jobId }));
			draftsPageEffects.loadDraftSummary$.subscribe(action => {
				expect(action).toEqual(
					draftsApiActions.draftSummaryLoadSuccess({
						draftSummary: mockConfigHubDraftJobSummary,
						approvalsEnabled: false
					})
				);
				done();
			});
		});

		it('should dispatch draftSummaryLoadFailure upon failure loading draftSummary', done => {
			jest.spyOn(configHubDraftsApiService, 'getSummary').mockReturnValue(throwError(() => errorMessage));

			actions$.next(draftsPageActions.summaryPageLoadSummary({ draftId: mockConfigHubDraftJobSummary.jobId }));
			draftsPageEffects.loadDraftSummary$.subscribe(action => {
				expect(action).toEqual(
					draftsApiActions.draftSummaryLoadFailure({
						errorMessage: errorMessage
					})
				);
				done();
			});
		});
	});

	describe('shouldInitLoadDraftObjects$', () => {
		it('should dispatch objectListLoadMore if the object type request state is INIT', done => {
			actions$.next(draftsPageActions.objectListOpen({ objectType, objectOperationType }));
			draftsPageEffects.shouldInitLoadDraftObjects$.subscribe(action => {
				expect(action).toEqual(
					draftsPageActions.objectListLoadMore({ objectType, objectOperationType, requestedAmount: pageSize })
				);
				done();
			});
		});
	});

	describe('shouldLoadMoreDraftObjects$', () => {
		it('should dispatch objectListLoadMore if the number of objectDetails is less than the page size', done => {
			requestedAmount = pageSize - mockObjectDetailsArray.length;
			actions$.next(
				draftsPageActions.objectListPageNumberChange({ objectType, objectOperationType, pageNumber: 2 })
			);
			draftsPageEffects.shouldLoadMoreDraftObjects$.subscribe(action => {
				expect(action).toEqual(
					draftsPageActions.objectListLoadMore({ objectType, objectOperationType, requestedAmount })
				);
				done();
			});
		});
	});

	describe('loadDraftObjects$', () => {
		it('should dispatch objectDetailsLoadSuccess upon successful loading of objectDetails', done => {
			jest.spyOn(configHubDraftsApiService, 'getObjectDetails').mockReturnValue(of(mockApiListResponse));

			actions$.next(draftsPageActions.objectListLoadMore({ objectType, objectOperationType, requestedAmount }));
			draftsPageEffects.loadDraftObjects$.subscribe(action => {
				expect(action).toEqual(
					draftsApiActions.objectDetailsLoadSuccess({
						objectType,
						objectOperationType,
						objectDetailsListResponse: mockApiListResponse
					})
				);
				done();
			});
		});

		it('should dispatch objectDetailsLoadFailure upon failure loading objectDetails', done => {
			jest.spyOn(configHubDraftsApiService, 'getObjectDetails').mockReturnValue(throwError(() => errorMessage));

			actions$.next(draftsPageActions.objectListLoadMore({ objectType, objectOperationType, requestedAmount }));
			draftsPageEffects.loadDraftObjects$.subscribe(action => {
				expect(action).toEqual(
					draftsApiActions.objectDetailsLoadFailure({
						objectType,
						objectOperationType,
						errorMessage: errorMessage
					})
				);
				done();
			});
		});
	});

	describe('initBulkPatch$', () => {
		it('should dispatch bulkPatchSuccess upon successful bulk patch', done => {
			jest.spyOn(configHubDraftsApiService, 'bulkPatchObjectDetails').mockReturnValue(of({}));

			actions$.next(draftsPageActions.saveAllDraftChanges());
			draftsPageEffects.initBulkPatch$.subscribe(action => {
				expect(action).toEqual(draftsApiActions.bulkPatchSuccess());
				done();
			});
		});

		it('should dispatch bulkPatchFailure upon failure bulk patch', done => {
			jest.spyOn(configHubDraftsApiService, 'bulkPatchObjectDetails').mockReturnValue(
				throwError(() => errorMessage)
			);

			actions$.next(draftsPageActions.saveAllDraftChanges());
			draftsPageEffects.initBulkPatch$.subscribe(action => {
				expect(action).toEqual(
					draftsApiActions.bulkPatchFailure({
						errorMessage: errorMessage
					})
				);
				done();
			});
		});
	});

	describe('initBulkDelete$', () => {
		it('should dispatch bulkDeleteSuccess upon successful bulk patch', done => {
			jest.spyOn(configHubDraftsApiService, 'bulkDeleteObjectDetails').mockReturnValue(of({}));

			actions$.next(draftsApiActions.bulkPatchSkipped());
			draftsPageEffects.initBulkDelete$.subscribe(action => {
				expect(action).toEqual(draftsApiActions.bulkDeleteSuccess());
				done();
			});
		});

		it('should dispatch bulkDeleteFailure upon failure bulk patch', done => {
			jest.spyOn(configHubDraftsApiService, 'bulkDeleteObjectDetails').mockReturnValue(
				throwError(() => errorMessage)
			);

			actions$.next(draftsApiActions.bulkPatchSkipped());
			draftsPageEffects.initBulkDelete$.subscribe(action => {
				expect(action).toEqual(
					draftsApiActions.bulkDeleteFailure({
						errorMessage: errorMessage
					})
				);
				done();
			});
		});
	});

	describe('initValidate$', () => {
		it('should dispatch initValidateSuccess upon successful validation', done => {
			jest.spyOn(configHubDraftsApiService, 'validateObjectDetails').mockReturnValue(of({}));

			actions$.next(draftsApiActions.bulkDeleteSkipped());
			draftsPageEffects.initValidate$.subscribe(action => {
				expect(action).toEqual(
					draftsApiActions.initValidateSuccess({ draftId: mockConfigHubDraftJobSummary.jobId })
				);
				done();
			});
		});

		it('should dispatch initValidateFailure upon validation failure', done => {
			jest.spyOn(configHubDraftsApiService, 'validateObjectDetails').mockReturnValue(
				throwError(() => errorMessage)
			);

			actions$.next(draftsApiActions.bulkDeleteSkipped());
			draftsPageEffects.initValidate$.subscribe(action => {
				expect(action).toEqual(
					draftsApiActions.initValidateFailure({
						errorMessage: errorMessage
					})
				);
				done();
			});
		});
	});

	describe('watchValidateJob$', () => {
		it('should dispatch validateSuccess upon successful deploy job', done => {
			jest.spyOn(configHubDraftsApiService, 'watchInProgressJob').mockReturnValue(of(mockConfigHubDraftJob));

			actions$.next(draftsApiActions.initValidateSuccess({ draftId: mockConfigHubDraftJob.jobId }));
			draftsPageEffects.watchValidateJob$.subscribe(action => {
				expect(action).toEqual(draftsApiActions.validateSuccess({ draftId: mockConfigHubDraftJob.jobId }));
				done();
			});
		});

		it('should dispatch validateFailure upon deploy job failure', done => {
			jest.spyOn(configHubDraftsApiService, 'watchInProgressJob').mockReturnValue(throwError(() => errorMessage));

			actions$.next(draftsApiActions.initValidateSuccess({ draftId: mockConfigHubDraftJob.jobId }));
			draftsPageEffects.watchValidateJob$.subscribe(action => {
				expect(action).toEqual(
					draftsApiActions.validateFailure({
						errorMessage: errorMessage
					})
				);
				done();
			});
		});
	});

	describe('initDeployDraft$', () => {
		it('should dispatch createDeploySuccess upon successful deploy job creation', done => {
			jest.spyOn(configHubDeployApiService, 'createDeployJob').mockReturnValue(of(mockConfigHubDeployJob));

			actions$.next(draftsPageActions.deployDraft());
			draftsPageEffects.initDeployDraft$.subscribe(action => {
				expect(action).toEqual(draftsApiActions.createDeploySuccess({ deployJob: mockConfigHubDeployJob }));
				done();
			});
		});

		it('should dispatch createDeployFailure upon deploy job creation failure', done => {
			jest.spyOn(configHubDeployApiService, 'createDeployJob').mockReturnValue(throwError(() => errorMessage));

			actions$.next(draftsPageActions.deployDraft());
			draftsPageEffects.initDeployDraft$.subscribe(action => {
				expect(action).toEqual(
					draftsApiActions.createDeployFailure({
						errorMessage: errorMessage
					})
				);
				done();
			});
		});
	});

	describe('initScheduleDeployDraft$', () => {
		it('should dispatch scheduleDeploySuccess upon successful scheduled job creation', done => {
			jest.spyOn(configHubScheduledJobsApiService, 'createScheduledJob').mockReturnValue(
				of(mockScheduleJobResponse)
			);

			actions$.next(draftsPageActions.scheduleDeployDraft({ startTime: '12-01-01T13:00:00Z00.00' }));
			draftsPageEffects.initScheduleDeployDraft$.subscribe(action => {
				expect(action).toEqual(
					draftsApiActions.scheduleDeploySuccess({ scheduledJob: mockScheduleJobResponse })
				);
				done();
			});
		});

		it('should dispatch scheduleDeployFailure upon scheduled job creation failure', done => {
			jest.spyOn(configHubScheduledJobsApiService, 'createScheduledJob').mockReturnValue(
				throwError(() => errorMessage)
			);

			actions$.next(draftsPageActions.scheduleDeployDraft({ startTime: '12-01-01T13:00:00Z00.00' }));
			draftsPageEffects.initScheduleDeployDraft$.subscribe(action => {
				expect(action).toEqual(
					draftsApiActions.scheduleDeployFailure({
						errorMessage: errorMessage
					})
				);
				done();
			});
		});
	});

	describe('watchDeployJob$', () => {
		it('should dispatch deploySuccess upon successful deploy job', done => {
			jest.spyOn(configHubDeployApiService, 'watchInProgressJob').mockReturnValue(of(mockConfigHubDeployJob));

			actions$.next(draftsApiActions.createDeploySuccess({ deployJob: mockConfigHubDeployJob }));
			draftsPageEffects.watchDeployJob$.subscribe(action => {
				expect(action).toEqual(draftsApiActions.deploySuccess({ deployJob: mockConfigHubDeployJob }));
				done();
			});
		});

		it('should dispatch deployFailure upon deploy job failure', done => {
			jest.spyOn(configHubDeployApiService, 'watchInProgressJob').mockReturnValue(throwError(() => errorMessage));

			actions$.next(draftsApiActions.createDeploySuccess({ deployJob: mockConfigHubDeployJob }));
			draftsPageEffects.watchDeployJob$.subscribe(action => {
				expect(action).toEqual(
					draftsApiActions.deployFailure({
						errorMessage: errorMessage
					})
				);
				done();
			});
		});
	});

	describe('loadDeployResults$', () => {
		it('should dispatch loadDeployResultsSuccess upon successful load of deploy results', done => {
			jest.spyOn(configHubDeployApiService, 'getDownload').mockReturnValue(of(mockConfigHubDeployResults));

			actions$.next(draftsApiActions.deploySuccess({ deployJob: mockConfigHubDeployJob }));
			draftsPageEffects.loadDeployResults$.subscribe(action => {
				expect(action).toEqual(
					draftsApiActions.loadDeployResultsSuccess({ deployResults: mockConfigHubDeployResults })
				);
				done();
			});
		});

		it('should dispatch loadDeployResultsFailure upon load of deploy results failure', done => {
			jest.spyOn(configHubDeployApiService, 'getDownload').mockReturnValue(throwError(() => errorMessage));

			actions$.next(draftsApiActions.deploySuccess({ deployJob: mockConfigHubDeployJob }));
			draftsPageEffects.loadDeployResults$.subscribe(action => {
				expect(action).toEqual(
					draftsApiActions.loadDeployResultsFailure({
						errorMessage: errorMessage
					})
				);
				done();
			});
		});
	});

	describe('loadObjectConfiguration$', () => {
		it('should dispatch loadObjectLiveConfigurationSuccess upon successful load of object live configuration', done => {
			jest.spyOn(configHubBackupsApiService, 'getObjectLiveConfiguration').mockReturnValue(
				of(mockLiveObjectDetails)
			);

			actions$.next(draftsPageActions.viewObjectDetails({ objectId: mockLiveObjectDetails.objectId }));
			draftsPageEffects.loadObjectConfiguration$.subscribe(action => {
				expect(action).toEqual(
					draftsApiActions.loadObjectLiveConfigurationSuccess({
						objectConfiguration: mockLiveObjectDetails,
						objectId: mockLiveObjectDetails.objectId,
						objectType: objectType,
						operationType: ObjectOperationType.CHANGED
					})
				);
				done();
			});
		});

		it('should dispatch loadObjectLiveConfigurationFailure upon failure when loading the object live configuration', done => {
			jest.spyOn(configHubBackupsApiService, 'getObjectLiveConfiguration').mockReturnValue(
				throwError(() => errorMessage)
			);

			actions$.next(draftsPageActions.viewObjectDetails({ objectId: mockLiveObjectDetails.objectId }));
			draftsPageEffects.loadObjectConfiguration$.subscribe(action => {
				expect(action).toEqual(
					draftsApiActions.loadObjectLiveConfigurationFailure({
						errorMessage: errorMessage,
						objectId: mockLiveObjectDetails.objectId,
						objectType: objectType,
						operationType: ObjectOperationType.CHANGED
					})
				);
				done();
			});
		});
	});

	describe('initUpdateApprovalStatus$', () => {
		it('should dispatch updateApprovalStatusSuccess upon successfull approval request change', done => {
			jest.spyOn(configHubDraftsApiService, 'changeApprovalStatus').mockReturnValue(
				of(mockConfigHubDraftJobSummary)
			);
			const mockComment = 'some comment';
			actions$.next(
				draftsApiActions.updateApprovalStatus({
					approvalStatus: ConfigHubApprovalStatus.PENDING_FOR_APPROVAL,
					comments: mockComment
				})
			);
			draftsPageEffects.initUpdateApprovalStatus$.subscribe(action => {
				expect(action).toEqual(
					draftsApiActions.updateApprovalStatusSuccess({
						approvalStatus: ConfigHubApprovalStatus.PENDING_FOR_APPROVAL,
						approvalComment: []
					})
				);
				done();
			});
		});

		it('should dispatch updateApprovalStatusFailure upon a failed approval request change', done => {
			jest.spyOn(configHubDraftsApiService, 'changeApprovalStatus').mockReturnValue(
				throwError(() => errorMessage)
			);
			const mockComment = 'some comment';
			actions$.next(
				draftsApiActions.updateApprovalStatus({
					approvalStatus: ConfigHubApprovalStatus.PENDING_FOR_APPROVAL,
					comments: mockComment
				})
			);
			draftsPageEffects.initUpdateApprovalStatus$.subscribe(action => {
				expect(action).toEqual(
					draftsApiActions.updateApprovalStatusFailure({
						errorMessage: errorMessage
					})
				);
				done();
			});
		});
	});
});
