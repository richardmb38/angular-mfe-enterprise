/*
 * Copyright (C) 2023 Acme Technologies, Inc.  All rights reserved.
 */
import { Injectable } from '@angular/core';

import { Actions, concatLatestFrom, createEffect, ofType } from '@ngrx/effects';
import { Store } from '@ngrx/store';
import { forkJoin, of } from 'rxjs';
import { catchError, exhaustMap, filter, map, switchMap, withLatestFrom } from 'rxjs/operators';

import { FeatureFlagService } from '@acme-priv/ui-common/src/acme/angular/util';

import { draftsApiActions, draftsPageActions } from '../actions';
import { fromDraftsPage } from '../selectors';

import { ConfigHubJobType, JOB_STATUS_POLL_PERIOD, ObjectOperationType } from 'app/components/config-hub/shared/models';
import {
	ConfigHubBackupsApiService,
	ConfigHubDeployApiService,
	ConfigHubDraftsApiService
} from 'app/components/config-hub/shared/services';
import { ConfigHubAdvancedSettingsApiService } from 'app/components/config-hub/shared/services/advanced-settings/advanced-settings.service';
import { ConfigHubScheduledJobsApiService } from 'app/components/config-hub/shared/services/scheduled-jobs/scheduled-jobs.api.service';
import { isConfigHubJobDone } from 'app/components/config-hub/shared/utils';
import { FeatureFlags } from 'app/featureflags.enum';

@Injectable()
export class DraftsPageEffects {
	/**
	 * When the object list is open or the selected operation type changes,
	 * determines whether we should attempt to do an initial load of draft objects.
	 */
	shouldInitLoadDraftSummary$ = createEffect(() =>
		this.actions$.pipe(
			ofType(draftsPageActions.summaryPageOpen, draftsApiActions.validateSuccess),
			withLatestFrom(this.store.select(fromDraftsPage.selectSummaryIsInit)),
			filter(([{}, isInit]) => isInit),
			switchMap(([{ draftId }]) => of(draftsPageActions.summaryPageLoadSummary({ draftId })))
		)
	);

	/**
	 * Loads the Draft Summary and dispatches relevant actions.
	 */
	loadDraftSummary$ = createEffect(() =>
		this.actions$.pipe(
			ofType(draftsPageActions.summaryPageLoadSummary),
			exhaustMap(({ draftId }) =>
				this.configHubDraftsApiService.getSummary(draftId).pipe(
					switchMap(summary => {
						const requests = forkJoin([
							this.configHubDraftsApiService.getDraftDetails(draftId),
							this.featureFlagService.isEnabled(FeatureFlags.PLT_UI_ADMIRAL_CONFIG_HUB_DRAFTS_APPROVAL)
								? this.configHubAdvancedSettingsApiService.getIsApprovalsSettingEnabled()
								: of(false)
						]);
						return requests.pipe(
							map(([{ approvalStatus, approvalComment }, approvalsEnabled]) => ({
								draftSummary: {
									...summary,
									approvalStatus,
									approvalComment
								},
								approvalsEnabled
							}))
						);
					}),
					map(({ draftSummary, approvalsEnabled }) =>
						draftsApiActions.draftSummaryLoadSuccess({ draftSummary, approvalsEnabled })
					),
					catchError(errorMessage => of(draftsApiActions.draftSummaryLoadFailure({ errorMessage })))
				)
			)
		)
	);

	/**
	 * When the object list is open or the selected operation type changes,
	 * determines whether we should attempt to do an initial load of draft objects.
	 */
	shouldInitLoadDraftObjects$ = createEffect(() =>
		this.actions$.pipe(
			ofType(draftsPageActions.objectListOpen, draftsPageActions.operationTypeChange),
			concatLatestFrom(() => [
				this.store.select(fromDraftsPage.getObjectDetailsSelectors().selectIsInit),
				this.store.select(fromDraftsPage.selectPageSize())
			]),
			filter(([{}, isInit]) => isInit),
			switchMap(([{ objectType, objectOperationType }, , pageSize]) =>
				of(draftsPageActions.objectListLoadMore({ objectType, objectOperationType, requestedAmount: pageSize }))
			)
		)
	);

