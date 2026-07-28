/*
 * Copyright (C) 2024 Acme Technologies, Inc.  All rights reserved.
 */
import { DatePipe } from '@angular/common';
import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup } from '@angular/forms';
import { Router } from '@angular/router';

import { take } from 'rxjs';

import { AlertService } from '@acme-priv/armada-angular/src/acme/angular/components/alert';
import { FieldValidators } from '@acme-priv/armada-angular/src/acme/angular/components/form';
import { TranslateService } from '@acme-priv/armada-angular/src/acme/angular/l10n/translation';

import { CONFIG_HUB_URL, ConfigHubChildRoutes } from '../../config-hub.model';
import { ConfigHubJobStatus, ConfigHubPatchOperations } from '../../shared/models';
import {
	CloudStorageInfoPatchableFields,
	ConfigHubAdvancedSettings,
	getCloudStorageInvalidBucketNameAlertConfig,
	getCloudStorageSavedAlertConfig,
	getCloudStorageSyncEnabledSuccessfulAlertConfig,
	getCloudStorageSyncSuccessfulAlertConfig,
	getCloudStorageTestSuccessfulAlertConfig
} from '../../shared/models/cloud-storage.model';
import { ConfigHubAdvancedSettingsApiService } from '../../shared/services/advanced-settings/advanced-settings.service';
import { ConfigHubCloudStorageSyncApiService } from '../../shared/services/cloud-storage/cloud-storage-sync.service';
import { Operation as JSONPatchOperation } from 'fast-json-patch';

@Component({
	selector: 'app-cloud-storage',
	templateUrl: './cloud-storage.component.html',
	styleUrls: ['./cloud-storage.component.scss'],
	changeDetection: ChangeDetectionStrategy.OnPush
})
export class ConfigHubCloudStorageComponent implements OnInit {
	/**
	 * Controls the loading overlay
	 */
	public loading = false;

	/**
	 * The name of the tenant's S3 bucket
	 */
	public bucketName: string = null;

	/**
	 * Whether or not the tenant's S3 bucket is enabled
	 */
	public isEnabled = false;

	/**
	 * Whether the cloud storage configuration has been saved to the database
	 */
	public infoWasSaved = false;

	/**
	 * The latest sync job status
	 */
	public latestSyncJobStatus: ConfigHubJobStatus = ConfigHubJobStatus.NOT_STARTED;

	/**
	 * 	The timestamp of the last sync job
	 */
	public lastSyncJobTimestamp: Date;

	/**
	 * Cloud Storage form group
	 */
	public cloudStorageForm: FormGroup;

	constructor(
		private alertService: AlertService,
		private translateService: TranslateService,
		private router: Router,
		private formBuilder: FormBuilder,
		private changeDetectorRef: ChangeDetectorRef,
		private configHubAdvancedSettingsApiService: ConfigHubAdvancedSettingsApiService,
		private cloudStorageSyncService: ConfigHubCloudStorageSyncApiService,
		private datePipe: DatePipe
	) {}

	/**
	 * Initializes the cloud storage form, and fetches the tenant's cloud storage config
	 */
	ngOnInit(): void {
		this.cloudStorageForm = this.formBuilder.group({
			bucketName: [
				'',
				[],
				[(formControl: AbstractControl<any, any>) => FieldValidators.enforceMaxLength(formControl, 65)]
			]
		});
		this.fetchCloudStorageInfo();
	}

	/**
	 * Fetches the tenant's cloud storage config, and populates the form if the config exists
	 */
	public fetchCloudStorageInfo(): void {
		this.loading = true;
		this.bucketName = null;
		this.isEnabled = false;
		this.infoWasSaved = false;

		this.configHubAdvancedSettingsApiService
			.getCloudStorage()
			.pipe(take(1))
			.subscribe({
				next: cloudStorage => {
					this.isEnabled = cloudStorage.cloudStorageEnabled;
					this.bucketName = cloudStorage.bucketName;
					this.cloudStorageForm.setValue({ bucketName: cloudStorage.bucketName ?? '' });
					this.infoWasSaved = true;
					this.changeDetectorRef.detectChanges();
				},
				error: () => {
					this.cloudStorageForm.setValue({ bucketName: '' });
					this.changeDetectorRef.detectChanges();
				}
			});

		this.cloudStorageSyncService
			.getLatestSyncJob()
			.pipe(take(1))
			.subscribe({
				next: job => {
					this.latestSyncJobStatus = job.status;
					this.lastSyncJobTimestamp = new Date(job.created);
					this.loading = false;
					this.changeDetectorRef.detectChanges();
				},
				error: () => {
					this.loading = false;
					this.changeDetectorRef.detectChanges();
				}
			});
	}

