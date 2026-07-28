/*
 * Copyright (C) 2023 Acme Technologies, Inc.  All rights reserved.
 */

/**
 * The type of Configuration Hub job.
 */
export enum ConfigHubJobType {
	BACKUP = 'BACKUP',
	COMPARE = 'COMPARE',
	DEPLOY = 'CONFIG_DEPLOY_DRAFT',
	CONFIG_DEPLOY_DRAFT = 'DEPLOY',
	DRAFT = 'CREATE_DRAFT',
	SYNC = 'CLOUD_STORAGE_SYNC'
}