	/**
	 * When the page number, page size, or search term changes,
	 * determines whether we should attempt to load more draft objects.
	 */
	shouldLoadMoreDraftObjects$ = createEffect(() =>
		this.actions$.pipe(
			ofType(
				draftsPageActions.objectListPageNumberChange,
				draftsPageActions.objectListPageSizeChange,
				draftsPageActions.objectListSearchTermChange
			),
			concatLatestFrom(() => [
				this.store.select(fromDraftsPage.selectObjectDetailsPage()),
				this.store.select(fromDraftsPage.selectPageSize()),
				this.store.select(fromDraftsPage.selectFinalPage())
			]),
			filter(([, objectDetails, pageSize, finalPage]) => !finalPage && objectDetails.length < pageSize),
			switchMap(([{ objectType, objectOperationType }, objectDetails, pageSize]) =>
				of(
					draftsPageActions.objectListLoadMore({
						objectType,
						objectOperationType,
						requestedAmount: objectDetails.length < pageSize ? pageSize - objectDetails.length : pageSize
					})
				)
			)
		)
	);

	/**
	 * Loads objects for a given object type and dispatches relevant actions.
	 */
	loadDraftObjects$ = createEffect(() =>
		this.actions$.pipe(
			ofType(draftsPageActions.objectListLoadMore),
			concatLatestFrom(() => [
				this.store.select(fromDraftsPage.selectDraftId),
				this.store.select(fromDraftsPage.selectSearchQuery()),
				this.store.select(fromDraftsPage.selectObjectTypeShowErrorState)
			]),
			switchMap(([{ objectType, objectOperationType, requestedAmount }, draftId, searchQuery, showErrors]) =>
				this.configHubDraftsApiService
					.getObjectDetails(
						draftId,
						requestedAmount ?? searchQuery?.limit,
						searchQuery?.lastEvaluatedKey,
						searchQuery?.query,
						objectType,
						objectOperationType,
						showErrors
					)
					.pipe(
						map(objectDetailsListResponse =>
							draftsApiActions.objectDetailsLoadSuccess({
								objectType,
								objectOperationType,
								objectDetailsListResponse
							})
						),
						catchError(errorMessage =>
							of(
								draftsApiActions.objectDetailsLoadFailure({
									objectType,
									objectOperationType,
									errorMessage
								})
							)
						)
					)
			)
		)
	);

	/**
	 * Saving a Draft
	 *
	 * There are three calls to save draft changes:
	 * 	1. Call bulk patch API with patches for modified objects
	 *  2. Call bulk delete API with objectIds and/or objectTypes to be deleted
	 *  3. Call validate draft changes API
	 *
	 * initBulkPatch$, initBulkDelete$, and initValidate$ are called in sequence to reflect that process
	 */

	/**
	 * Initiates the bulk patch API call if there are patches to be made, otherwise this step will be skipped.
	 */
	initBulkPatch$ = createEffect(() =>
		this.actions$.pipe(
			ofType(draftsPageActions.saveAllDraftChanges),
			concatLatestFrom(() => [
				this.store.select(fromDraftsPage.selectDraftId),
				this.store.select(fromDraftsPage.selectHasObjectsToPatch),
				this.store.select(fromDraftsPage.selectBaseObjectPatchDictionary)
			]),
			switchMap(([, draftId, hasObjectsToPatch, baseObjectPatchDictionary]) =>
				hasObjectsToPatch
					? this.configHubDraftsApiService.bulkPatchObjectDetails(draftId, baseObjectPatchDictionary).pipe(
							map(() => draftsApiActions.bulkPatchSuccess()),
							catchError(errorMessage => of(draftsApiActions.bulkPatchFailure({ errorMessage })))
						)
					: of(draftsApiActions.bulkPatchSkipped())
			)
		)
	);

