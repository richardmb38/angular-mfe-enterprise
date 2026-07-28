/*
 * Copyright (C) 2023 Acme Technologies, Inc.  All rights reserved.
 */
/**
 * The status of the Configuration Hub job.
 */
export enum ConfigHubJobStatus {
	NOT_STARTED = 'NOT_STARTED',
	IN_PROGRESS = 'IN_PROGRESS',
	COMPLETE = 'COMPLETE',
	CANCELLED = 'CANCELLED',
	FAILED = 'FAILED',
	FAILED_EXTERNAL_COMMUNICATION = 'FAILED_EXTERNAL_COMMUNICATION',
	PARTIALLY_COMPLETE = 'PARTIALLY_COMPLETE'
}
