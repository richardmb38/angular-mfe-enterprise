/*
 * Copyright (C) 2023 Acme Technologies, Inc.  All rights reserved.
 */
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

import { BehaviorSubject, Subject, take } from 'rxjs';

import { BrandingService } from '@acme-priv/armada-angular/src/acme/angular/util/branding';

import { CONFIG_HUB_URL, ConfigHubChildRoutes } from '../../config-hub.model';
import {
	ConfigHubBackupSummary,
	ConfigHubBackupType,
	HydrationStatuses,
	JOB_STATUS_POLL_PERIOD
} from '../../shared/models';
import { ConfigHubBackupsApiService } from '../../shared/services';
import { BackupDetailsSelectedObjectType, Icons, getIconConfig } from './backup-details.model';

@Component({
	selector: 'app-backup-details',
	templateUrl: './backup-details.component.html',
	styleUrls: ['./backup-details.component.scss']
})
export class ConfigHubBackupDetailsComponent implements OnInit {
	/**
	 * Left icon to be used in the Previous Object button
	 */
	public prevIconConfig = getIconConfig(Icons.ARROW_LEFT);

	/**
	 * Right icon to be used in the Next Object button
	 */
	public nextIconConfig = getIconConfig(Icons.ARROW_RIGHT);

	/**
	 * Left icon to be used in the Back to Config Hub button
	 */
	public backIconConfig = getIconConfig(Icons.ARROW_LEFT_ALT);

	/**
	 * List of object types
	 */
	public objectBreakdown$ = new BehaviorSubject<Array<string>>([]);

	/**
	 * Object Totals
	 */
	public objectBreakdownCounts: { [objectType: string]: number };

	/**
	 * BackupSummary to get totals
	 */
	public backupSummary: ConfigHubBackupSummary;

	/**
	 * Selected object type
	 */
	public selectedObjectType: BackupDetailsSelectedObjectType;

	/**
	 * Current Job Id
	 */
	public jobId: string;

	/**
	 * Loading state for details view
	 */
	public loading = false;

	/**
	 * Loading state for details view
	 */
	public inProgressView: boolean;

	/**
	 * Backup details name
	 */
	public backupName: string;

	/**
	 * Backup type details
	 */
	private backupType: string;

	/**
	 * Unsubscribe subject
	 */
	private readonly unsubscribe$: Subject<void>;

	constructor(
		private router: Router,
		private route: ActivatedRoute,
		private configHubBackupsApiService: ConfigHubBackupsApiService,
		public brandingService: BrandingService
	) {
		this.jobId = this.route.snapshot.paramMap.get('id');
	}

	/**
	 * ngOnInit()
	 */
	ngOnInit(): void {
		this.checkStatus();
		this.initObjectBreakdown();
		this.handleTypeSelectionChange();
	}

	/**
	 * Handles type selection change
	 */
	private handleTypeSelectionChange(): void {
		this.objectBreakdown$.subscribe(types => {
			if (types.length) {
				this.selectedObjectType = { type: types[0], totalCount: this.objectBreakdownCounts[types[0]] };
			}
		});
	}

	/**
	 * Inits ObjectBreakdown
	 */
	private initObjectBreakdown(): void {
		const currentRouterState = this.router.lastSuccessfulNavigation.extras?.state?.summary || {};
		const { name: backupName, objectBreakdown } = currentRouterState;
		if (backupName && objectBreakdown) {
			this.backupName = backupName;
			this.objectBreakdownCounts = objectBreakdown;
			this.objectBreakdown$.next(Object.keys(objectBreakdown).sort());
		} else {
			this.loadObjectBreakdown();
		}
	}

	/**
	 * Retrieves the list of objects
	 */
	private loadObjectBreakdown(): void {
		this.loading = true;
		this.configHubBackupsApiService
			.getSummary(this.jobId)
			.pipe(take(1))
			.subscribe({
				next: ({ objectBreakdown, name, backupType }) => {
					this.backupName = name;
					this.backupType = backupType;
					this.objectBreakdownCounts = objectBreakdown;
					this.objectBreakdown$.next(Object.keys(objectBreakdown).sort());
					this.loading = false;
				},
				error: () => (this.loading = false)
			});
	}

	/**
	 * Checks the current hydration status
	 */
	private checkStatus(): void {
		this.configHubBackupsApiService
			.watchStatusInProgress(
				this.jobId,
				JOB_STATUS_POLL_PERIOD,
				result => result.hydrationStatus !== HydrationStatuses.HYDRATED
			)
			.subscribe(result => {
				this.inProgressView = result.hydrationStatus !== HydrationStatuses.HYDRATED;
			});
	}

	/**
	 * Sets the selected object type.
	 */
	public setSelectedObjectType(type: string): void {
		this.selectedObjectType = { type, totalCount: this.objectBreakdownCounts[type] };
	}

	/**
	 * Returns to the backup list page.
	 */
	public returnToBackupList(): void {
		if (this.backupType === ConfigHubBackupType.UPLOADED) {
			this.router.navigate([CONFIG_HUB_URL, ConfigHubChildRoutes.BACKUP_UPLOADS.route]);
		} else {
			this.router.navigate([CONFIG_HUB_URL, ConfigHubChildRoutes.BACKUPS.route]);
		}
	}

	/**
	 * Go to the next object type.
	 */
	public nextObject(): void {
		const types = this.objectBreakdown$.getValue();
		const idx = types.indexOf(this.selectedObjectType.type);
		if (idx === types.length - 1) {
			this.selectedObjectType = { type: types[0], totalCount: this.objectBreakdownCounts[types[0]] };
		} else {
			this.selectedObjectType = { type: types[idx + 1], totalCount: this.objectBreakdownCounts[types[idx + 1]] };
		}
	}

	/**
	 * Go to the previous object type.
	 */
	public previousObject(): void {
		const types = this.objectBreakdown$.getValue();
		const idx = types.indexOf(this.selectedObjectType.type);
		if (idx === 0) {
			this.selectedObjectType = {
				type: types[types.length - 1],
				totalCount: this.objectBreakdownCounts[types[types.length - 1]]
			};
		} else {
			this.selectedObjectType = {
				type: types[idx - 1],
				totalCount: this.objectBreakdownCounts[types[idx - 1]]
			};
		}
	}
}
