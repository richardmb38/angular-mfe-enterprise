/*
 * Copyright (C) 2023 Acme Technologies, Inc.  All rights reserved.
 */
import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, Router } from '@angular/router';

import { FeatureFlagService } from '@acme-priv/ui-common/src/acme/angular/util/feature-flag';
import { UserInfoService } from '@acme-priv/ui-common/src/acme/angular/util/user-info';
import { UserRightsService } from '@acme-priv/ui-common/src/acme/angular/util/user-rights';

import { FeatureFlags } from '../../featureflags.enum';

/**
 * Guards the Configuration Hub behind appropriate feature flags and ensures proper access.
 */
@Injectable({ providedIn: 'root' })
export class ConfigHubGuard {
	/**
	 * Determines wether user has access to config hub based on FF
	 */
	private readonly isConfigHubLegacyFlagEnabled = this.featureFlagService.isEnabled(
		FeatureFlags.PLT_UI_ADMIRAL_CONFIG_HUB_DRAFT_DETAILS
	);

	constructor(
		private featureFlagService: FeatureFlagService,
		private router: Router,
		private userInfoService: UserInfoService,
		private userRightsService: UserRightsService
	) {}

	/**
	 *  Decide if a route can be activated.
	 *  Checks for custom rights flags first, then moves on to legacy roles flow
	 */
	async canActivate(router: ActivatedRouteSnapshot): Promise<boolean> {
		const rights = router.data['rights'] || [];
		const hasRights = await this.userRightsService.hasAnyRight(rights);
		if (hasRights) {
			return true;
		}

		// Redirecting to a non-existing page will trigger the redirect guard.
		this.router.navigateByUrl('../this-does-not-exist-route');
		return false;
	}
}
