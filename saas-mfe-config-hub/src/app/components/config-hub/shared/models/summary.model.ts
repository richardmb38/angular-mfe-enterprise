/*
 * Copyright (C) 2023 Acme Technologies, Inc.  All rights reserved.
 */
import { ConfigHubBackupJob, ConfigHubCompareJob, ConfigHubDraftJob } from './job.model';
import { ObjectOperationType } from './object-details.model';

/**
 * Defines a Configruation Hub backup job summary as expected to be received from the API.
 */
export interface ConfigHubBackupSummary extends ConfigHubBackupJob {
	/**
	 * The total number of objects in the backup.
	 */
	totalObjectCount: number;

	/**
	 * A breakdown containing the number of objects per object type.
	 */
	objectBreakdown: { [objectType: string]: number };
}

/**
 * Defines a Configuration Hub compare job summary as expected to be received from the API.
 */
export interface ConfigHubCompareSummary extends ConfigHubCompareJob {
	/**
	 * The total number of objects in the source configuration.
	 */
	numberOfObjectsSource: number;

	/**
	 * The total number of objects in the target configuration.
	 */
	numberOfObjectsTarget: number;

	/**
	 * A breakdown containing the number of objects per object type.
	 */
	objectBreakdown: { [objectType: string]: ObjectTypeDeltas };
}

/**
 * Defines a Configuration Hub draft job summary.
 */
export interface ConfigHubDraftSummary extends ConfigHubDraftJob {
	/**
	 * The UUID of the target backup of this draft job.
	 */
	targetBackupId: string;

	/**
	 * The total number of objects in the source configuration.
	 */
	numberOfObjectsSource: number;

	/**
	 * The total number of objects in the target configuration.
	 */
	numberOfObjectsTarget: number;

	/**
	 * A breakdown containing the number of objects per object type.
	 */
	objectBreakdown: { [objectType: string]: ObjectTypeDeltas };
}

/**
 * The name of the delta fields in the summary grid.
 */
export enum ObjectDeltaTypeNames {
	ADDED = 'added',
	SAME = 'same',
	DIFFERENT = 'different',
	REMOVED = 'removed',
	ERRORS = 'errors',
	TOTAL = 'total'
}

/**
 * Defines a model showing the differential between two backups for a given object type.
 */
export interface ObjectTypeDeltas {
	/**
	 * The number of objects that are the same.
	 */
	[ObjectDeltaTypeNames.SAME]: number;

	/**
	 * The number of objects that have been added.
	 */
	[ObjectDeltaTypeNames.ADDED]: number;

	/**
	 * The number of objects that have been removed.
	 */
	[ObjectDeltaTypeNames.REMOVED]: number;

	/**
	 * The number of objects that are different.
	 */
	[ObjectDeltaTypeNames.DIFFERENT]: number;

	/**
	 * The number of objects that have errors.
	 */
	[ObjectDeltaTypeNames.ERRORS]: number;
}

/**
 * Defines a model showing the total number changes in a draft
 */
export interface ConfigHubDraftObjectTotals extends ObjectTypeDeltas {
	/**
	 * The total number of objects that have been modified, deleted or added
	 */
	[ObjectDeltaTypeNames.TOTAL]: number;
}

export const objectDeltaNamesToOperationTypes: Partial<Record<ObjectDeltaTypeNames, ObjectOperationType>> = {
	[ObjectDeltaTypeNames.DIFFERENT]: ObjectOperationType.CHANGED,
	[ObjectDeltaTypeNames.ADDED]: ObjectOperationType.ADDED,
	[ObjectDeltaTypeNames.REMOVED]: ObjectOperationType.REMOVED
};

/**
 * Defines a row for the compare summary grid.
 */
export interface ConfigHubCompareSummaryRow extends ObjectTypeDeltas {
	objectType: string;
	numberOfObjectsTarget: number;
	numberOfObjectsSource: number;
}

/**
 * Maps differences from ObjectOperationType to ObjectDeltaTypeNames
 */
export const objectOperationTypesToDeltaNames: Partial<Record<ObjectOperationType, ObjectDeltaTypeNames>> = {
	[ObjectOperationType.ADDED]: ObjectDeltaTypeNames.ADDED,
	[ObjectOperationType.CHANGED]: ObjectDeltaTypeNames.DIFFERENT,
	[ObjectOperationType.REMOVED]: ObjectDeltaTypeNames.REMOVED
};
