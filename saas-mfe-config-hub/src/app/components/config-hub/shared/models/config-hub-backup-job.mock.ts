/*
 * Copyright (C) 2023 Acme Technologies, Inc.  All rights reserved.
 */
import { ConfigHubJobStatus } from './config-hub-job-status.model';
import { ConfigHubJobType } from './config-hub-job-type.model';
import { ConfigHubBackupJob, ConfigHubBackupType, HydrationStatuses } from './job.model';

/**
 * Mock data for a Configuration Hub backup job.
 */
export const mockConfigHubBackupJob: ConfigHubBackupJob = {
	jobId: '1e987ead-a021-470e-b39d-31cd619e497e',
	status: 'COMPLETE' as ConfigHubJobStatus,
	name: 'mock-backup-job',
	created: '2023-02-03T17:13:26.712Z',
	completed: '2023-02-03T17:13:28.499Z',
	expiration: '2023-02-10T17:13:26Z',
	tenant: 'acme-dev',
	userCanDelete: true,
	isPartial: false,
	requesterName: 'support',
	backupType: 'MANUAL' as ConfigHubBackupType,
	type: ConfigHubJobType.BACKUP,
	totalObjectCount: 10,
	hydrationStatus: 'HYDRATED' as HydrationStatuses
};

/**
 * Mock data for a Configuration Hub backup Upload job.
 */
export const mockConfigHubBackupUploadJob: ConfigHubBackupJob = {
	jobId: '1e987ead-a021-470e-b39d-31cd619e497e',
	status: 'COMPLETE' as ConfigHubJobStatus,
	name: 'mock-backup-job',
	created: '2023-02-03T17:13:26.712Z',
	completed: '2023-02-03T17:13:28.499Z',
	expiration: '2023-02-10T17:13:26Z',
	tenant: 'acme-dev',
	userCanDelete: true,
	isPartial: false,
	requesterName: 'support',
	backupType: 'UPLOADED' as ConfigHubBackupType,
	type: ConfigHubJobType.BACKUP,
	totalObjectCount: 10,
	hydrationStatus: 'HYDRATED' as HydrationStatuses
};
