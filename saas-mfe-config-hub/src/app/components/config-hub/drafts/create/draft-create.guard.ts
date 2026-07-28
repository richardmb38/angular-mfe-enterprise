/*
 * Copyright (C) 2023 Acme Technologies, Inc.  All rights reserved.
 */
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';

import { CONFIG_HUB_URL, ConfigHubChildRoutes } from '../../config-hub.model';

/**
 * Guards the draft creation page in Configuration Hub
 * to ensure sourceBackupId is available before navigating.
 */
@Injectable({ providedIn: 'root' })
export class ConfigHubDraftCreateGuard {
	constructor(private router: Router) {}

	/**
	 *  Decide if a route can be activated.
	 */
	canActivate(): boolean {
		const sourceBackupId = this.router.getCurrentNavigation().extras.state?.sourceBackupId;

		if (sourceBackupId) {
			return true;
		}

		// Redirect to Config Hub main page
		this.router.navigate([CONFIG_HUB_URL, ConfigHubChildRoutes.DRAFTS.route]);
		return false;
	}
}
