/*
 * Copyright (C) 2023 Acme Technologies, Inc.  All rights reserved.
 */
import {
	ChangeDetectionStrategy,
	ChangeDetectorRef,
	Component,
	EventEmitter,
	Input,
	OnDestroy,
	Output
} from '@angular/core';
import { Router } from '@angular/router';

import { Subject } from 'rxjs';
import { take } from 'rxjs/operators';

import { FeatureFlagService } from '@acme-priv/ui-common/src/acme/angular/util';
import { UserRightsService } from '@acme-priv/ui-common/src/acme/angular/util/user-rights';

import { FeatureFlags } from '../../../../featureflags.enum';
import { CONFIG_HUB_URL, ConfigHubChildRoutes } from '../../config-hub.model';
import { DraftsChildRoutes } from '../../drafts/drafts.model';
import { ConfigHubBackupJob, ConfigHubBackupSummary, HydrationStatuses, limitBackupSize } from '../../shared/models';
import { ConfigHubRoles } from '../../shared/models/config-hub.model';
import { ConfigHubBackupsApiService, ConfigHubTenantConnectionsService } from '../../shared/services';
import { BackupChildRoutes } from '../backups.model';

/**
 * Configuration Hub Backup Summary Overlay
 *
 * Displays details of the selected backup.
 */
@Component({
	selector: 'app-config-hub-backup-summary-overlay',
	templateUrl: './summary-overlay.component.html',
	styleUrls: ['./summary-overlay.component.scss'],
	changeDetection: ChangeDetectionStrategy.OnPush
})
export class ConfigHubBackupSummaryOverlayComponent implements OnDestroy {
	/**
	 * Backup for this overlay.
	 */
	private _selectedBackup: ConfigHubBackupJob;

	/**
	 * Set the backup on change
	 */
	@Input() set selectedBackup(backup: ConfigHubBackupJob) {
		this._selectedBackup = backup;
		if (backup) {
			this.loadSummary(backup);
		}
	}

	/**
	 * Get the currently selected backup value
	 */
	get selectedBackup(): ConfigHubBackupJob {
		return this._selectedBackup;
	}

	/**
	 * Indicates whether the overlay is displayed or not.
	 */
	@Input() isOverlayOpen: boolean;

	/**
	 * The currently selected tenant
	 */
	@Input() selectedTenant: string | null;

	/**
	 * Emits an event when the overlay is closed
	 */
	@Output() onDismiss = new EventEmitter<void>();

	/**
	 * The backup job summary.
	 */
	public backupSummary: ConfigHubBackupSummary;

	/**
	 * Boolean that determins if the "prepare for draft" button is disabled.
	 */
	public disablePrepareForDraftButton: boolean;

	/**
	 * Whether the overlay is currently loading new data.
	 */
	public loading = false;

	/**
	 * Whether the backup details should display
	 * TODO: clean up in https://acme.atlassian.net/browse/PLTCONFHUB-1532
	 */
	public readonly isBackupDetailsEnabled = this.featureFlagService.isEnabled(
		FeatureFlags.PLT_UI_ADMIRAL_CONFIG_HUB_BACKUP_DETAILS
	);

	/**
	 * Checks wether user can create a draft
	 */
	public canUserCreateDraft$: Promise<Boolean>;

	/**
	 * Subject to unsubscribe on destroy.
	 */
	private unsubscribe$ = new Subject<void>();

	/**
	 * Whether or not the PLTIN_CONFIG_HUB_LIMIT_OVERRIDE flag is enabled.
	 */
	public isLimitOverrideEnabled = this.featureFlagService.isEnabled(FeatureFlags.PLTIN_CONFIG_HUB_LIMIT_OVERRIDE);

	constructor(
		private changeDetectorRef: ChangeDetectorRef,
		private configHubBackupsApiService: ConfigHubBackupsApiService,
		private configHubTenantConnectionsService: ConfigHubTenantConnectionsService,
		private router: Router,
		private featureFlagService: FeatureFlagService,
		private userRightsService: UserRightsService
	) {
		this.canUserCreateDraft$ = this.userRightsService.hasRight(ConfigHubRoles.DRAFT_CREATE);
	}

	/**
	 * Clean up when the instance is destroyed.
	 */
	public ngOnDestroy(): void {
		this.unsubscribe$.next();
		this.unsubscribe$.complete();
	}

	/**
	 * Handles the Prepare Draft button being clicked.
	 */
	public handlePrepareDraftClick(): void {
		if (this.disablePrepareForDraftButton) {
			return;
		}
		this.handleDismiss();
		this.router.navigate([CONFIG_HUB_URL, ConfigHubChildRoutes.DRAFTS.route, DraftsChildRoutes.CREATE.route], {
			state: {
				sourceBackupId: this.selectedBackup.jobId,
				sourceBackupName: this.selectedBackup.name,
				sourceTenant: this.selectedTenant
			}
		});
	}

	/**
	 * Handles overlay close.
	 */
	public handleDismiss(): void {
		this.onDismiss.emit();
	}

	/**
	 * Start Hydration and redirect to backup details view
	 */
	public handleViewDetails(): void {
		if (this.selectedBackup.hydrationStatus === HydrationStatuses.NOT_HYDRATED) {
			this.configHubBackupsApiService
				.hydrateBackup(this.backupSummary.jobId)
				.pipe(take(1))
				.subscribe(() => {
					this.navigateToDetails();
				});
		} else {
			this.navigateToDetails();
		}
	}

	/**
	 * Navigate to details view
	 */
	private navigateToDetails(): void {
		this.router.navigateByUrl(
			`${CONFIG_HUB_URL}/${BackupChildRoutes.BACKUP_DETAILS.route.replace(':id', this.backupSummary.jobId)}`,
			{
				state: {
					objectBreakdown: this.backupSummary
				}
			}
		);
	}

	/**
	 * Loads the summary for a given backup job.
	 * @param job - The job to load a summary for.
	 */
	private loadSummary(job: ConfigHubBackupJob): void {
		this.loading = true;

		const request = this.selectedTenant
			? this.configHubTenantConnectionsService.getTenantConnectionsBackupSummary(this.selectedTenant, job.jobId)
			: this.configHubBackupsApiService.getSummary(job.jobId);

		request.pipe(take(1)).subscribe(summary => {
			this.backupSummary = summary;
			this.loading = false;
			this.disablePrepareForDraftButton =
				!this.isLimitOverrideEnabled && this.backupSummary.totalObjectCount > limitBackupSize;
			this.changeDetectorRef.detectChanges();
		});
	}
}