	/**
	 * Patches individual fields of cloud storage info
	 */
	private patchCloudStorage(field: string, replaceValue: string | boolean): void {
		this.configHubAdvancedSettingsApiService
			.patchCloudStorage(this.getPatchOperationPayload(field, replaceValue))
			.pipe(take(1))
			.subscribe({
				next: cloudStorageInfo => {
					this.isEnabled = cloudStorageInfo.cloudStorageEnabled;
					this.alertService.open(getCloudStorageSyncEnabledSuccessfulAlertConfig());
				},
				error: () => {
					this.changeDetectorRef.detectChanges();
				}
			});
	}

	/**
	 * Saves the cloud storage config and displays a notification if the save was successful
	 */
	public saveCloudStorageInfo(testConnection = false): void {
		this.loading = true;

		const payload: ConfigHubAdvancedSettings = {
			bucketName: this.bucketName,
			cloudStorageEnabled: this.bucketName ? this.isEnabled : false
		};

		const response = this.infoWasSaved
			? this.configHubAdvancedSettingsApiService.updateCloudStorage(payload).pipe(take(1))
			: this.configHubAdvancedSettingsApiService.createCloudStorage(payload).pipe(take(1));

		response.subscribe({
			next: cloudStorageInfo => {
				this.isEnabled = cloudStorageInfo.cloudStorageEnabled;
				this.bucketName = cloudStorageInfo.bucketName;
				this.infoWasSaved = true;
				this.changeDetectorRef.detectChanges();

				if (testConnection) {
					this.testCloudStorageConnection();
				} else {
					this.loading = false;
					this.alertService.open(getCloudStorageSavedAlertConfig(this.translateService));
				}
			},
			error: () => {
				this.loading = false;
				this.changeDetectorRef.detectChanges();
			}
		});
	}

	/**
	 * Tests the tenant's cloud storage config and displays a notification if the test was successful
	 */
	public testCloudStorageConnection(): void {
		this.loading = true;
		this.configHubAdvancedSettingsApiService
			.testCloudStorageConnection()
			.pipe(take(1))
			.subscribe({
				next: () => {
					this.loading = false;
					this.alertService.open(getCloudStorageTestSuccessfulAlertConfig(this.translateService));
					this.changeDetectorRef.detectChanges();
				},
				error: () => {
					this.loading = false;
					this.changeDetectorRef.detectChanges();
				}
			});
	}

	/**
	 * Sync the files, this method will be implemented later
	 */
	public syncFiles(): void {
		this.loading = true;
		this.cloudStorageSyncService
			.createSyncJob()
			.pipe(take(1))
			.subscribe({
				next: () => {
					this.loading = false;
					this.alertService.open(getCloudStorageSyncSuccessfulAlertConfig());
					this.changeDetectorRef.detectChanges();
				},
				error: () => {
					this.loading = false;
					this.changeDetectorRef.detectChanges();
				}
			});
	}

	/**
	 * Prevents the config from being saved if the form is invalid
	 */
	public handleSaveCloudStorage(testConnection: boolean): void {
		if (this.cloudStorageForm.valid) {
			this.bucketName = (<string>this.cloudStorageForm.get('bucketName').value).trim();
			this.saveCloudStorageInfo(testConnection);
		} else {
			this.alertService.open(getCloudStorageInvalidBucketNameAlertConfig(this.translateService));
		}
	}

