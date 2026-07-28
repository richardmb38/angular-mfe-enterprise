/*
 * Copyright (C) 2023 Acme Technologies, Inc.  All rights reserved.
 */
import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, Router } from '@angular/router';

import { Store } from '@ngrx/store';
import { Observable, of } from 'rxjs';

import { FeatureFlagService } from '@acme-priv/ui-common/src/acme/angular/util';

import { CONFIG_HUB_URL } from '../config-hub.model';
import { checkConnections } from '../shared/utils';
import { FeatureFlags } from 'app/featureflags.enum';

@Injectable({
	providedIn: 'root'
})
export class ConfigHubBackupListGuard {
	// TODO: Cleanup in https://acme.atlassian.net/browse/PLTCONFHUB-1026
	private readonly isTenantNavEnabled = this.featureFlagService.isEnabled(
		FeatureFlags.PLT_UI_ADMIRAL_TENANT_CONNECTIONS_NAV
	);

	constructor(
		private featureFlagService: FeatureFlagService,
		private router: Router,
		private store: Store
	) {}

	/**
	 *  Decide if a route can be activated.
	 * @param route The current route
	 */
	canActivate(route: ActivatedRouteSnapshot): Observable<boolean> {
		if (this.isTenantNavEnabled) {
			const urlTenant = route.paramMap.get('id');
			return checkConnections(urlTenant, this.store, this.router);
		}

		this.router.navigate([CONFIG_HUB_URL]);
		return of(false);
	}
}
