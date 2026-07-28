/*
 * Copyright (C) 2023 Acme Technologies, Inc.  All rights reserved.
 */
import { ConfigHubJobStatus } from './config-hub-job-status.model';
import { ConfigHubJobType } from './config-hub-job-type.model';
import {
	ConfigHubBackupJob,
	ConfigHubBackupType,
	ConfigHubDeployJob,
	ConfigHubDraftJob,
	ConfigHubJob,
	ConfigHubSyncJob,
	HydrationStatuses
} from './job.model';

/* Creates a list of mocked jobs used in Configuration Hub.
 * @param count - the number of mocked jobs in the array
 * @param jobtype - the type of job being mocked
 * @param {ConfigHubJobStatus} status - the status of the jobs
 * @returns {ConfigHubBackupJob[]} mocked jobs
 */
export const createMockConfigHubJobs = (
	count: number,
	jobType: ConfigHubJobType.BACKUP | ConfigHubJobType.DRAFT | ConfigHubJobType.DEPLOY | ConfigHubJobType.SYNC,
	status: ConfigHubJobStatus = ConfigHubJobStatus.COMPLETE
): ConfigHubBackupJob[] | ConfigHubDraftJob[] | ConfigHubDeployJob[] | ConfigHubSyncJob[] => {
	const created = new Date('2023-02-03T17:13:26.712Z');
	const expiration = new Date('2023-02-13T17:13:26.712Z');
	const baseJobs = new Array(count).fill(null).map(
		(_, idx): ConfigHubJob => ({
			jobId: `configHubJobId-${idx}`,
			status,
			created: created.setDate(created.getDate() + 1) && created.toISOString(),
			completed: created.setSeconds(created.getSeconds() + 10) && created.toISOString(),
			expiration: expiration.setDate(expiration.getDate() + 1) && expiration.toISOString(),
			tenant: 'acme-dev',
			userCanDelete: true,
			requesterName: 'support'
		})
	);

	if (jobType === ConfigHubJobType.BACKUP) {
		return baseJobs.map(
			(job, idx): ConfigHubBackupJob => ({
				...job,
				backupType: 'MANUAL' as ConfigHubBackupType,
				name: `Backup Job ${idx + 1}`,
				type: ConfigHubJobType.BACKUP,
				isPartial: false,
				totalObjectCount: 1,
				hydrationStatus: 'HYDRATED' as HydrationStatuses
			})
		);
	}

	if (jobType === ConfigHubJobType.DEPLOY) {
		return baseJobs.map(
			(job, idx): ConfigHubDeployJob => ({
				...job,
				draftId: `draftId-${idx}`,
				type: ConfigHubJobType.DEPLOY,
				draftName: `Test Deploy ${idx}`
			})
		);
	}

	return baseJobs.map(
		(job, idx): ConfigHubDraftJob => ({
			...job,
			sourceBackupId: `sourceBackupId-${idx}`,
			sourceBackupName: `sourceBackupName-${idx}`,
			sourceTenant: `Source Tenant`,
			name: `Draft Job ${idx + 1}`,
			type: ConfigHubJobType.DRAFT
		})
	);
};