	/**
	 * Initiates the bulk delete API call if there are deletes to be made, otherwise this step will be skipped.
	 */
	initBulkDelete$ = createEffect(() =>
		this.actions$.pipe(
			ofType(draftsApiActions.bulkPatchSkipped, draftsApiActions.bulkPatchSuccess),
			concatLatestFrom(() => [
				this.store.select(fromDraftsPage.selectDraftId),
				this.store.select(fromDraftsPage.selectHasObjectsToDelete),
				this.store.select(fromDraftsPage.selectBaseObjectDeletePayload)
			]),
			switchMap(([, draftId, hasObjectsToDelete, baseObjectDeletePayload]) =>
				hasObjectsToDelete
					? this.configHubDraftsApiService.bulkDeleteObjectDetails(draftId, baseObjectDeletePayload).pipe(
							map(() => draftsApiActions.bulkDeleteSuccess()),
							catchError(errorMessage => of(draftsApiActions.bulkDeleteFailure({ errorMessage })))
						)
					: of(draftsApiActions.bulkDeleteSkipped())
			)
		)
	);

	/**
	 * Initiates the validate draft API call.
	 */
	initValidate$ = createEffect(() =>
		this.actions$.pipe(
			ofType(draftsApiActions.bulkDeleteSkipped, draftsApiActions.bulkDeleteSuccess),
			concatLatestFrom(() => this.store.select(fromDraftsPage.selectDraftId)),
			switchMap(([, draftId]) =>
				this.configHubDraftsApiService.validateObjectDetails(draftId).pipe(
					map(() => draftsApiActions.initValidateSuccess({ draftId })),
					catchError(errorMessage => of(draftsApiActions.initValidateFailure({ errorMessage })))
				)
			)
		)
	);

	/**
	 * Monitors an in-progress validation job periodically until it completes.
	 */
	watchValidateJob$ = createEffect(() =>
		this.actions$.pipe(
			ofType(draftsApiActions.initValidateSuccess),
			switchMap(({ draftId }) =>
				this.configHubDraftsApiService.watchInProgressJob(draftId, JOB_STATUS_POLL_PERIOD).pipe(
					filter(({ status }) => isConfigHubJobDone(status)),
					map(() => draftsApiActions.validateSuccess({ draftId })),
					catchError(errorMessage => of(draftsApiActions.validateFailure({ errorMessage })))
				)
			)
		)
	);

	/**
	 * updates the approval status value when the there is a successful approval change request.
	 */
	initUpdateApprovalStatus$ = createEffect(() =>
		this.actions$.pipe(
			ofType(draftsApiActions.updateApprovalStatus),
			concatLatestFrom(() => [this.store.select(fromDraftsPage.selectDraftId)]),
			switchMap(([{ approvalStatus, comments }, draftId]) =>
				this.configHubDraftsApiService.changeApprovalStatus(draftId, approvalStatus, comments).pipe(
					map(response =>
						draftsApiActions.updateApprovalStatusSuccess({
							approvalStatus,
							approvalComment: response.approvalComment
						})
					),
					catchError(errorMessage => of(draftsApiActions.updateApprovalStatusFailure({ errorMessage })))
				)
			)
		)
	);

	/**
	 * Initiates a draft deployment job.
	 */
	initDeployDraft$ = createEffect(() =>
		this.actions$.pipe(
			ofType(draftsPageActions.deployDraft),
			concatLatestFrom(() => this.store.select(fromDraftsPage.selectDraftId)),
			switchMap(([, draftId]) =>
				this.configHubDeployApiService.createDeployJob(draftId).pipe(
					map(deployJob => draftsApiActions.createDeploySuccess({ deployJob })),
					catchError(errorMessage => of(draftsApiActions.createDeployFailure({ errorMessage })))
				)
			)
		)
	);

