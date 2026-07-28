/*
 * Copyright (C) 2024 Acme Technologies, Inc.  All rights reserved.
 */
import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { AbstractControl, UntypedFormBuilder, UntypedFormGroup } from '@angular/forms';

import { FieldValidators } from '@acme-priv/armada-angular/src/acme/angular/components/form';
import { TranslateService } from '@acme-priv/armada-angular/src/acme/angular/l10n/translation';
import { zIndexMap } from '@acme-priv/armada-angular/src/acme/theme/typescript';

import { ConfigHubApprovalStatus } from 'app/components/config-hub/shared/models';

@Component({
	selector: 'app-config-hub-request-approval-overlay',
	templateUrl: './request-approval-overlay.component.html',
	styleUrls: ['./request-approval-overlay.component.scss']
})
export class RequestApprovalOverlayComponent implements OnInit {
	@Input() showOverlay = false;

	@Input() public draftName: string;

	// depending on the action we will display different texts and will pass different values to the events.
	@Input() public actionType: ConfigHubApprovalStatus;

	@Output() onDismiss = new EventEmitter<string>();

	public buttonLabel: string;

	public modalTitle: string;

	public modalDescription: string;

	/**
	 * Emits an event when the user tries to submit the form.
	 */
	public submitAttempted = new EventEmitter<void>();

	/**
	 * The z-index for the modal backdrop
	 */
	public backdropZIndex = zIndexMap.overlay;

	/**
	 * The maximum number of characters for a draft comment.
	 */
	public readonly DRAFT_COMMENT_MAX_LENGTH = 100;

	/**
	 * Create draft approval Change Form
	 */
	public createApprovalStatusForm: UntypedFormGroup;

	constructor(
		private formBuilder: UntypedFormBuilder,
		private readonly translateService: TranslateService
	) {}

	/**
	 * Initialization of the component.
	 */
	ngOnInit(): void {
		this.createApprovalStatusForm = this.formBuilder.group({
			comment: [
				null,
				[],
				[
					FieldValidators.required,
					(formControl: AbstractControl) =>
						FieldValidators.enforceMaxLength(formControl, this.DRAFT_COMMENT_MAX_LENGTH)
				]
			]
		});

		this.createApprovalStatusForm.controls['comment'].markAsDirty({ onlySelf: true });
		this.createApprovalStatusForm.controls['comment'].markAsTouched({ onlySelf: true });
		this.createApprovalStatusForm.controls['comment'].updateValueAndValidity({ onlySelf: true });

		if (this.actionType === ConfigHubApprovalStatus.APPROVED) {
			this.modalTitle = 'CONFIG_HUB.APPROVE_REQUEST';
			this.modalDescription = 'CONFIG_HUB.APPROVE_DRAFT_FOR_DEPLOYMENT_DESCRIPTION';
			this.buttonLabel = 'CONFIG_HUB.APPROVE';
		} else if (this.actionType === ConfigHubApprovalStatus.DENIED) {
			this.modalTitle = 'CONFIG_HUB.DENY_REQUEST';
			this.modalDescription = 'CONFIG_HUB.DENY_DRAFT_FOR_DEPLOYMENT_DESCRIPTION';
			this.buttonLabel = 'CONFIG_HUB.DENY';
		} else {
			this.modalTitle = 'CONFIG_HUB.SUBMIT_FOR_APPROVAL';
			this.modalDescription = 'CONFIG_HUB.SUBMIT_FOR_APPROVAL_DESCRIPTION';
			this.buttonLabel = 'CONFIG_HUB.REQUEST_APPROVAL';
		}
	}

	/**
	 * Handle dismissing the modal
	 */
	public handleDismiss(comment: string = null): void {
		this.createApprovalStatusForm.reset();
		this.onDismiss.emit(comment);
	}

	/**
	 * public appprove request with comment... this will now needt to emmit a new value. or have a different one for approval an request.
	 */
	public handleApproveDraft(): void {
		this.submitAttempted.emit();
		if (this.createApprovalStatusForm) {
			const comment = <string>this.createApprovalStatusForm.get('comment').value;
			this.handleDismiss(comment);
		}
	}
}
