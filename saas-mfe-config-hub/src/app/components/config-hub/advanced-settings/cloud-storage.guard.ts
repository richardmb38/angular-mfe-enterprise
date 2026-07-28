/*
 * Copyright (C) 2024 Acme Technologies, Inc.  All rights reserved.
 */
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';

import { FeatureFlagService } from '@acme-priv/ui-common/src/acme/angular/util/feature-flag';
import { UserRightsService } from '@acme-priv/ui-common/src/acme/angular/util/user-rights';

import { CONFIG_HUB_URL } from '../config-hub.model';
import { ConfigHubRoles } from '../shared/models/config-hub.model';

@Injectable({
	providedIn: 'root'
})
export class CloudStorageGuard {
	constructor(
		private featureFlagService: FeatureFlagService,
		private router: Router,
		private userRightsService: UserRightsService
	) {}

	/**
	 * Decide if a route can be activated
	 */
	async canActivate(): Promise<boolean> {
		const hasRights = await this.userRightsService.hasRight(ConfigHubRoles.CLOUD_STORAGE_PAGE);

		if (hasRights) {
			return true;
		}
		this.router.navigate([CONFIG_HUB_URL]);
		return false;
	}
}
