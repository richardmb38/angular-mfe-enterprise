/*
 * Copyright (C) 2024 Acme Technologies, Inc.  All rights reserved.
 */
import { DatePipe } from '@angular/common';
import { ChangeDetectorRef, Component, HostListener, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { Router } from '@angular/router';

import { CellClickedEvent, GridOptions, GridReadyEvent, RowNode } from 'ag-grid-community';
import { BehaviorSubject, Observable, Subject } from 'rxjs';
import { filter, switchMap, take, tap } from 'rxjs/operators';

import { AlertService } from '@acme-priv/armada-angular/src/acme/angular/components/alert';
import {
	DataGridColumnsFactoryService,
	DataGridComponent,
	SlptColDef
} from '@acme-priv/armada-angular/src/acme/angular/components/grid';
import { ModalService } from '@acme-priv/armada-angular/src/acme/angular/components/modal';
import { TranslateService } from '@acme-priv/armada-angular/src/acme/angular/l10n/translation';

import { ApiListResponse } from '@acme-priv/ui-common/src/acme/angular/api';
import { FeatureFlagService } from '@acme-priv/ui-common/src/acme/angular/util';

import {
	getDeleteBackupModalConfig,
	getDeleteBackupSuccessAlertConfig,
	getLatestCompletedBackupJobId,
	getUploadedBackupLimitWarning,
	getUploadedJobsGridColumnDefs,
	jobsGridOptions
} from '../backups/backup-list.model';
import { CONFIG_HUB_URL, ConfigHubChildRoutes } from '../config-hub.model';
import { DraftsChildRoutes } from '../drafts/drafts.model';
import {
	ConfigHubBackupJob,
	ConfigHubJobStatus,
	GRID_ACTION_COLUMN_ID,
	JOB_STATUS_POLL_PERIOD,
	MAX_CONFIGURATION_UPLOADS_ALLOWED,
	gridLoadingModel,
	gridNoDataModel,
	limitBackupSize
} from '../shared/models';
import { ConfigHubBackupsApiService } from '../shared/services';
import { BackupsAsyncAlertService } from '../shared/services/backups/backups.async-alert.service';
import { isConfigHubJobDone } from '../shared/utils';
import { FeatureFlags } from 'app/featureflags.enum';

@Component({
	selector: 'app-config-hub-backup-uploads',
	templateUrl: './backup-uploads.component.html',
	styleUrls: ['./backup-uploads.component.scss']
})
export class ConfigHubBackupUploadsComponent implements OnInit, OnDestroy {
	/**
	 * Column definitions for the Backup Uploads grid.
	 */
	public columnDefs: SlptColDef[];

	/**
	 * The grid api.
	 */
	public gridApi: GridReadyEvent;

	/**
	 * The options for the grid.
	 */
	public gridOptions: GridOptions = {
		...jobsGridOptions,
		onSortChanged: this.onGridSortChanged.bind(this),
		onRowDataUpdated: () => this.changeDetectorRef.detectChanges(),
		onCellClicked: this.handleCellClicked.bind(this)
	};

	/**
	 * Backup uploads view loading state
	 */
	public loading = false;

	/**
	 * weather an upload job is in progress.
	 */
	public isBackupUploadInProgress = false;

	/**
	 * Internal grid loading mask model - disabled by default.
	 */
	public loadingModel = gridLoadingModel;

	/**
	 * Model containing the empty state component when the grid has no data.
	 */
	public noDataModel = gridNoDataModel();

	/**
	 * An array of uploaded backups. Used to populate the grid.
	 */
	public uploadedBackups: ConfigHubBackupJob[] = [];

	/**
	 * Indicator of when an import is in progress
	 */
	public isImportInProgress = false;

	/**
	 * Total number of configuration uploads
	 */
	public totalConfigurationUploads = 0;

	/**
	 * Number of maximum uploads allowed
	 */
	public readonly MAX_CONFIGURATION_UPLOADS_ALLOWED = MAX_CONFIGURATION_UPLOADS_ALLOWED;

	/**
	 * Indicated if the upload overlay is open
	 */
	public isUploadOverlayOpen = false;

	/**
	 * Selected backup to be displayed in the overlay.
	 */
	public selectedBackup: ConfigHubBackupJob | null;

	/**
	 * Id of the latest backup job
	 */
	private latestBackupJobId$: Subject<string> = new BehaviorSubject<string>(null);

	/**
	 * Whether or not the PLTIN_CONFIG_HUB_LIMIT_OVERRIDE flag is enabled.
	 */
	public isLimitOverrideEnabled = this.featureFlagService.isEnabled(FeatureFlags.PLTIN_CONFIG_HUB_LIMIT_OVERRIDE);

	/**
	 * Reference to the DataGridComponent.
	 */
	@ViewChild('slptGrid', { static: true })
	public slptGrid: DataGridComponent;

	/**
	 * Subject to unsubscribe on destroy.
	 */
	private unsubscribe$ = new Subject<void>();

	constructor(
		private modalService: ModalService,
		private alertService: AlertService,
		private changeDetectorRef: ChangeDetectorRef,
		private translateService: TranslateService,
		private columnsService: DataGridColumnsFactoryService,
		private datePipe: DatePipe,
		private featureFlagService: FeatureFlagService,
		private configHubBackupApiService: ConfigHubBackupsApiService,
		private router: Router,
		private backupsAsyncAlertService: BackupsAsyncAlertService
	) {}

	/**
	 * Initialization of the component.
	 */
	public ngOnInit(): void {
		this.loadUploadedBackups();
		this.initializeGridOptions();
	}

	/**
	 * Clean up when the instance is destroyed.
	 */
	public ngOnDestroy(): void {
		this.unsubscribe$.next();
		this.unsubscribe$.complete();
	}

	/**
	 * Handles the gridReady event when the grid loads and initiates updating rows.
	 * @param event - The grid ready event emitted by ag-grid.
	 */
	public onGridReady(event?: GridReadyEvent): void {
		if (!this.gridApi) {
			this.gridApi = event;
		}
		this.updateGridRows();
	}

	/**
	 * Resize the grid to fit columns on window resize.
	 * Allows the grid to have a reactive feel.
	 * @param event - Window resize event.
	 */
	@HostListener('window:resize', ['$event'])
	public onWindowSizeChangedEvent(): void {
		if (!this.gridApi) {
			return;
		}
		this.gridApi.api.sizeColumnsToFit();
	}

	/**
	 * Handle importing a backup file
	 */
	public handleImportBackupClicked(): void {
		this.isUploadOverlayOpen = true;
		this.destroyExistingAlerts();
	}

	/**
	 * Monitors a backup job and initiates changes when the job's status changes.
	 * @param backupJobToWatch - The backup job to watch.
	 * @returns {Observable<ConfigHubBackupJob>}
	 */
	private watchUploadJob(backupJobToWatch$: Observable<ConfigHubBackupJob>): Observable<ConfigHubBackupJob> {
		return backupJobToWatch$.pipe(
			filter(Boolean),
			switchMap((backupJob: ConfigHubBackupJob) => {
				this.setBackupUploadProgress(!isConfigHubJobDone(backupJob.status));
				return this.configHubBackupApiService.watchInProgressJob(backupJob.jobId, JOB_STATUS_POLL_PERIOD);
			}),
			tap(backupJob => this.handleBackupUploadJobStatusChanges(backupJob))
		);
	}

	/**
	 * Handles changes to a job's status.
	 * @param backupJob - The the backup job to handle.
	 */
	private handleBackupUploadJobStatusChanges(backupJob: ConfigHubBackupJob): void {
		if (isConfigHubJobDone(backupJob.status)) {
			this.alertService.destroy();
			this.setBackupUploadProgress(false);
			this.loadUploadedBackups();
		}
	}

	/**
	 * Toggles isBackupUploadInProgress.
	 * @param isInProgress next backup in progress state
	 */
	private setBackupUploadProgress(isInProgress: boolean): void {
		this.isBackupUploadInProgress = isInProgress;
		this.changeDetectorRef.detectChanges();
	}

	/**
	 * Whenever there is an upload submition the overlay will create a loading pop up.
	 * @param result the result emmited once the overlay form is submitted.
	 */
	public handleOverlayClose(result?: ConfigHubBackupJob): void {
		this.isUploadOverlayOpen = false;
		if (result) {
			const uploadJobInProgress = this.configHubBackupApiService.getUploadBackup(result.jobId);
			const $observer = this.watchUploadJob(uploadJobInProgress);
			const showInProgressAlert =
				result.name && this.totalConfigurationUploads < this.MAX_CONFIGURATION_UPLOADS_ALLOWED;
			this.setBackupUploadProgress(showInProgressAlert);
			this.backupsAsyncAlertService.init($observer, result.name, showInProgressAlert, true);
			this.loadUploadedBackups();
		}
	}

	/**
	 * Loads uploaded backups
	 */
	private loadUploadedBackups(): void {
		this.loading = true;
		this.configHubBackupApiService
			.loadUploadedBackups()
			.pipe(take(1))
			.subscribe({
				next: ({ items }: ApiListResponse<ConfigHubBackupJob>) => {
					this.uploadedBackups = items;
					this.loading = false;
					this.changeDetectorRef.detectChanges();
					if (
						this.totalConfigurationUploads === MAX_CONFIGURATION_UPLOADS_ALLOWED - 1 &&
						items.length === MAX_CONFIGURATION_UPLOADS_ALLOWED
					) {
						this.alertService.open(
							getUploadedBackupLimitWarning(
								this.translateService,
								'CONFIG_HUB.LIMIT_OF_CONFIGURATION_UPLOADS_HAS_BEEN_REACHED'
							)
						);
					}
					this.totalConfigurationUploads = items.length;
					this.latestBackupJobId$.next(getLatestCompletedBackupJobId(items));
				},
				error: () => {
					this.loading = false;
				}
			});
	}

	/**
	 * Initialize the grid options.
	 */
	private initializeGridOptions(): void {
		const actionsColumn = {
			colId: GRID_ACTION_COLUMN_ID,
			...this.columnsService.createActionsColumnWithDropdown(
				[
					{
						label: 'CONFIG_HUB.VIEW_SUMMARY',
						slptIconName: 'eye',
						clickHandle: this.onViewClick.bind(this)
					},
					{
						label: 'CONFIG_HUB.PREPARE_DRAFT_FOR_DEPLOYMENT',
						slptIconName: 'edit',
						clickHandle: this.onPrepareForDeploymentClick.bind(this),
						disabledGetter: rowModel => {
							if (this.isLimitOverrideEnabled) {
								return false;
							} else {
								return rowModel.data.totalObjectCount > limitBackupSize;
							}
						},
						tooltipContentGetter: rowModel =>
							!this.isLimitOverrideEnabled && rowModel.data.totalObjectCount > limitBackupSize
								? {
										translateKey: 'CONFIG_HUB.BACKUP_OBJECTS_WARNING',
										translateParams: { totalObjectCount: rowModel.data.totalObjectCount }
									}
								: null
					},
					{
						label: 'CONFIG_HUB.DELETE',
						slptIconName: 'delete',
						clickHandle: this.onDeleteClick.bind(this)
					}
				],
				this.translateService.instant('CONFIG_HUB.ACTIONS'),
				180
			),
			headerClass: 'backup-uploads-grid__actions-header'
		};
		this.columnDefs = [
			...getUploadedJobsGridColumnDefs(this.translateService, this.datePipe, this.latestBackupJobId$),
			actionsColumn
		];
	}

	/**
	 * Handles click on view backup details
	 * @param data - Table row data
	 */
	private onViewClick({ data: backup }: RowNode<ConfigHubBackupJob>): void {
		this.selectBackup(backup);
	}

	/**
	 * Handles selecting a backup
	 * @param backup - The selected backup
	 */
	private selectBackup(backup?: ConfigHubBackupJob): void {
		this.selectedBackup = backup;
		this.changeDetectorRef.detectChanges();
	}

	/**
	 * Handles click on prepare deployment
	 * @param data - Table row data
	 */
	private onPrepareForDeploymentClick({ data: backup }: RowNode<ConfigHubBackupJob>): void {
		this.handleSummaryOverlayClose();
		this.router.navigate([CONFIG_HUB_URL, ConfigHubChildRoutes.DRAFTS.route, DraftsChildRoutes.CREATE.route], {
			state: {
				sourceBackupId: backup.jobId,
				sourceBackupName: backup.name,
				sourceTenant: null
			}
		});
	}

	/**
	 * Destroy both static and alerts with id.
	 */
	public destroyExistingAlerts(): void {
		this.alertService.destroy();
		Object.values(ConfigHubJobStatus).forEach(status => {
			this.alertService.destroy(status);
		});
	}

	/**
	 * Handles click on delete uploaded backup
	 * @param data - Table row data
	 */
	private onDeleteClick({ data: backup }): void {
		this.modalService.open(getDeleteBackupModalConfig(backup.name, true)).then(confirm => {
			if (!confirm) {
				return;
			}
			this.loading = true;
			this.configHubBackupApiService
				.deleteUploadedBackup(backup.jobId)
				.pipe(take(1))
				.subscribe({
					next: () => {
						this.alertService.open(
							getDeleteBackupSuccessAlertConfig(
								backup.name,
								this.translateService,
								'CONFIG_HUB.SUCCESS_UPLOADED_BACKUP_HAS_BEEN_DELETED'
							)
						);
						this.loading = false;
						this.loadUploadedBackups();
					},
					error: () => (this.loading = false)
				});
		});
		this.destroyExistingAlerts();
	}

	/**
	 * Listen to the grid sort event, in order to refresh the icon displayed for sorting.
	 */
	private onGridSortChanged(): void {
		this.changeDetectorRef.detectChanges();
	}

	/**
	 * Updates the grid rows with information from the uploaded backups.
	 */
	private updateGridRows(): void {
		if (!this.uploadedBackups) {
			return;
		}
		this.loadUploadedBackups();
		this.changeDetectorRef.detectChanges();
	}

	/**
	 * Sets the selected backup to null which hides the summary overlay.
	 */
	public handleSummaryOverlayClose(): void {
		this.selectBackup(null);
	}

	/**
	 * Handle cell clicked.
	 * @param args - Arguments passed from cell click event.
	 */
	private handleCellClicked(args: CellClickedEvent<ConfigHubBackupJob>): void {
		const colId = args.column.getColId();
		const notClickableElements = [GRID_ACTION_COLUMN_ID];
		if (!notClickableElements.includes(colId)) {
			this.selectBackup(args.data);
		}
	}
}
