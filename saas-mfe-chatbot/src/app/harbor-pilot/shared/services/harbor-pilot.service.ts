/*
 * Copyright (C) 2019 Acme Technologies, Inc.  All rights reserved.
 */
import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

import { Observable, lastValueFrom, map } from 'rxjs';

import { ApiService, ApiVersion } from '@acme-priv/ui-common/src/acme/angular/api';
import { FeatureFlagService, ProductFlagService } from '@acme-priv/ui-common/src/acme/angular/util';
import { UserRightsService } from '@acme-priv/ui-common/src/acme/angular/util/user-rights';

import { OrgConfiguration } from '../models/org-configuration.model';
import { FeatureFlags } from 'app/feature-flags.enum';
import { ProductFlags } from 'app/product-flags.enum';
import { Rights } from 'app/rights.enum';

/**
 * Service that provides helper methods to the core Harbor Pilot functionality,
 * ex. evaluate feature enabled/disabled state.
 */
@Injectable({ providedIn: 'root' })
export class HarborPilotService extends ApiService<boolean> {
	constructor(
		httpClient: HttpClient,
		private featureFlagService: FeatureFlagService,
		private userRightsService: UserRightsService,
		private productFlagService: ProductFlagService
	) {
		super(ApiVersion.BETA, 'org-config', httpClient);
	}

	/**
	 * Evaluates if Harbor Pilot is enabled after validating the Feature Flags,
	 * User Rights.
	 * @returns {Promise<boolean>}
	 */
	public async isHarborPilotEnabled(): Promise<boolean> {
		if (this.featureFlagService.isEnabled(FeatureFlags.HARBOR_PILOT_SAFELIST)) {
			const hasRights = await this.userRightsService.hasRight(Rights.IDN_UI_AGENTIC_BOT_WRITE);
			let hasLicenses = true;

			// @TODO CLEAN UP: MOON_632_HARBOR_PILOT_PRODUCT_FLAGS
			if (this.featureFlagService.isEnabled(FeatureFlags.MOON_632_HARBOR_PILOT_PRODUCT_FLAGS)) {
				hasLicenses = await this.productFlagService.isEnabledAsync(ProductFlags.AGENTIC_BOT_BASE);
			}

			return hasRights && hasLicenses;
		} else {
			return Promise.resolve(false);
		}
	}

	/**
	 * Evaluates if Harbor Pilot feature is turned ON in the system settings.
	 * @returns {Promise<boolean>}
	 */
	public async isHarborPilotEnabledOnSystemSettings(): Promise<boolean> {
		return lastValueFrom(
			this.getOrgConfig().pipe(
				map((config: OrgConfiguration) => {
					return config.harborPilotEnabled;
				})
			)
		);
	}

	/**
	 * Request to enable or disable Harbor Pilot on the system settings,
	 * relies on the ApiService to patch the status of /beta/org-config.
	 * @param {Operation[]} body - The patch body
	 */
	public updateHarborPilotOnSystemSettings(enabled: boolean): Observable<OrgConfiguration> {
		return super.patch('', [
			{
				op: 'replace',
				path: '/harborPilotEnabled',
				value: enabled
			}
		]) as unknown as Observable<OrgConfiguration>;
	}

	/**
	 * Returns a collection of enabled Harbor Pilot Licenses.
	 * @returns string[]
	 */
	async getEnabledLicenses(): Promise<string[]> {
		const licenses = await this.productFlagService.getProductFlagsAsync();
		return licenses.filter(license => Object.values(ProductFlags).includes(license as ProductFlags));
	}

	/**
	 * Uses the ApiService to get the status of /beta/org-config with caching
	 * @returns {Observable<boolean>}
	 */
	private getOrgConfig(): Observable<OrgConfiguration> {
		return this.get('', {}, { expire: 0 }) as unknown as Observable<OrgConfiguration>;
	}
}
