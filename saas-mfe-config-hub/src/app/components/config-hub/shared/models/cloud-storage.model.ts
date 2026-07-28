/*
 * Copyright (C) 2024 Acme Technologies, Inc.  All rights reserved.
 */
import { AlertConfig } from '@acme-priv/armada-angular/src/acme/angular/components/alert';
import { NotificationType } from '@acme-priv/armada-angular/src/acme/angular/components/notification-header';
import { TranslateService } from '@acme-priv/armada-angular/src/acme/angular/l10n/translation';

export interface ConfigHubAdvancedSettings {
	/**
	 * Name of the tenant where this job was initiated.
	 */
	tenant?: string;

	/**
	 * Name of the S3 bucket to where Config Hub files will be copied.
	 */
	bucketName: string;

	/**
	 * Whether or not cloud storage is enabled for the tenant.
	 */
	cloudStorageEnabled: boolean;

	/**
	 * Whether or not draft approvals are enabled for the tenant.
	 */
	approvalsEnabled?: boolean;

	/**
	 * Timestamp of when this cloud storage entry was created.
	 * ISO 8601 format.
	 */
	created?: string;

	/**
	 * Timestamp of when this cloud storage entry was modified.
	 * ISO 8601 format.
	 */
	modified?: string;
}

export interface ConfigHubAdvancedSettingsApiResponse<T> {
	body: T;
}

/**
 * Valid cloud storage info patchable fields
 */
export enum CloudStorageInfoPatchableFields {
	BUCKET_NAME = 'bucketName',
	CLOUD_STORAGE_ENABLED = 'cloudStorageEnabled',
	APPROVALS_ENABLED = 'approvalsEnabled'
}

/**
 * Gets an AlertConfig indicating that no cloud storage config was found in sp_config_s3_information
 *
 * @param translateService - provides the translateService for html translation.
 * @returns - Alert config indicating that no cloud storage config was found.
 */
export function getNoCloudStorageFoundAlertConfig(translateService: TranslateService): AlertConfig {
	return {
		title: 'CONFIG_HUB.CLOUD_STORAGE_CONFIGURATION_NOT_FOUND',
		html: translateService.instantSafeHtml({
			translateKey: 'CONFIG_HUB.YOU_HAVE_NOT_SAVED_S3_DETAILS'
		}),
		type: NotificationType.Info,
		dismissible: true,
		duration: 5000,
		align: 'top',
		popup: true
	};
}

/**
 * Gets an AlertConfig indicating that cloud storage config was found in sp_config_s3_information
 *
 * @param translateService - provides the translateService for html translation.
 * @returns - Alert config indicating that cloud storage config was found.
 */
export function getCloudStorageFoundAlertConfig(translateService: TranslateService): AlertConfig {
	return {
		title: 'CONFIG_HUB.CLOUD_STORAGE_CONFIGURATION_FOUND',
		html: translateService.instantSafeHtml({
			translateKey: 'CONFIG_HUB.YOU_S3_BUCKET_DETAILS_FOUND'
		}),
		type: NotificationType.Info,
		dismissible: true,
		duration: 5000,
		align: 'top',
		popup: true
	};
}

/**
 * Gets an AlertConfig indicating that cloud storage config was saved
 *
 * @param translateService - provides the translateService for html translation.
 * @returns - Alert config indicating that cloud storage config was saved.
 */
export function getCloudStorageSavedAlertConfig(translateService: TranslateService): AlertConfig {
	return {
		title: 'CONFIG_HUB.CLOUD_STORAGE_CONFIGURATION_SAVED',
		html: translateService.instantSafeHtml({
			translateKey: 'CONFIG_HUB.YOUR_S3_BUCKET_DETAILS_SAVED'
		}),
		type: NotificationType.Success,
		dismissible: true,
		duration: 5000,
		align: 'top',
		popup: true
	};
}

/**
 * Gets an AlertConfig indicating that the name of the bucket is invalid
 *
 * @param translateService - provides the translateService for html translation.
 * @returns - Alert config indicating that the name of the bucket is invalid
 */
export function getCloudStorageInvalidBucketNameAlertConfig(translateService: TranslateService): AlertConfig {
	return {
		title: 'CONFIG_HUB.CLOUD_STORAGE_INVALID_BUCKET_NAME',
		html: translateService.instantSafeHtml({
			translateKey: 'CONFIG_HUB.YOUR_S3_BUCKET_IS_INVALID'
		}),
		type: NotificationType.Error,
		dismissible: true,
		duration: 5000,
		align: 'top',
		popup: true
	};
}

/**
 * Gets an AlertConfig indicating that cloud storage connection test succeeded.
 *
 * @param translateService - provides the translateService for html translation.
 * @returns - Alert config indicating that cloud storage connection test succeeded.
 */
export function getCloudStorageTestSuccessfulAlertConfig(translateService: TranslateService): AlertConfig {
	return {
		title: 'CONFIG_HUB.CLOUD_STORAGE_TEST_SUCCESSFUL',
		html: translateService.instantSafeHtml({
			translateKey: 'CONFIG_HUB.A_TEST_FILE_DEPOSITED_SUCCESSFULLY'
		}),
		type: NotificationType.Success,
		dismissible: true,
		duration: 5000,
		align: 'top',
		popup: true
	};
}

/**
 * Gets an AlertConfig indicating that cloud storage enabled status was updated.
 *
 * @returns - Alert config indicating that cloud storage connection test succeeded.
 */
export function getCloudStorageSyncEnabledSuccessfulAlertConfig(): AlertConfig {
	return {
		title: 'CONFIG_HUB.CLOUD_STORAGE_ENABLED_UPDATE_SUCCESSFUL',
		type: NotificationType.Success,
		dismissible: true,
		duration: 5000,
		align: 'top',
		popup: true
	};
}

/**
 * Gets an AlertConfig indicating that cloud storage sync was initiated.
 *
 * @param {TranslateService} translateService - provides the translateService for html translation.
 * @return {AlertConfig} Alert config indicating that cloud storage sync was initiated.
 */
export function getCloudStorageSyncSuccessfulAlertConfig(): AlertConfig {
	return {
		title: 'CONFIG_HUB.SYNCHRONIZATION_HAS_STARTED',
		type: NotificationType.Success,
		dismissible: true,
		duration: 5000,
		align: 'top',
		popup: true
	};
}
