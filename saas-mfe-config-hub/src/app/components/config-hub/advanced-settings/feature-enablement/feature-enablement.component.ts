/*
 * Copyright (C) 2024 Acme Technologies, Inc.  All rights reserved.
 */
import { ChangeDetectorRef, Component, OnInit } from '@angular/core';

import { AlertsToasterService } from '@acme-priv/armada-angular/src/acme/angular/components/alert';

import { FeatureFlagService } from '@acme-priv/ui-common/src/acme/angular/util';
import { UserRightsService } from '@acme-priv/ui-common/src/acme/angular/util/user-rights';

import { ConfigHubPatchOperations } from '../../shared/models';
import { CloudStorageInfoPatchableFields } from '../../shared/models/cloud-storage.model';
import { ConfigHubRoles } from '../../shared/models/config-hub.model';
import {
	getDraftApprovalSettingsDisabledAlert,
	getDraftApprovalSettingsEnabledAlert,
	getDraftApprovalSettingsErrorAlert
} from '../../shared/models/feature-enablement.model';
import { ConfigHubAdvancedSettingsApiService } from '../../shared/services/advanced-settings/advanced-settings.service';
import { FeatureFlags } from 'app/featureflags.enum';
import { Operation as JSONPatchOperation } from 'fast-json-patch';

@Component({
	selector: 'app-config-hub-feature-enablement',
	templateUrl: './feature-enablement.component.html',
	styleUrls: ['./feature-enablement.component.scss']
})
export class ConfigHubFeatureEnablementComponent implements OnInit {
	/**
	 * Controls the loading overlay
	 */
	public loading = false;

	/**
	 * Whether or not the approvals setting is enabled
	 */
	public approvalsIsEnabled = false;

	/**
	 * Checks wether or not the user can change advanced settings
	 */
	public canUserEditSettings$: Promise<boolean>;

	/**
	 * Check if approvals feature flag is enabled
	 */
	public isApprovalsFeatureFlagEnabled = this.featureFlagService.isEnabled(
		FeatureFlags.PLT_UI_ADMIRAL_CONFIG_HUB_DRAFTS_APPROVAL
	);

	constructor(
		private alertService: AlertsToasterService,
		private configHubAdvancedSettingsApiService: ConfigHubAdvancedSettingsApiService,
		private changeDetectorRef: ChangeDetectorRef,
		private userRightsService: UserRightsService,
		private featureFlagService: FeatureFlagService
	) {}

	/**
	 * Initializes the cloud storage form, and fetches the tenant's cloud storage config
	 */
	ngOnInit(): void {
		this.canUserEditSettings$ = this.userRightsService.hasRight(ConfigHubRoles.ADVANCED_SETTINGS_UPDATE);
		this.canUserEditSettings$.then(canEdit => {
			if (canEdit) {
				this.fetchApprovalsIsEnabled();
			}
		});
	}

	/**
	 * Fetches the approvals setting to see wether or not it's enabled
	 */
	public fetchApprovalsIsEnabled(): void {
		if (this.isApprovalsFeatureFlagEnabled) {
			this.loading = true;
			this.approvalsIsEnabled = false;

			this.configHubAdvancedSettingsApiService.getIsApprovalsSettingEnabled().subscribe({
				next: approvalsEnabled => {
					this.approvalsIsEnabled = approvalsEnabled;
					this.loading = false;
					this.changeDetectorRef.detectChanges();
				},
				error: () => {
					this.loading = false;
					this.changeDetectorRef.detectChanges();
				}
			});
		}
	}

	/**
	 * Patches individual fields of cloud storage info
	 */
	private patchCloudStorage(field: string, replaceValue: string | boolean): void {
		this.configHubAdvancedSettingsApiService
			.patchCloudStorage(this.getPatchOperationPayload(field, replaceValue))
			.subscribe({
				next: cloudStorageInfo => {
					this.approvalsIsEnabled = cloudStorageInfo.approvalsEnabled;
					if (this.approvalsIsEnabled) {
						this.alertService.open(getDraftApprovalSettingsEnabledAlert());
					} else {
						this.alertService.open(getDraftApprovalSettingsDisabledAlert());
					}
					this.changeDetectorRef.detectChanges();
				},
				error: () => {
					this.alertService.open(getDraftApprovalSettingsErrorAlert());
					this.changeDetectorRef.detectChanges();
				}
			});
	}

	/**
	 * Handles the Enabled toggle switch
	 */
	public handleToggleChange(event: boolean): void {
		this.patchCloudStorage(CloudStorageInfoPatchableFields.APPROVALS_ENABLED, event);
	}

	/**
	 * Prepares payload for patch operation
	 * @param {string} field to be  updated
	 * @param {string | boolean} replaceValue to be replaced
	 * @returns {Array<JSONPatchOperation>}
	 */
	private getPatchOperationPayload(field: string, replaceValue: string | boolean): Array<JSONPatchOperation> {
		return [
			{
				op: ConfigHubPatchOperations.REPLACE,
				path: `/${field}`,
				value: replaceValue
			}
		];
	}
}
