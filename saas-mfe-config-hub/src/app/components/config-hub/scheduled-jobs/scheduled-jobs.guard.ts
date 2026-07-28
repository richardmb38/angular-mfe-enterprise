/*
 * Copyright (C) 2024 Acme Technologies, Inc.  All rights reserved.
 */
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';

import { FeatureFlagService } from '@acme-priv/ui-common/src/acme/angular/util/feature-flag';
import { UserRightsService } from '@acme-priv/ui-common/src/acme/angular/util/user-rights';

import { CONFIG_HUB_URL } from '../config-hub.model';
import { ConfigHubRoles } from '../shared/models/config-hub.model';
import { FeatureFlags } from 'app/featureflags.enum';

@Injectable({
	providedIn: 'root'
})
export class ConfigHubScheduledJobsGuard {
	constructor(
		private featureFlagService: FeatureFlagService,
		private router: Router,
		private userRightsService: UserRightsService
	) {}

	/**
	 * Decide if a route can be activated
	 */
	async canActivate(): Promise<boolean> {
		const hasRights = await this.userRightsService.hasRight(ConfigHubRoles.SCHEDULED_JOBS_READ);

		const featureFlagEnabled = this.featureFlagService.isEnabled(FeatureFlags.PLTCONFHUB_SCHEDULED_ACTIONS);

		if (featureFlagEnabled && hasRights) {
			return true;
		}

		this.router.navigate([CONFIG_HUB_URL]);
		return false;
	}
}
