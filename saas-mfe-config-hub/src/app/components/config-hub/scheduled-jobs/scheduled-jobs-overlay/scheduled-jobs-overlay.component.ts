/*
 * Copyright (C) 2025 Acme Technologies, Inc.  All rights reserved.
 */
import { Component, EventEmitter, Input, OnChanges, Output, SimpleChanges } from '@angular/core';
import { UntypedFormGroup } from '@angular/forms';

import { BehaviorSubject, take } from 'rxjs';

import { AlertsToasterService } from '@acme-priv/armada-angular/src/acme/angular/components/alert';
import { TranslateService } from '@acme-priv/armada-angular/src/acme/angular/l10n/translation';

import {
	ConfigHubBackupJob,
	ConfigHubJobType,
	ConfigHubScheduledJob,
	ConfigHubScheduledJobPayload,
	ScheduleDeployFormControlKeys,
	getScheduledJobSuccessAlertConfig
} from '../../shared/models';
import { ConfigHubScheduledJobsApiService } from '../../shared/services/scheduled-jobs/scheduled-jobs.api.service';

@Component({
	selector: 'app-config-hub-scheduled-jobs-overlay',
	templateUrl: './scheduled-jobs-overlay.component.html',
	styleUrl: './scheduled-jobs-overlay.component.scss'
})
export class ConfigHubScheduledJobsOverlayComponent implements OnChanges {
	/**
	 * Indicates whether the overlay is displayed or not.
	 */
	@Input() isOverlayOpen: boolean;

	/**
	 * Indicates whether the overlay is on edit mode or not.
	 */
	@Input() isEditMode: boolean;

	/**
	 * The selected backup job
	 */
	@Input() selectedItem: any;

	/**
	 * Event emitter for dismissing the overlay.
	 */
	@Output() onDismiss = new EventEmitter<boolean>();

	/**
	 * Event emitter for sending the updated job.
	 */
	@Output() onUpdateJob = new EventEmitter<ConfigHubScheduledJob | ConfigHubBackupJob>();

	/**
	 * Variable to keep track of showing form errors
	 */
	public submitAttempted$ = new BehaviorSubject<boolean>(false);

	/**
	 * Form group for creating a new Scheduled Job
	 */
	public scheduledJobFormGroup: UntypedFormGroup;

	/**
	 * Latest cron expression value
	 */
	public cronExpression: string;

	/**
	 * Current timezone
	 */
	public currentTimezone: number;

	public isFormPopulated = false;

	/**
	 * Loading indicator
	 */
	public loading = false;

	/**
	 * Job Types enum
	 */
	public JobTypes = ConfigHubJobType;

	constructor(
		private scheduledJobsApiService: ConfigHubScheduledJobsApiService,
		private translateService: TranslateService,
		private alertsToasterService: AlertsToasterService
	) {
		this.currentTimezone = -new Date().getTimezoneOffset() / 60;
	}

	/**
	 * Handling of the OnChange event to track edit mode
	 */
	ngOnChanges(changes: SimpleChanges) {
		if (changes.isEditMode?.currentValue) {
			this.loading = true;
			this.isEditMode = changes.isEditMode.currentValue;
		}
	}

	/**
	 * Handle dismissing the overlay
	 */
	public handleDismiss(): void {
		if (this.isEditMode) {
			this.onUpdateJob.emit(this.selectedItem);
		}

		this.onDismiss.emit();

		this.isFormPopulated = false;
		this.scheduledJobFormGroup = null;
		this.cronExpression = null;
		this.selectedItem = null;
	}

	/**
	 * Handle submitting the form
	 */
	public handleSubmit(): void {
		if (this.scheduledJobFormGroup.valid) {
			this.loading = true;
			this.submitAttempted$.next(true);

			if (!this.isEditMode) {
				if (this.getScheduledJobType() === ConfigHubJobType.BACKUP) {
					this.handleCreateScheduledBackupJob();
				}
			} else {
				if (this.getScheduledJobType() === ConfigHubJobType.BACKUP) {
					this.handleEditScheduledBackupJob();
				}

				if (this.getScheduledJobType() === ConfigHubJobType.DEPLOY) {
					this.handleEditScheduledDeployJob();
				}
			}
		}
	}

