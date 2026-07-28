/*
 * Copyright (C) 2023 Acme Technologies, Inc.  All rights reserved.
 */
import { AlertConfig } from '@acme-priv/armada-angular/src/acme/angular/components/alert';
import { NotificationType } from '@acme-priv/armada-angular/src/acme/angular/components/notification-header';
import { TranslateService } from '@acme-priv/armada-angular/src/acme/angular/l10n/translation';

import { CloudStorageStatus } from '../../activity-log/activity-log.model';
import { ConfigHubJobStatus } from './config-hub-job-status.model';
import { ConfigHubJobType } from './config-hub-job-type.model';
import { BaseReferenceDto } from './object-details.model';

/**
 * The mode type value
 */
export enum ConfigHubModeType {
	RESTORE = 'RESTORE',
	PROMOTE = 'PROMOTE',
	UPLOAD = 'UPLOAD'
}

/**
 * The type of Configuration Hub backup job.
 */
export enum ConfigHubBackupType {
	MANUAL = 'MANUAL',
	AUTOMATED = 'AUTOMATED',
	UPLOADED = 'UPLOADED'
}

/**
 * The Hydration Statuses for backups
 */
export enum HydrationStatuses {
	HYDRATED = 'HYDRATED',
	HYDRATING = 'HYDRATING',
	NOT_HYDRATED = 'NOT_HYDRATED'
}

/**
 * Defines a Configuration Hub job as expected to be received from the API.
 */
export interface ConfigHubJob {
	/**
	 * UUID of this job.
	 */
	jobId: string;

	/**
	 * Status of this job.
	 */
	status?: ConfigHubJobStatus;

	/**
	 * Name of the identity that initiated this job.
	 */
	requesterName?: string;

	/**
	 * Id of the identity that initiated this job.
	 */
	requesterId?: string;

	/**
	 * The type of this job.
	 */
	type?: ConfigHubJobType;

	/**
	 * Name of the tenant where this job was initiated.
	 */
	tenant?: string;

	/**
	 * Whether or not a user can delete the file resulting from this job.
	 */
	userCanDelete?: boolean;

	/**
	 * Additional information related to this job, e.g. an error message.
	 */
	message?: string;

	/**
	 * Timestamp of when this job was created.
	 * ISO 8601 format.
	 */
	created: string;

	/**
	 * Timestamp of when this job was modified.
	 * ISO 8601 format.
	 */
	modified?: string;

	/**
	 * Timestamp of when this job was completed.
	 * ISO 8601 format.
	 */
	completed?: string;

	/**
	 * Timestamp of when this job's artifacts will no longer be available.
	 * ISO 8601 format.
	 */
	expiration?: string;

	/**
	 * The mode type that the job using
	 */
	mode?: string;

	/**
	 * Checks if file exists
	 */
	fileExists?: string;
}

/**
 * Defines the file sync info.
 */
export interface FileSyncInfo {
	id: string;
	name: string;
	s3Key: string;
	completedDate: string;
	status: CloudStorageStatus;
}

/**
 * Defines the included names array for objectOptions.
 */
export interface IncludedNames {
	includedNames: Array<string>;
}
/**
 * Defines the configuration for a partial backup.
 */
export interface ConfigHubBackupOptions {
	includeTypes: Array<string>;
	objectOptions?: { [k: string]: IncludedNames };
}

/**
 * Defines a Configuration Hub backup job as expected to be received from the API.
 */
export interface ConfigHubBackupJob extends ConfigHubJob {
	/**
	 * The type of this job, which is BACKUP.
	 */
	type?: ConfigHubJobType.BACKUP;

	/**
	 * The user defined name for this backup job.
	 */
	name: string;

	/**
	 * The user defined description for this backup job.
	 */
	description?: string;

	/**
	 * The type of backup, either MANUAL or AUTOMATED.
	 */
	backupType: ConfigHubBackupType;

	/**
	 * The type of backup, either MANUAL or AUTOMATED.
	 */
	isPartial: boolean;

	/**
	 * The configuration for a partial backup.
	 */
	backupOptions?: ConfigHubBackupOptions;

	/**
	 * The job options.
	 */
	options?: ConfigHubBackupOptions;

	/**
	 * The amount of objects inside the backup.
	 */
	totalObjectCount: number;

	/**
	 * The possible hydration statuses
	 */
	hydrationStatus: HydrationStatuses;
}

/**
 * Defines a Configuration Hub compare job as expected to be received from the API.
 */
export interface ConfigHubCompareJob extends ConfigHubJob {
	/**
	 * The type of this job, which is COMPARE.
	 */
	type?: ConfigHubJobType.COMPARE;

	/**
	 * The UUID of the source backup of this comparison job.
	 */
	sourceId: string;

	/**
	 * The UUID of the target backup of this comparison job.
	 */
	targetId: string;
}

export enum ConfigHubApprovalStatus {
	PENDING_FOR_APPROVAL = 'PENDING_FOR_APPROVAL',
	APPROVED = 'APPROVED',
	DENIED = 'DENIED'
}

export interface ConfigHubDraftApprovalComment {
	id: string;
	/**
	 * The comment related to the status change
	 */
	comment: string | null;

	/**
	 * The timestamp of when the comment was made
	 * ISO 8601 format.
	 */
	timestamp: string;

	/**
	 * The username of the user that made the request
	 */
	user: string;

	/**
	 * The status that the draft was changed to along with the comment
	 */
	changedToStatus: ConfigHubApprovalStatus;
}

/**
 * Defines a Configuration Hub draft job as expected to be received from the API.
 */
export interface ConfigHubDraftJob extends ConfigHubJob {
	/**
	 * The type of this job, which is CREATE_DRAFT.
	 */
	type?: ConfigHubJobType.DRAFT;

