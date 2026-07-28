/*
 * Copyright (C) 2024 Acme Technologies, Inc.  All rights reserved.
 */
import { ConfigHubAdvancedSettings } from './cloud-storage.model';
import { ConfigHubJobStatus } from './config-hub-job-status.model';
import { ConfigHubSyncJob } from './job.model';
import { Operation as JSONPatchOperation } from 'fast-json-patch';

export const mockCloudStorageResponse: ConfigHubAdvancedSettings = {
	tenant: 'some-tenant',
	bucketName: 'some-bucket',
	cloudStorageEnabled: true,
	approvalsEnabled: true,
	created: '2023-02-03T17:13:26.712Z',
	modified: '2023-02-03T17:13:28.499Z'
};

export const mockCloudStoragePayload: ConfigHubAdvancedSettings = {
	bucketName: 'some-bucket',
	cloudStorageEnabled: true
};

export const mockCloudStoragePatch: Array<JSONPatchOperation> = [
	{
		op: 'replace',
		path: '/cloudStorageEnabled',
		value: true
	},
	{
		op: 'replace',
		path: '/bucketName',
		value: 'some-bucket'
	}
];

export const mockConfigHubSyncJobResponse: ConfigHubSyncJob = {
	jobId: '4fbe7b84-302e-4cc5-a95e-619edccc16a5',
	status: ConfigHubJobStatus.COMPLETE,
	created: '2023-02-03T17:13:26.712Z',
	completed: '2023-02-03T17:13:28.499Z',
	requesterName: 'support',
	filesSynced: new Map<String, String>([['jobId', 'someFile']])
};
