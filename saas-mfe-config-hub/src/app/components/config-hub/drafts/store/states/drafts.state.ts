/*
 * Copyright (C) 2023 Acme Technologies, Inc.  All rights reserved.
 */
import {
	AtomicState,
	ErrorState,
	RequestState,
	SearchQuery,
	createAtomicStateAdapter
} from '@acme-priv/ui-common/src/acme/angular/util/atomic-state';

import {
	BaseObject,
	CONFIG_HUB_DEFAULT_PAGE_SIZE,
	ConfigHubDeployJob,
	ConfigHubDeployResults,
	ConfigHubDraftSummary,
	ConfigHubScheduledJob,
	ObjectDetails,
	ObjectOperationType
} from '../../../shared/models';

export const DRAFTS_PAGE_FEATURE_KEY = 'draftsPage';

/**
 * Represents the state of a ConfigHubDraftSummary.
 */
export interface DraftSummaryState {
	/**
	 * The draft summary.
	 */
	summary: ConfigHubDraftSummary;

	/**
	 * Array of object types that have been entirely deselected,
	 * e.g. deselect *all* ACCESS_PROFILES
	 */
	deselectedObjectTypes: string[];

	/**
	 * The current state of the request.
	 * This can be either state of the request or the error state that contains the error message
	 */
	requestState: RequestState | ErrorState;
}

/**
 * The initial DraftSummaryState.
 */
export const draftSummaryInitialState: DraftSummaryState = {
	summary: null,
	deselectedObjectTypes: [],
	requestState: RequestState.INIT
};

/**
 * Represents the state of deployment for the draft.
 */
export interface DraftDeployState {
	/**
	 * The deploy job.
	 */
	deployJob: ConfigHubDeployJob;

	/**
	 * The results of a deploy job.
	 */
	deployResults: ConfigHubDeployResults;

	/**
	 * The current state of the request.
	 * This can be either state of the request or the error state that contains the error message
	 */
	requestState: RequestState | ErrorState;
}

/**
 * Represents the state of the scheduled deploy
 */
export interface DraftScheduleDeployState {
	/**
	 * The deploy job.
	 */
	scheduledJob: ConfigHubScheduledJob;

	/**
	 * The current state of the request.
	 * This can be either state of the request or the error state that contains the error message
	 */
	requestState: RequestState | ErrorState;
}

/**
 * The initial DraftDeployState.
 */
export const draftDeployInitialState: DraftDeployState = {
	deployJob: null,
	deployResults: null,
	requestState: RequestState.INIT
};

/**
 * The initial DraftDeployState.
 */
export const draftScheduleDeployInitialState: DraftScheduleDeployState = {
	scheduledJob: null,
	requestState: RequestState.INIT
};

/**
 * Model used for search queries for ObjectDetails.
 */
export interface ObjectDetailsSearchQuery extends SearchQuery {
	/**
	 * The keyof the last item evaluated in the DynamoDB query.
	 */
	lastEvaluatedKey?: string;

	/**
	 * The current page number.
	 */
	currentPage: number;

	/**
	 * The page number of the last possible page of results.
	 * Should remain null until it becomes known.
	 */
	finalPage: number;
}

/**
 * An adapter for ObjectDetails so that an AtomicState of that type can be created.
 */
export const objectDetailsAtomicStateAdapter = createAtomicStateAdapter<ObjectDetails>({
	selectId: (objectDetails: ObjectDetails) => objectDetails.objectId
});

/**
 * An AtomicState of type ObjectDetails.
 */
export interface ObjectDetailsState extends AtomicState<ObjectDetails> {
	searchQuery: ObjectDetailsSearchQuery;
}

/**
 * Returns an initial ObjectDetailsState.
 * @returns {ObjectDetailsState}
 */
const getInitialObjectDetailsState = (): ObjectDetailsState =>
	objectDetailsAtomicStateAdapter.getInitialState({
		searchQuery: {
			currentPage: 1,
			finalPage: null,
			lastEvaluatedKey: null,
			limit: CONFIG_HUB_DEFAULT_PAGE_SIZE,
			showErrors: false
		},
		requestState: RequestState.INIT
	});