	/**
	 * The sourceTenant if the job is promte type.
	 */
	sourceTenant?: string;

	/**
	 * The UUID of the source backup of this draft job.
	 */
	sourceBackupId: string;

	/**
	 * The name of the source backup of this draft job.
	 */
	sourceBackupName: string;

	/**
	 * The user defined name for this draft job.
	 */
	name: string;

	/**
	 * The approval status for this draft
	 */
	approvalStatus?: ConfigHubApprovalStatus;

	/**
	 * An array of comments related to the approval status
	 */
	approvalComment?: Array<ConfigHubDraftApprovalComment>;
}

/**
 * Defines a Configuration Hub deploy job as expected to be received from the API.
 */
export interface ConfigHubDeployJob extends ConfigHubJob {
	/**
	 * The type of this job, which is CONFIG_DEPLOY_DRAFT.
	 */
	type?: ConfigHubJobType.DEPLOY;

	/**
	 * The UUID of the draft used in this deploy job.
	 */
	draftId: string;

	/**
	 * The name used in the deploy
	 */
	draftName: string;
}

/**
 * Defines a Configuration Hub sync job, which will transfer files to customer S3 buckets.
 */
export interface ConfigHubSyncJob extends ConfigHubJob {
	/**
	 * Map of job ids and their corresponding S3 file names. Optional until FF (PLTCONFHUB_2666_UP_DATE_FILE_SYNC) is completely rolled out.
	 */
	filesSynced?: Map<String, String> | FileSyncInfo;
	/**
	 *  The file sync info. Optional until FF (PLTCONFHUB_2666_UP_DATE_FILE_SYNC) is completely rolled out.
	 */
	fileSyncInfo?: Array<FileSyncInfo>;
}

/**
 * Gets an AlertConfig indicating that there are no files to sync to a customer S3 bucket.
 *
 * @param translateService - provides the translateService for html translation.
 * @returns - Alert config
 */
export function getNoFilesToSyncAlertConfig(translateService: TranslateService): AlertConfig {
	return {
		title: 'CONFIG_HUB.CLOUD_STORAGE_SYNCHRONIZATION_NOT_REQUIRED',
		html: translateService.instantSafeHtml({
			translateKey: 'CONFIG_HUB.YOUR_CONFIG_HUB_FILES_HAVE_ALREADY_BEEN_SYNCED'
		}),
		type: NotificationType.Info,
		dismissible: true,
		duration: 5000,
		align: 'top',
		popup: false
	};
}

/**
 * Gets an AlertConfig indicating that there is already a sync job in progress.
 *
 * @param translateService - provides the translateService for html translation.
 * @returns - Alert config
 */
export function getSyncInProgressAlertConfig(translateService: TranslateService): AlertConfig {
	return {
		title: 'CONFIG_HUB.CLOUD_STORAGE_SYNCHRONIZATION_NOT_ALLOWED',
		html: translateService.instantSafeHtml({
			translateKey: 'CONFIG_HUB.A_SYNCHRONIZATION_JOB_IS_ALREADY_IN_PROGRESS'
		}),
		type: NotificationType.Info,
		dismissible: true,
		duration: 5000,
		align: 'top',
		popup: false
	};
}

/**
 * Gets an AlertConfig indicating that a sync job succeeded.
 *
 * @param translateService - provides the translateService for html translation.
 * @returns - Alert config
 */
export function getSyncSuccessAlertConfig(translateService: TranslateService): AlertConfig {
	return {
		title: 'CONFIG_HUB.CLOUD_STORAGE_SYNCHRONIZATION_STARTED',
		html: translateService.instantSafeHtml({
			translateKey: 'CONFIG_HUB.YOUR_CONFIG_HUB_FILES_ARE_BEING_SYNCED'
		}),
		type: NotificationType.Success,
		dismissible: true,
		duration: 5000,
		align: 'top',
		popup: false
	};
}

/**
 * Message object for warnings and errors resulting from an import.
 *
 * Mirrored from saas-sp-config.
 * See: https://github.com/acme/saas-sp-config/blob/master/sp-config-lib/src/main/java/com/acme/config/export/Message.java
 */
export interface Message {
	/**
	 * The message key.
	 */
	key: string;

	/**
	 * The message text.
	 */
	text: string;

	/**
	 * A map of message details.
	 */
	detail: {
		[key: string]: any;
	};
}

/**
 * Result returned from an import. This will be returned from an individual target service.
 *
 * Mirrored from saas-sp-config.
 * See: https://github.com/acme/saas-sp-config/blob/master/sp-config-lib/src/main/java/com/acme/config/export/ObjectImportResult.java
 */
export interface ObjectImportResult {
	/**
	 * Informational messages from the import.
	 */
	infos: Message[];

	/**
	 * Warning from the import.
	 */
	warnings: Message[];

	/**
	 * Errors from the import.
	 */
	errors: Message[];

	/**
	 * List of references to objects that got created as a result of this import.
	 */
	importedObjects: BaseReferenceDto[];
}

/**
 * Results from a deployment.
 */
export interface ConfigHubDeployResults {
	/**
	 * Map of results from each objectType.
	 */
	results: {
		[objectType: string]: ObjectImportResult;
	};

	/**
	 * The export job id.
	 */
	exportJobId: string;
}

/**
 * Historical Draft Results from a deployment.
 */
export interface ConfigHubDraftResults {
	/**
	 * The export job id.
	 */
	id: string;

	/**
	 * The Draft name
	 */
	name: string;

	/**
	 * Map of results from each objectType.
	 */
	object: {
		[objectType: string]: ConfigHubDraftJob;
	};
}
