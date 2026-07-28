/*
 * Copyright (C) 2023 Acme Technologies, Inc.  All rights reserved.
 */
import { CloudStorageStatus } from '../../activity-log/activity-log.model';
import { ConfigHubJobStatus } from './config-hub-job-status.model';
import { ConfigHubJobType } from './config-hub-job-type.model';
import {
	ConfigHubBackupJob,
	ConfigHubBackupType,
	ConfigHubCompareJob,
	ConfigHubDeployJob,
	ConfigHubDeployResults,
	ConfigHubDraftJob,
	ConfigHubSyncJob,
	FileSyncInfo,
	HydrationStatuses,
	IncludedNames,
	Message,
	ObjectImportResult
} from './job.model';
import { mockBaseReferenceDto } from './object-details.mock';

/**
 * Mock data for a Configuration Hub backup job.
 */
export const mockConfigHubHydratingBackupJob: ConfigHubBackupJob = {
	jobId: '1e987ead-a021-470e-b39d-31cd619e497e',
	status: ConfigHubJobStatus.COMPLETE,
	name: 'mock-backup-job',
	created: '2023-02-03T17:13:26.712Z',
	completed: '2023-02-03T17:13:28.499Z',
	expiration: '2023-02-10T17:13:26Z',
	tenant: 'acme-dev',
	userCanDelete: true,
	isPartial: false,
	requesterName: 'support',
	backupType: ConfigHubBackupType.MANUAL,
	type: ConfigHubJobType.BACKUP,
	totalObjectCount: 10,
	hydrationStatus: HydrationStatuses.HYDRATING
};

/**
 * Mock data for a Configuration Hub partial backup job.
 */
export const mockConfigHubBackupJobPartial: ConfigHubBackupJob = {
	jobId: '1e987ead-a021-470e-b39d-31cd619e497e',
	status: ConfigHubJobStatus.COMPLETE,
	name: 'mock-backup-job',
	created: '2023-02-03T17:13:26.712Z',
	completed: '2023-02-03T17:13:28.499Z',
	expiration: '2023-02-10T17:13:26Z',
	tenant: 'acme-dev',
	userCanDelete: true,
	isPartial: true,
	requesterName: 'support',
	backupType: ConfigHubBackupType.MANUAL,
	type: ConfigHubJobType.BACKUP,
	backupOptions: {
		includeTypes: ['AUTH_ORG'],
		objectOptions: Object.fromEntries(new Map<string, IncludedNames>())
	},
	totalObjectCount: 10,
	hydrationStatus: HydrationStatuses.HYDRATED
};

/**
 * Mock data for a Configuration Hub backup with total limit.
 */
export const mockConfigHubBackupTotalObjectLimit: ConfigHubBackupJob = {
	jobId: '1e987ead-a021-470e-b39d-31cd619e497e',
	status: ConfigHubJobStatus.COMPLETE,
	name: 'mock-backup-job',
	created: '2023-02-03T17:13:26.712Z',
	completed: '2023-02-03T17:13:28.499Z',
	expiration: '2023-02-10T17:13:26Z',
	tenant: 'acme-dev',
	userCanDelete: true,
	isPartial: true,
	requesterName: 'support',
	backupType: ConfigHubBackupType.MANUAL,
	type: ConfigHubJobType.BACKUP,
	backupOptions: {
		includeTypes: ['AUTH_ORG'],
		objectOptions: Object.fromEntries(new Map<string, IncludedNames>())
	},
	totalObjectCount: 30001,
	hydrationStatus: HydrationStatuses.HYDRATED
};

/**
 * Mock data for Configuration Hub backup job of AUTOMATED type.
 */
export const mockAutomatedConfigHubBackupJob: ConfigHubBackupJob = {
	jobId: 'b61d0f7d-9bd9-7219-8432-e3abebafab16',
	status: ConfigHubJobStatus.COMPLETE,
	name: 'mock-backup-job',
	created: '2023-03-14T17:54:32.786Z',
	completed: '2023-03-14T17:54:35.391Z',
	expiration: '2023-02-10T17:13:26Z',
	tenant: 'acme-dev',
	userCanDelete: false,
	isPartial: false,
	requesterName: 'SYSTEM',
	backupType: ConfigHubBackupType.AUTOMATED,
	type: ConfigHubJobType.BACKUP,
	totalObjectCount: 10,
	hydrationStatus: HydrationStatuses.HYDRATED
};

