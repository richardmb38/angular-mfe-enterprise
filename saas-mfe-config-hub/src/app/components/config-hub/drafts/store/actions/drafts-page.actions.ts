/*
 * Copyright (C) 2023 Acme Technologies, Inc.  All rights reserved.
 */
import { createAction, props } from '@ngrx/store';

import { BaseObject, ObjectOperationType } from '../../../shared/models';

const actor = '[ConfigHub - Drafts Page]';

export const draftsPageLeave = createAction(`${actor} Page Leave`);

/**
 * Summary
 */
export const summaryPageOpen = createAction(`${actor} Summary Page Open`, props<{ draftId: string }>());

export const summaryPageLoadSummary = createAction(`${actor} Summary Page Load Summary`, props<{ draftId: string }>());

export const objectTypeSelect = createAction(`${actor} Object Type Select`, props<{ objectType: string }>());

export const objectTypeDeselect = createAction(`${actor} Object Type Deselect`, props<{ objectType: string }>());

export const objectTypesBulkSelect = createAction(
	`${actor} Object Types Bulk Select`,
	props<{ objectTypes: string[] }>()
);

export const objectTypesBulkDeselect = createAction(
	`${actor} Object Types Bulk Deselect`,
	props<{ objectTypes: string[] }>()
);

export const discardAllDraftChanges = createAction(`${actor} Discard All Draft Changes`);

export const saveAllDraftChanges = createAction(`${actor} Save All Draft Changes`);

export const deployDraft = createAction(`${actor} Deploy Draft`);

export const scheduleDeployDraft = createAction(`${actor} Schedule Deploy Draft`, props<{ startTime: string }>());

export const viewObjectList = createAction(
	`${actor} View Object List`,
	props<{ objectType: string; objectOperationType: ObjectOperationType; showErrors: boolean }>()
);

/**
 * Objects List
 */
export const objectListOpen = createAction(
	`${actor} Object List Open`,
	props<{ objectType: string; objectOperationType: ObjectOperationType }>()
);

export const operationTypeChange = createAction(
	`${actor} Operation Type Change`,
	props<{ objectType: string; objectOperationType: ObjectOperationType; showErrors: boolean }>()
);

export const objectListLoadMore = createAction(
	`${actor} Object List Load More`,
	props<{
		objectType: string;
		objectOperationType: ObjectOperationType;
		requestedAmount: number;
	}>()
);

export const objectListSortChange = createAction(
	`${actor} Object List Sort Change`,
	props<{ objectType: string; objectOperationType: ObjectOperationType; sortAttribute: string }>()
);

export const objectListPageNumberChange = createAction(
	`${actor} Object List Page Number Change`,
	props<{ objectType: string; objectOperationType: ObjectOperationType; pageNumber: number }>()
);

export const objectListPageSizeChange = createAction(
	`${actor} Object List Page Size Change`,
	props<{ objectType: string; objectOperationType: ObjectOperationType; pageSize: number }>()
);

export const objectListSearchTermChange = createAction(
	`${actor} Object List Search Term Change`,
	props<{ objectType: string; objectOperationType: ObjectOperationType; searchQuery: string }>()
);

export const objectSelect = createAction(
	`${actor} Object Select`,
	props<{ objectType: string; objectOperationType: ObjectOperationType; objectId: string }>()
);

export const objectDeselect = createAction(
	`${actor} Object Deselect`,
	props<{ objectType: string; objectOperationType: ObjectOperationType; objectId: string }>()
);

export const objectBulkSelect = createAction(
	`${actor} Object Bulk Select`,
	props<{ objectType: string; objectOperationType: ObjectOperationType; objectIds: string[] }>()
);

export const objectBulkDeselect = createAction(
	`${actor} Object Bulk Deselect`,
	props<{ objectType: string; objectOperationType: ObjectOperationType; objectIds: string[] }>()
);

export const viewObjectDetails = createAction(`${actor} View Object Details`, props<{ objectId: string }>());

export const closeObjectDetails = createAction(`${actor} Close Object Details`);

export const objectJsonChangesSaved = createAction(
	`${actor} Object JSON Save Changes`,
	props<{ objectType: string; objectOperationType: ObjectOperationType; objectId: string; objectJson: BaseObject }>()
);
