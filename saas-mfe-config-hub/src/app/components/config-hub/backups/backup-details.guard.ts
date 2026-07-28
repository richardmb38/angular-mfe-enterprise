/*
 * Copyright (C) 2023 Acme Technologies, Inc.  All rights reserved.
 */
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';

import { Observable, of } from 'rxjs';

import { FeatureFlagService } from '@acme-priv/ui-common/src/acme/angular/util';

import { CONFIG_HUB_URL } from '../config-hub.model';
import { FeatureFlags } from 'app/featureflags.enum';

@Injectable({
	providedIn: 'root'
})
export class ConfigHubBackupDetailsGuard {
	// TODO: clean up in https://acme.atlassian.net/browse/PLTCONFHUB-1532
	private readonly isBackupDetailsEnabled = this.featureFlagService.isEnabled(
		FeatureFlags.PLT_UI_ADMIRAL_CONFIG_HUB_BACKUP_DETAILS
	);

	constructor(
		private featureFlagService: FeatureFlagService,
		private router: Router
	) {}

	/**
	 *  Decide if a route can be activated.
	 * @param route The current route
	 */
	canActivate(): Observable<boolean> {
		if (!this.isBackupDetailsEnabled) {
			this.router.navigate([CONFIG_HUB_URL]);
			return of(false);
		}

		return of(true);
	}
}