	/**
	 * Create a scheduled backup job
	 */
	private handleCreateScheduledBackupJob(): void {
		const payload: ConfigHubScheduledJobPayload = {
			jobType: this.selectedItem.type,
			cronString: this.cronExpression,
			content: {
				backupOptions: this.selectedItem.options,
				name: this.scheduledJobFormGroup.value.name
			}
		};

		this.scheduledJobsApiService
			.createScheduledJob(payload)
			.pipe(take(1))
			.subscribe({
				next: () => {
					this.loading = false;
					this.alertsToasterService.open(
						getScheduledJobSuccessAlertConfig(this.translateService, 'CONFIG_HUB.SCHEDULED_JOB_CREATED')
					);
					this.handleDismiss();
				},
				error: () => {
					this.loading = false;
				}
			});
	}

	/**
	 * Edit a scheduled backup job
	 */
	private handleEditScheduledBackupJob(): void {
		const payload: ConfigHubScheduledJobPayload = {
			jobType: this.selectedItem.jobType,
			cronString: this.cronExpression,
			content: {
				backupOptions: this.selectedItem.content.backupOptions,
				name: this.scheduledJobFormGroup.value.name
			}
		};

		const jobId = this.selectedItem.id;
		this.scheduledJobsApiService
			.editScheduledJob(payload, jobId)
			.pipe(take(1))
			.subscribe({
				next: () => {
					this.loading = false;
					this.alertsToasterService.open(
						getScheduledJobSuccessAlertConfig(this.translateService, 'CONFIG_HUB.SCHEDULED_JOB_UPDATED')
					);
					this.selectedItem = {
						...this.selectedItem,
						cronString: payload.cronString,
						content: {
							name: payload.content.name,
							backupOptions: payload.content.backupOptions
						}
					};
					this.handleDismiss();
				},
				error: () => {
					this.loading = false;
				}
			});
	}

	/**
	 * Handle editing a scheduled deploy job
	 */
	private handleEditScheduledDeployJob(): void {
		const date = this.scheduledJobFormGroup.get(ScheduleDeployFormControlKeys.DATE).value;
		const time = this.scheduledJobFormGroup.get(ScheduleDeployFormControlKeys.TIME).value;

		const startTime = new Date(`${date.inputValue}, ${time}`).toISOString();

		const payload = {
			jobType: this.selectedItem.jobType,
			startTime
		};

		this.scheduledJobsApiService
			.editScheduledJob(payload, this.selectedItem.id)
			.pipe(take(1))
			.subscribe({
				next: () => {
					this.loading = false;
					this.alertsToasterService.open(
						getScheduledJobSuccessAlertConfig(this.translateService, 'CONFIG_HUB.SCHEDULED_JOB_UPDATED')
					);
					this.selectedItem = {
						...this.selectedItem,
						startTime: payload.startTime
					};
					this.handleDismiss();
				},
				error: () => {
					this.loading = false;
				}
			});
	}

	/**
	 * Populate the form with the selected scheduled job
	 */
	public populateForm(): void {
		if (this.getScheduledJobType() === ConfigHubJobType.BACKUP) {
			this.scheduledJobFormGroup.patchValue({
				name: this.selectedItem.content.name
			});
			this.cronExpression = this.selectedItem.cronString;
		}
	}

	/**
	 * Handle getting a new form value
	 */
	public handleFormValueChange({ form, cronExpression }): void {
		this.scheduledJobFormGroup = form;

		if (this.getScheduledJobType() === ConfigHubJobType.BACKUP) {
			this.cronExpression = cronExpression;
		}

		if (this.isEditMode && !this.isFormPopulated) {
			this.isFormPopulated = true;
			this.populateForm();
		}
		this.loading = false;
	}

	/**
	 * Check scheduled job type
	 */
	public getScheduledJobType(): ConfigHubJobType {
		return this.selectedItem?.type ?? this.selectedItem?.jobType;
	}
}
