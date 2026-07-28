import { Component, EventEmitter, Input, OnDestroy, OnInit, Output } from '@angular/core';

import { Subject } from 'rxjs';

import { SignedImportObject } from '../../shared/models/object-details.model';

@Component({
	selector: 'app-config-hub-backup-details-overlay',
	templateUrl: './backup-details-overlay.component.html',
	styleUrls: ['./backup-details-overlay.component.scss']
})
export class BackupDetailsOverlayComponent implements OnDestroy, OnInit {
	@Input() selectedObject = '';

	@Input() objectName = '';

	@Output() onClose = new EventEmitter<void>();

	public parsedObject: SignedImportObject;

	public jsonObject = '';

	/**
	 * Subject to unsubscribe on destroy.
	 */
	private unsubscribe$ = new Subject<void>();

	/**
	 * Obtains the JSON details from the selected object.
	 */
	public ngOnInit(): void {
		if (this.selectedObject) {
			this.parsedObject = JSON.parse(JSON.parse(this.selectedObject));
			this.jsonObject = JSON.stringify(this.parsedObject, null, '\t');
		}
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
	public handleDismiss(): void {
		this.onClose.emit();
	}
}
