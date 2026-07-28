/*
 * Copyright (C) 2023 Acme Technologies, Inc.  All rights reserved.
 */
import { Injectable } from '@angular/core';

import { UnsavedChangesWarningService } from '@acme-priv/armada-angular/src/acme/angular/util/unsaved-changes-warning';

import { ConfigHubDraftsComponent } from './drafts.component';

/**
 * Guards the Configuration Hub Drafts page behind appropriate feature flags.
 */
@Injectable({ providedIn: 'root' })
export class ConfigHubDraftsGuard {
	constructor(private unsavedChangesWarningService: UnsavedChangesWarningService) {}

	/**
	 *  Decide if a route can be deactivated.
	 */
	async canDeactivate(): Promise<boolean> {
		return await this.unsavedChangesWarningService.promptToAbandonUnsavedChanges(ConfigHubDraftsComponent);
	}
}
