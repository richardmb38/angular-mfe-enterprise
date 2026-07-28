/*
 * Copyright (C) 2023 Acme Technologies, Inc.  All rights reserved.
 */
import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { AbstractControl, UntypedFormBuilder, UntypedFormGroup } from '@angular/forms';

import { FieldValidators } from '@acme-priv/armada-angular/src/acme/angular/components/form';
import { TranslateService } from '@acme-priv/armada-angular/src/acme/angular/l10n/translation';
import { zIndexMap } from '@acme-priv/armada-angular/src/acme/theme/typescript';

/**
 * Configuration Hub Create Draft Modal
 *
 * A modal that prompts the user to enter a name for the new draft.
 */
@Component({
	selector: 'app-draft-create-modal',
	templateUrl: './draft-create-modal.component.html',
	styleUrls: ['./draft-create-modal.component.scss']
})
export class ConfigHubDraftCreateModalComponent implements OnInit {
	/**
	 * The maximum number of characters for a draft name.
	 */
	public readonly DRAFT_NAME_MAX_LENGTH = 50;

	/**
	 * Output that emits an event containing the name of a new draft when the modal is closed.
	 */
	@Output() onDismiss = new EventEmitter<string>();

	/**
	 * The id of the source backup
	 */
	@Input()
	public sourceBackupId: string;

	/**
	 * Create draft form group.
	 */
	public createDraftForm: UntypedFormGroup;

	/**
	 * Emits an event when the user tries to submit the form.
	 */
	public submitAttempted = new EventEmitter<void>();

	/**
	 * The z-index for the modal backdrop
	 */
	public backdropZIndex = zIndexMap.overlay;

	constructor(
		private formBuilder: UntypedFormBuilder,
		private readonly translateService: TranslateService
	) {}

	/**
	 * Initialization of the component.
	 */
	ngOnInit(): void {
		this.createDraftForm = this.formBuilder.group({
			draftName: [
				this.translateService.instant('CONFIG_HUB.DRAFT_FOR') + ' ' + this.sourceBackupId,
				[],
				[
					FieldValidators.required,
					(formControl: AbstractControl) =>
						FieldValidators.enforceMaxLength(formControl, this.DRAFT_NAME_MAX_LENGTH)
				]
			]
		});

		// forces validation of the default value
		this.createDraftForm.controls['draftName'].markAsDirty();
		this.createDraftForm.controls['draftName'].markAsTouched();
		this.createDraftForm.controls['draftName'].updateValueAndValidity();
	}

	/**
	 * Handles when the modal is dismissed, either via button click or outside dismissal.
	 * @param draftName - The name of the new draft to be emitted by the onDismiss.
	 */
	public handleDismiss(draftName: string = null): void {
		this.createDraftForm.reset();
		this.onDismiss.emit(draftName);
	}

	/**
	 * Handles when a user attempts to initiate a draft.
	 */
	public handleCreateDraft(): void {
		this.submitAttempted.emit();

		if (this.createDraftForm.valid) {
			const draftName = <string>this.createDraftForm.get('draftName').value;
			this.handleDismiss(draftName);
		}
	}
}
