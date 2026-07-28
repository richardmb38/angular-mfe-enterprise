/*
 * Copyright (C) 2024 Acme Technologies, Inc.  All rights reserved.
 */
import { Component, EventEmitter, Input, Output } from '@angular/core';

import { Store } from '@ngrx/store';

import { fromDraftsPage } from '../../store/selectors';

@Component({
	selector: 'app-config-hub-approval-comments-overlay',
	templateUrl: './approval-comments-overlay.component.html',
	styleUrls: ['./approval-comments-overlay.component.scss']
})
export class ConfigHubApprovalCommentsOverlayComponent {
	@Input() showOverlay = false;

	@Output() onDismiss: EventEmitter<void> = new EventEmitter<void>();

	public approvalComments$ = this.store.select(fromDraftsPage.selectApprovalStatusComments);

	constructor(private store: Store) {}

	/**
	 * Handle dismissing the modal
	 */
	public handleDismiss(): void {
		this.onDismiss.emit();
	}
}