/**
 * Represents a state of a given object type, e.g. ACCESS_PROFILES or ROLES.
 */
export interface ObjectTypeState {
	/**
	 * The type of operation currently selected, i.e. ADDED, CHANGED, or REMOVED.
	 */
	selectedOperationType: ObjectOperationType;

	/**
	 * ObjectDetailsStates grouped by ObjectOperationType.
	 */
	objectDetailsStates: Record<ObjectOperationType, ObjectDetailsState>;

	/**
	 * IDs of the objects that have been deselected in the table grouped by ObjectOperationType.
	 */
	deselectedObjectIds: Record<ObjectOperationType, string[]>;

	/**
	 * A dictionary of objectIds to modified BaseObject.
	 * When a user edits an individual object, e.g. a singular Access Profile in ACCESS_PROFILES,
	 * it is stored here in its edited form.
	 */
	modifiedObjects: Record<
		ObjectOperationType,
		{
			[objectId: string]: BaseObject;
		}
	>;

	/**
	 * Details with errors
	 */
	showErrors: boolean;
}

/**
 * The initial ObjectTypeState.
 */
export const objectTypeInitialState: ObjectTypeState = {
	selectedOperationType: ObjectOperationType.ADDED,
	showErrors: false,
	objectDetailsStates: {
		[ObjectOperationType.ADDED]: getInitialObjectDetailsState(),
		[ObjectOperationType.CHANGED]: getInitialObjectDetailsState(),
		[ObjectOperationType.REMOVED]: getInitialObjectDetailsState()
	},
	deselectedObjectIds: {
		[ObjectOperationType.ADDED]: [],
		[ObjectOperationType.CHANGED]: [],
		[ObjectOperationType.REMOVED]: []
	},
	modifiedObjects: {
		[ObjectOperationType.ADDED]: {},
		[ObjectOperationType.CHANGED]: {},
		[ObjectOperationType.REMOVED]: {}
	}
};

/**
 * Get a dictionary of objectTypes mapped to an initial ObjectTypeState.
 * @param draftSummary - The draft summary.
 * @returns {{[objectType: string]: ObjectTypeState}}
 */
export const getObjectTypeInitialStates = (
	draftSummary: ConfigHubDraftSummary
): {
	[objectType: string]: ObjectTypeState;
} => {
	const objectTypeNames = Object.keys(draftSummary.objectBreakdown);
	return Object.fromEntries(objectTypeNames.map(objectTypeName => [objectTypeName, objectTypeInitialState]));
};

/**
 * Represents the state of the entire Drafts page.
 */
export interface DraftsPageState {
	/**
	 * The currently selected object type, e.g. ACCESS_PROFILES, ROLES, etc.
	 */
	selectedObjectType: string;

	/**
	 * The individual ObjectDetails object selected, e.g. a singular Access Profile in ACCESS_PROFILES.
	 * Can also be used to determine whether the object detail overlay is open.
	 */
	selectedObjectId: string;

	/**
	 * The current state of the save draft request.
	 * This can be either state of the request or the error state that contains the error message
	 */
	saveRequestState: RequestState | ErrorState;

	/**
	 * The draft summary state.
	 */
	summaryState: DraftSummaryState;

	/**
	 * The draft deploy state.
	 */
	deployState: DraftDeployState;

	/**
	 * The scheduled draft deploy state.
	 */
	scheduledDeployState: DraftScheduleDeployState;

	/**
	 * Wether or not the drafts page should use approvals
	 */
	approvalsEnabled: boolean;

	/**
	 * A dictionary of object types to their states.
	 * The key is the object type, e.g. ACCESS_PROFILES, ROLES, etc.
	 */
	objectTypes: {
		[objectType: string]: ObjectTypeState;
	};
}

/**
 * The initial DraftsPageState.
 */
export const draftsPageInitialState: DraftsPageState = {
	selectedObjectType: null,
	selectedObjectId: null,
	saveRequestState: RequestState.INIT,
	summaryState: draftSummaryInitialState,
	deployState: draftDeployInitialState,
	scheduledDeployState: draftScheduleDeployInitialState,
	objectTypes: {},
	approvalsEnabled: false
};