	/**
	 * Handles the Enabled toggle switch
	 */
	public handleToggleChange(event: boolean): void {
		this.patchCloudStorage(CloudStorageInfoPatchableFields.CLOUD_STORAGE_ENABLED, event);
	}

	/**
	 * Validates the bucket name
	 */
	public validBucketName(allowEmptyBucketName = false): boolean {
		if (allowEmptyBucketName) {
			return this.cloudStorageForm.valid;
		}

		return this.cloudStorageForm.valid && !!(<string>this.cloudStorageForm.get('bucketName').value).trim();
	}

	/**
	 * Returns to the backup list page
	 */
	public returnToBackupList(): void {
		this.router.navigateByUrl(`${CONFIG_HUB_URL}/${ConfigHubChildRoutes.BACKUPS.route}`);
	}

	/**
	 * Returns a formatted date string based on the last sync job timestamp and the latest sync job status.
	 *
	 * @return {string} The formatted date string. If there is no sync job timestamp, it returns "No Sync Attempts".
	 * If the latest sync job status is not complete, it returns "Last Sync Attempt: " followed by the formatted timestamp.
	 * Otherwise, it returns "Last Sync: " followed by the formatted timestamp. The timestamp is formatted as "EEE MMM dd yyyy HH:mm:ss"
	 * and appended with " CST".
	 */
	public returnFormattedDate(): string {
		const prefix =
			this.latestSyncJobStatus !== ConfigHubJobStatus.COMPLETE
				? this.translateService.instant('CONFIG_HUB.LAST_SYNC_ATTEMPT')
				: this.translateService.instant('CONFIG_HUB.LAST_SYNC');

		const date = this.lastSyncJobTimestamp
			? this.datePipe.transform(this.lastSyncJobTimestamp, 'EEE MMM dd yyyy HH:mm:ss')
			: this.translateService.instant('CONFIG_HUB.NO_SYNC_ATTEMPTS');

		return `${prefix} ${date} CST`;
	}

	/**
	 * A function to return the last sync job status.
	 *
	 * @return {String} The last sync job status with a specific suffix based on the status.
	 */
	public returnLastSyncJobStatus(): String {
		if (this.latestSyncJobStatus === ConfigHubJobStatus.COMPLETE) {
			return `${this.translateService.instant('CONFIG_HUB.COMPLETE')}:  ${this.translateService.instant('CONFIG_HUB.ALL_FILES_SYNCED')}`;
		}

		if (this.latestSyncJobStatus === ConfigHubJobStatus.FAILED) {
			return `${this.translateService.instant('CONFIG_HUB.FAILED')}:  ${this.translateService.instant('CONFIG_HUB.NO_FILES_SYNCED')}`;
		}

		if (this.latestSyncJobStatus === ConfigHubJobStatus.NOT_STARTED) {
			return `${this.translateService.instant('CONFIG_HUB.NOT_STARTED')}:  ${this.translateService.instant('CONFIG_HUB.NOT_ALL_FILES_SYNCED')}`;
		}
		return `${this.latestSyncJobStatus}:  ${this.translateService.instant('CONFIG_HUB.NO_LAST_SYNC_STATUS_FOUND')}`;
	}

	/**
	 * Returns the color class for the badge that represents the last sync job status.
	 *
	 * @return {string} The color class for the badge. Possible values are 's2', 's4', or 's3'.
	 */
	public returnBadgeLastSyncJobStatusColor(): string {
		if (this.latestSyncJobStatus === ConfigHubJobStatus.COMPLETE) {
			return 's2l';
		}
		if (this.latestSyncJobStatus === ConfigHubJobStatus.FAILED) {
			return 's4l';
		}
		return 's3l';
	}

	/**
	 * Prepares payload for patch operation
	 * @param {string} field to be  updated
	 * @param {string | boolean} replaceValue to be replaced
	 * @returns {Array<JSONPatchOperation>}
	 */
	private getPatchOperationPayload(field: string, replaceValue: string | boolean): Array<JSONPatchOperation> {
		return [
			{
				op: ConfigHubPatchOperations.REPLACE,
				path: `/${field}`,
				value: replaceValue
			}
		];
	}
}