	/**
	 * Schedules a draft deployment job.
	 */
	initScheduleDeployDraft$ = createEffect(() =>
		this.actions$.pipe(
			ofType(draftsPageActions.scheduleDeployDraft),
			concatLatestFrom(() => [
				this.store.select(fromDraftsPage.selectDraftId),
				this.store.select(fromDraftsPage.selectDraftName)
			]),
			switchMap(([{ startTime }, draftId]) =>
				this.configHubScheduledJobsApiService
					.createScheduledJob({
						jobType: ConfigHubJobType.DEPLOY,
						startTime,
						content: {
							draftId
						}
					})
					.pipe(
						map(scheduledJob => draftsApiActions.scheduleDeploySuccess({ scheduledJob })),
						catchError(errorMessage => of(draftsApiActions.scheduleDeployFailure({ errorMessage })))
					)
			)
		)
	);

	/**
	 * Monitors an in-progress deployment job periodically until it completes.
	 */
	watchDeployJob$ = createEffect(() =>
		this.actions$.pipe(
			ofType(draftsApiActions.createDeploySuccess),
			switchMap(({ deployJob: { jobId } }) =>
				this.configHubDeployApiService.watchInProgressJob(jobId, JOB_STATUS_POLL_PERIOD).pipe(
					filter(({ status }) => isConfigHubJobDone(status)),
					map(deployJob => draftsApiActions.deploySuccess({ deployJob })),
					catchError(errorMessage => of(draftsApiActions.deployFailure({ errorMessage })))
				)
			)
		)
	);

	/**
	 * Retrieves deployment results for a completed deployment job.
	 */
	loadDeployResults$ = createEffect(() =>
		this.actions$.pipe(
			ofType(draftsApiActions.deploySuccess),
			switchMap(({ deployJob }) =>
				this.configHubDeployApiService.getDownload(deployJob.jobId).pipe(
					map(deployResults => draftsApiActions.loadDeployResultsSuccess({ deployResults })),
					catchError(errorMessage => of(draftsApiActions.loadDeployResultsFailure({ errorMessage })))
				)
			)
		)
	);

	/**
	 * Retrieves the live configuration JSON for the selected object
	 */
	loadObjectConfiguration$ = createEffect(() =>
		this.actions$.pipe(
			ofType(draftsPageActions.viewObjectDetails),
			concatLatestFrom(() => [
				this.store.select(fromDraftsPage.selectSummary),
				this.store.select(fromDraftsPage.selectSelectedObjectType),
				this.store.select(fromDraftsPage.selectSelectedOperationType())
			]),
			filter(([, , , operationType]) => operationType === ObjectOperationType.CHANGED),
			switchMap(([{ objectId }, { targetBackupId }, objectType, operationType]) =>
				this.configHubBackupsApiService.getObjectLiveConfiguration(targetBackupId, objectId).pipe(
					map(objectConfiguration =>
						draftsApiActions.loadObjectLiveConfigurationSuccess({
							objectConfiguration,
							objectId,
							operationType,
							objectType
						})
					),
					catchError(errorMessage =>
						of(
							draftsApiActions.loadObjectLiveConfigurationFailure({
								errorMessage,
								objectId,
								objectType,
								operationType
							})
						)
					)
				)
			)
		)
	);

	constructor(
		private actions$: Actions,
		private configHubDeployApiService: ConfigHubDeployApiService,
		private configHubDraftsApiService: ConfigHubDraftsApiService,
		private configHubBackupsApiService: ConfigHubBackupsApiService,
		private configHubAdvancedSettingsApiService: ConfigHubAdvancedSettingsApiService,
		private configHubScheduledJobsApiService: ConfigHubScheduledJobsApiService,
		private featureFlagService: FeatureFlagService,
		private store: Store
	) {}
}
