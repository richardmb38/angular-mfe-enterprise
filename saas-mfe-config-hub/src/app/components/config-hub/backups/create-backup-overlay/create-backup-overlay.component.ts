/*
 * Copyright (C) 2023 Acme Technologies, Inc.  All rights reserved.
 */
import {
	ChangeDetectionStrategy,
	ChangeDetectorRef,
	Component,
	EventEmitter,
	OnDestroy,
	OnInit,
	Output
} from '@angular/core';
import { AbstractControl, UntypedFormBuilder, UntypedFormGroup } from '@angular/forms';

import { Subject, map, take } from 'rxjs';

import { FieldValidators } from '@acme-priv/armada-angular/src/acme/angular/components/form';
import { ModalService } from '@acme-priv/armada-angular/src/acme/angular/components/modal';
import { NotificationType } from '@acme-priv/armada-angular/src/acme/angular/components/notification-header';

import { ConfigHubBackupObjectType, IncludedNames } from '../../shared/models';
import { ConfigHubConfigObjectsService } from '../../shared/services/config-objects/config-objects.service';
import { BackupOverlayResult } from '../backup-list.model';

/**
 * Configuration Hub Backup Creation Overlay
 *
 * Displays a list of objects to include in the backup
 */
@Component({
	selector: 'app-config-hub-create-backup-overlay',
	templateUrl: './create-backup-overlay.component.html',
	styleUrls: ['./create-backup-overlay.component.scss'],
	changeDetection: ChangeDetectionStrategy.OnPush
})
export class ConfigHubCreateBackupOverlayComponent implements OnInit, OnDestroy {
	/**
	 * Emits an event when the overlay is closed
	 */
	@Output() onDismiss = new EventEmitter<BackupOverlayResult>();

	/**
	 * The maximum number of characters for a backup job name.
	 */
	public readonly BACKUP_JOB_NAME_MAX_LENGTH = 50;

	/**
	 * Create Backup form group.
	 */
	public createBackupForm: UntypedFormGroup;

	/**
	 * Emits an event when the user tries to submit the form.
	 */
	public submitAttempted = new EventEmitter<void>();

	/**
	 * Whether the overlay is currently loading new data.
	 */
	public loading = false;

	/**
	 * List of configuration object types
	 */
	public backupObjectList: ConfigHubBackupObjectType[];

	/**
	 * A list of the selected object types
	 */
	public selectedObjectTypes: string[] = [];

	/**
	 * A collection of object names to be included in a partial backup, organized by object type.
	 */
	public objectOptions: Map<string, IncludedNames> = new Map<string, IncludedNames>();

	/**
	 * Subject to unsubscribe on destroy.
	 */
	private unsubscribe$ = new Subject<void>();

	constructor(
		private formBuilder: UntypedFormBuilder,
		private changeDetectorRef: ChangeDetectorRef,
		private configHubConfigObjectsService: ConfigHubConfigObjectsService,
		private modalService: ModalService
	) {}

	/**
	 * Initialization of the component.
	 */
	ngOnInit(): void {
		this.createBackupForm = this.formBuilder.group({
			backupName: [
				'',
				[],
				[
					FieldValidators.required,
					(formControl: AbstractControl) =>
						FieldValidators.enforceMaxLength(formControl, this.BACKUP_JOB_NAME_MAX_LENGTH)
				]
			]
		});
		this.loadBackupObjects();
	}

	/**
	 * Clean up when the instance is destroyed.
	 */
	public ngOnDestroy(): void {
		this.unsubscribe$.next();
		this.unsubscribe$.complete();
	}

	/**
	 * Handles when the overlay is dismissed, either via button click or outside dismissal.
	 * @param backupName - The name of the new backup to be emitted by the onDismiss.
	 */
	public handleDismiss(backupName = ''): void {
		const options = this.getFilteredOptionsBySelected();
		const isPartialBackup =
			this.selectedObjectTypes.length !== this.backupObjectList.length || Array.from(options).length > 0;
		this.createBackupForm.reset();
		this.onDismiss.emit({
			backupName,
			selectedObjectTypes: this.selectedObjectTypes,
			options,
			isPartialBackup
		});
	}

	/**
	 * Handles when a user attempts to initiate a backup.
	 */
	public async handleCreateBackup(): Promise<void> {
		this.submitAttempted.emit();

		const continueWithCreation = await this.validateSelectedOptions();

		if (this.createBackupForm.valid && this.selectedObjectTypes.length > 0 && continueWithCreation) {
			const backupName = <string>this.createBackupForm.get('backupName')?.value || '';
			this.handleDismiss(backupName);
		}
	}

	/**
	 * Retrieves the list of object that are going to be included in the backup
	 */
	private loadBackupObjects(): void {
		this.loading = true;

		this.configHubConfigObjectsService
			.getObjectTypes(true)
			.pipe(
				take(1),
				map(objectList => objectList.filter(object => object.exportable || !!object.exportUrl))
			)
			.subscribe({
				next: objectList => {
					this.backupObjectList = objectList;
					this.loading = false;
					this.changeDetectorRef.detectChanges();
				},
				error: () => (this.loading = false)
			});
	}

	/**
	 * Returns a filtered map of object options with includedNames
	 * @returns {objectOptions} filtered
	 *
	 */
	private getFilteredOptionsBySelected(): Map<string, IncludedNames> {
		const objectOptions = Array.from(this.objectOptions);
		return new Map(
			objectOptions.filter(([key, value]) => this.selectedObjectTypes.includes(key) && value.includedNames.length)
		);
	}

	/**
	 * Returns a promise that resolves to a boolean
	 * indicating if backup creation should continue with unselected options
	 * @returns {boolean}
	 *
	 */
	private validateSelectedOptions(): Promise<boolean> {
		const objectOptions = Array.from(this.objectOptions);
		const hasUnselected = objectOptions.some(
			([key, value]) =>
				value.includedNames.length && !this.selectedObjectTypes.find(objectType => objectType === key)
		);

		if (hasUnselected) {
			return this.modalService.open({
				title: 'CONFIG_HUB.UNSELECTED_OBJECTS_WARNING',
				message: 'CONFIG_HUB.ITEMS_WITH_NAMES_NOT_SELECTED',
				type: NotificationType.Warning,
				footer: [
					{ label: 'CONFIG_HUB.CREATE', value: true, type: 'primary' },
					{ label: 'CONFIG_HUB.CANCEL', value: false, type: 'secondary' }
				],
				verticallyCentered: false
			});
		}

		return Promise.resolve(true);
	}
}
