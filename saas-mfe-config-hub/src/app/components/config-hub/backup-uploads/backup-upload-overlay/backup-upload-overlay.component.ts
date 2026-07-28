/*
 * Copyright (C) 2024 Acme Technologies, Inc.  All rights reserved.
 */
import { ChangeDetectorRef, Component, EventEmitter, OnDestroy, OnInit, Output } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';

import { Subject, takeUntil } from 'rxjs';

import { FieldValidators } from '@acme-priv/armada-angular/src/acme/angular/components/form';
import { TranslateService } from '@acme-priv/armada-angular/src/acme/angular/l10n/translation';

import { ConfigHubBackupJob } from '../../shared/models';
import { ConfigHubBackupsApiService } from '../../shared/services';

@Component({
	selector: 'app-config-hub-backup-upload-overlay',
	templateUrl: './backup-upload-overlay.component.html',
	styleUrls: ['./backup-upload-overlay.component.scss']
})
export class ConfigHubBackupUploadOverlayComponent implements OnInit, OnDestroy {
	/**
	 * Close overlay event
	 */
	@Output() onClose = new EventEmitter<ConfigHubBackupJob | null>();

	/**
	 * Upload backup form group
	 */
	public formGroup: FormGroup;

	/**
	 * Loading indicator
	 */
	public loading = false;

	/**
	 * Maximum size in bytes of uploaded files (50MB)
	 */
	public maximumSize = 1024 * 1024 * 50;

	/**
	 * The allowed file extension for uploaded files
	 */
	public fileExtension = ['.json'];

	/**
	 * Subject to unsubscribe on destroy.
	 */
	private unsubscribe$ = new Subject<void>();

	BACKUP_JOB_NAME_MAX_LENGTH: 100;

	/**
	 * Uploaded File control getter
	 */
	get backupFileUploadField() {
		return this.formGroup.get('backupFileUpload');
	}

	/**
	 * Uploaded File Name control getter
	 */
	get backupNameUploadField() {
		return this.formGroup.get('backupName');
	}

	constructor(
		private formBuilder: FormBuilder,
		private translateService: TranslateService,
		private changeDetectorRef: ChangeDetectorRef,
		private configHubBackupApiService: ConfigHubBackupsApiService
	) {}

	/**
	 * Initialize component
	 */
	ngOnInit(): void {
		this.initializeForm();
	}

	/**
	 * Clean up when the instance is destroyed.
	 */
	public ngOnDestroy(): void {
		this.unsubscribe$.next();
		this.unsubscribe$.complete();
	}

	/**
	 * Handles overlay close.
	 */
	public handleDismiss(backupJob?: ConfigHubBackupJob): void {
		this.onClose.emit(backupJob);
	}

	/**
	 * Handles overlay close.
	 */
	public handleSubmit(): void {
		if (this.formGroup.valid) {
			this.loading = true;
			const file = this.backupFileUploadField.value[0].file;
			const backupName = this.backupNameUploadField.value;
			this.configHubBackupApiService.uploadBackup(file, backupName).subscribe({
				next: (data: ConfigHubBackupJob) => {
					this.loading = false;
					this.handleDismiss(data);
				},
				error: () => {
					this.loading = false;
					this.handleDismiss();
				}
			});
		}
	}

	/**
	 * Initializes the form
	 */
	private initializeForm(): void {
		this.formGroup = this.formBuilder.group({
			backupFileUpload: [
				null,
				[],
				[
					control => FieldValidators.required(control),
					control => FieldValidators.enforceJsonFormatAndExtension(control, this.translateService),
					control =>
						FieldValidators.enforceFileExtensions(control, this.fileExtension, this.translateService),
					control => FieldValidators.enforceMaxFileSize(control, this.maximumSize)
				]
			],
			backupName: [null, [], [control => FieldValidators.required(control)]]
		});

		this.formGroup.valueChanges.pipe(takeUntil(this.unsubscribe$)).subscribe(() => {
			this.changeDetectorRef.detectChanges();
		});
	}
}
