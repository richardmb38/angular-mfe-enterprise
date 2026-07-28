/*
 * Copyright (C) 2023 Acme Technologies, Inc.  All rights reserved.
 */
import { createAction, props } from '@ngrx/store';

import {
	ConfigHubApprovalStatus,
	ConfigHubDeployJob,
	ConfigHubDeployResults,
	ConfigHubDraftApprovalComment,
	ConfigHubDraftSummary,
	ConfigHubObjectConfigurationResult,
	ConfigHubScheduledJob,
	ObjectDetailsListResponse,
	ObjectOperationType
} from '../../../shared/models';

const actor = '[ConfigHub - Drafts Api]';

/**
 * Load Draft Summary
 */
export const draftSummaryLoadSuccess = createAction(
	`${actor} Load Draft Summary Success`,
	props<{ draftSummary: ConfigHubDraftSummary; approvalsEnabled: boolean }>()
);

export const draftSummaryLoadFailure = createAction(
	`${actor} Load Draft Summary Failure`,
	props<{ errorMessage: string }>()
);

/**
 * Load Object Details
 */
export const objectDetailsLoadSuccess = createAction(
	`${actor} Load Object Details Success`,
	props<{
		objectType: string;
		objectOperationType: ObjectOperationType;
		objectDetailsListResponse: ObjectDetailsListResponse;
	}>()
);

export const objectDetailsLoadFailure = createAction(
	`${actor} Load Object Details Failure`,
	props<{ objectType: string; objectOperationType: ObjectOperationType; errorMessage: string }>()
);

/**
 * Update Draft
 */
export const bulkPatchSkipped = createAction(`${actor} Bulk Patch Skipped`);
export const bulkPatchSuccess = createAction(`${actor} Bulk Patch Success`);
export const bulkPatchFailure = createAction(`${actor} Bulk Patch Failure`, props<{ errorMessage: string }>());

export const bulkDeleteSkipped = createAction(`${actor} Bulk Delete Skipped`);
export const bulkDeleteSuccess = createAction(`${actor} Bulk Delete Success`);
export const bulkDeleteFailure = createAction(`${actor} Bulk Delete Failure`, props<{ errorMessage: string }>());

export const initValidateSuccess = createAction(
	`${actor} Initiate Validate Draft Success`,
	props<{ draftId: string }>()
);
export const initValidateFailure = createAction(
	`${actor} Initiate Validate Draft Failure`,
	props<{ errorMessage: string }>()
);

export const validateSuccess = createAction(`${actor} Validate Draft Success`, props<{ draftId: string }>());
export const validateFailure = createAction(`${actor} Validate Draft Failure`, props<{ errorMessage: string }>());

/**
 * Deploy Draft
 */
export const createDeploySuccess = createAction(
	`${actor} Create Deploy Success`,
	props<{ deployJob: ConfigHubDeployJob }>()
);
export const createDeployFailure = createAction(`${actor} Create Deploy Failure`, props<{ errorMessage: string }>());

export const scheduleDeploySuccess = createAction(
	`${actor} Schedule Deploy Success`,
	props<{ scheduledJob: ConfigHubScheduledJob }>()
);
export const scheduleDeployFailure = createAction(
	`${actor} Schedule Deploy Failure`,
	props<{ errorMessage: string }>()
);

export const deploySuccess = createAction(`${actor} Deploy Success`, props<{ deployJob: ConfigHubDeployJob }>());
export const deployFailure = createAction(`${actor} Deploy Failure`, props<{ errorMessage: string }>());

export const loadDeployResultsSuccess = createAction(
	`${actor} Load Deploy Results Success`,
	props<{ deployResults: ConfigHubDeployResults }>()
);
export const loadDeployResultsFailure = createAction(
	`${actor} Load Deploy Results Failure`,
	props<{ errorMessage: string }>()
);

export const loadObjectLiveConfigurationSuccess = createAction(
	`${actor} Load Object Configuration Success`,
	props<{
		objectConfiguration: ConfigHubObjectConfigurationResult;
		objectId: string;
		operationType: string;
		objectType: string;
	}>()
);
export const loadObjectLiveConfigurationFailure = createAction(
	`${actor} Load Object Configuration Failure`,
	props<{ errorMessage: string; objectId: string; operationType: string; objectType: string }>()
);

export const updateApprovalStatus = createAction(
	`${actor} Update Approval Status Request`,
	props<{ approvalStatus: ConfigHubApprovalStatus; comments: string }>()
);

export const updateApprovalStatusSuccess = createAction(
	`${actor} Update Approval Status Successful`,
	props<{ approvalStatus: ConfigHubApprovalStatus; approvalComment: ConfigHubDraftApprovalComment[] }>()
);

export const updateApprovalStatusFailure = createAction(
	`${actor} Updating Approval Status Failure`,
	props<{ errorMessage: string }>()
);
