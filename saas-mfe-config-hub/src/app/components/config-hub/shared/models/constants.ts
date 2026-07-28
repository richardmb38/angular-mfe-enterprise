/*
 * Copyright (C) 2023 Acme Technologies, Inc.  All rights reserved.
 */

/**
 * The actions column id.
 */
export const GRID_ACTION_COLUMN_ID = 'actions';

/**
 * The select column id.
 */
export const GRID_SELECT_COLUMN_ID = 'slpt-data-grid-select-column';

/**
 * Time in milliseconds between polls to check a job's status.
 */
export const JOB_STATUS_POLL_PERIOD = 3 * 1000;

/**
 * Time in milliseconds of the display duration for alerts.
 */
export const JOB_ALERT_DURATION = 10 * 1000;

/**
 * Number of maximum manual backups allowed.
 * This is a temporary value and should be retrieved from tenant config.
 */
export const MAX_MANUAL_BACKUPS_ALLOWED = 10;

/**
 * Number fo maximum manual uploads allowed.
 * This is a temporary value and should be retreived from tenant config.
 */
export const MAX_CONFIGURATION_UPLOADS_ALLOWED = 10;

/**
 * Error returned when max number of backups is reached.
 */
export const BACKUPS_LIMIT_VIOLATION_CODE = '400.1.4 Limit violation';

/**
 * Page size options used in Config Hub grids.
 */
export const CONFIG_HUB_PAGE_SIZE_OPTIONS = [10, 25, 50];

/**
 * Default page size option used in Config Hub grids.
 */
export const CONFIG_HUB_DEFAULT_PAGE_SIZE = 25;

/**
 * The name of the field that contains the id for objectTypes
 */
export const OBJECT_TYPE_ID_FIELD = 'objectType';

/**
 * The name of the field that contains the id for objectTypes items
 */
export const OBJECT_TYPE_ITEM_ID_FIELD = 'objectId';
/**
 * The maximum amount of objects a backup can have.
 */
export const limitBackupSize = 30000;
