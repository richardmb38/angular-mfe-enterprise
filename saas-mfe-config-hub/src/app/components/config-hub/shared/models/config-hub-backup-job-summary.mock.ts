/*
 * Copyright (C) 2023 Acme Technologies, Inc.  All rights reserved.
 */
import { mockConfigHubBackupJob } from './config-hub-backup-job.mock';
import { ConfigHubJobType } from './config-hub-job-type.model';
import { ConfigHubBackupSummary } from './summary.model';

/**
 * Mock data for a Configuration Hub backup job summary.
 */
export const mockConfigHubBackupJobSummary: ConfigHubBackupSummary = {
	...mockConfigHubBackupJob,
	totalObjectCount: 47,
	objectBreakdown: {
		ROLE: 7,
		AUTH_ORG: 1,
		SOURCE: 7,
		ACCESS_PROFILE: 12,
		IDENTITY_PROFILE: 4,
		GOVERNANCE_GROUP: 2,
		TRIGGER_SUBSCRIPTION: 14
	},
	type: ConfigHubJobType.BACKUP
};