/**
 * Mock data for a Configuration Hub compare job.
 */
export const mockConfigHubCompareJob: ConfigHubCompareJob = {
	jobId: '4fbe7b84-302e-4cc5-a95e-619edccc16a5',
	status: ConfigHubJobStatus.COMPLETE,
	created: '2023-02-03T17:13:26.712Z',
	completed: '2023-02-03T17:13:28.499Z',
	expiration: '2023-02-10T17:13:26Z',
	tenant: 'acme-dev',
	userCanDelete: false,
	requesterName: 'support',
	sourceId: '46e14743-f19e-4959-a4a3-b1a73fd1540f',
	targetId: 'd8c4f9b7-dbc7-4c86-8693-3b12dfbcdf8a',
	type: ConfigHubJobType.COMPARE
};

/**
 * Mock data for a Configuration Hub draft job.
 */
export const mockConfigHubDraftJob: ConfigHubDraftJob = {
	jobId: '4fbe7b84-302e-4cc5-a95e-619edccc16a5',
	status: ConfigHubJobStatus.COMPLETE,
	created: '2023-02-03T17:13:26.712Z',
	completed: '2023-02-03T17:13:28.499Z',
	requesterName: 'support',
	sourceBackupId: '46e14743-f19e-4959-a4a3-b1a73fd1540f',
	type: ConfigHubJobType.DRAFT,
	name: 'Draft Job',
	sourceTenant: 'some other tenant',
	sourceBackupName: 'My Backup',
	approvalStatus: null
};

/**
 * Mock data for a Configuration Hub deploy job.
 */
export const mockConfigHubDeployJob: ConfigHubDeployJob = {
	jobId: '4fbe7b84-302e-4cc5-a95e-619edccc16a5',
	status: ConfigHubJobStatus.COMPLETE,
	created: '2023-02-03T17:13:26.712Z',
	completed: '2023-02-03T17:13:28.499Z',
	requesterName: 'support',
	draftId: '46e14743-f19e-4959-a4a3-b1a73fd1540f',
	draftName: 'Test',
	type: ConfigHubJobType.DEPLOY
};

export const mockFileSyncInfo: FileSyncInfo = {
	id: '4fbe7b84-302e-4cc5-a95e-619edccc16a5',
	status: CloudStorageStatus.SYNCED,
	name: 'test',
	s3Key: 'test',
	completedDate: '2023-02-03T17:13:28.499Z'
};

/**
 * Mock data for a Configuration Hub deploy job.
 */
export const mockConfigHubSyncJob: ConfigHubSyncJob = {
	jobId: '4fbe7b84-302e-4cc5-a95e-619edccc16a5',
	status: ConfigHubJobStatus.COMPLETE,
	created: '2023-02-03T17:13:26.712Z',
	completed: '2023-02-03T17:13:28.499Z',
	requesterName: 'support',
	type: ConfigHubJobType.SYNC,
	fileSyncInfo: [mockFileSyncInfo]
};

/**
 *  Mock data for a list of Configuration Hub sync jobs.
 */
export const mockConfigHubSyncList: ConfigHubSyncJob[] = [
	{
		...mockConfigHubSyncJob
	},
	{
		...mockConfigHubSyncJob,
		jobId: '4fbe7b84-302e-4cc5-a9fe-619edccc16a2',
		fileSyncInfo: [mockFileSyncInfo]
	}
];

/**
 * Mock data for a Message.
 */
export const mockMessage: Message = {
	key: 'SOURCE_IMPORT_FAILED',
	text: "An error occurred importing source: 'docu'",
	detail: {
		exceptionMessage: "Unable to find connector detail with scriptName 'cd13e88f-5146-4c1f-84a1-69d00832db85'."
	}
};

/**
 * Mock data for an ObjectImportResult.
 */
export const mockObjectImportResult: ObjectImportResult = {
	infos: [mockMessage],
	warnings: [mockMessage],
	errors: [mockMessage],
	importedObjects: [mockBaseReferenceDto]
};

/**
 * Mock data for ConfigHubDeployResults.
 */
export const mockConfigHubDeployResults: ConfigHubDeployResults = {
	results: {
		SOURCE: mockObjectImportResult
	},
	exportJobId: 'export-job-id'
};
