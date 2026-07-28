/*
 * Copyright (C) 2023 Acme Technologies, Inc.  All rights reserved.
 */
import { DatePipe } from '@angular/common';
import {
	ChangeDetectionStrategy,
	ChangeDetectorRef,
	Component,
	HostListener,
	OnDestroy,
	OnInit,
	ViewChild
} from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

import { Store } from '@ngrx/store';
import { CellClickedEvent, ColDef, GridOptions, GridReadyEvent, RowNode } from 'ag-grid-community';
import { BehaviorSubject, Observable, Subject } from 'rxjs';
import { filter, finalize, switchMap, take, takeUntil, tap } from 'rxjs/operators';

import { AlertsToasterService } from '@acme-priv/armada-angular/src/acme/angular/components/alert';
import { SelectInputItem } from '@acme-priv/armada-angular/src/acme/angular/components/form';
import {
	DataGridActionsMenuDropdownModel,
	DataGridColumnsFactoryService,
	DataGridComponent,
	SlptColDef
} from '@acme-priv/armada-angular/src/acme/angular/components/grid';
import { ModalService } from '@acme-priv/armada-angular/src/acme/angular/components/modal';
import { TranslateService } from '@acme-priv/armada-angular/src/acme/angular/l10n/translation';

import { ApiListResponse } from '@acme-priv/ui-common/src/acme/angular/api';
import { FeatureFlagService } from '@acme-priv/ui-common/src/acme/angular/util';
import { UserRightsService } from '@acme-priv/ui-common/src/acme/angular/util/user-rights';

import { tenantConnectionsSidebarActions } from '../tenant-connections/store/actions';
import { fromTenantConnections } from '../tenant-connections/store/selectors';

import { CONFIG_HUB_URL, ConfigHubChildRoutes } from '../config-hub.model';
import { DraftsChildRoutes } from '../drafts/drafts.model';
import {
	ConfigHubBackupJob,
	ConfigHubBackupType,
	ConfigHubJobStatus,
	GRID_ACTION_COLUMN_ID,
	HydrationStatuses,
	JOB_STATUS_POLL_PERIOD,
	MAX_MANUAL_BACKUPS_ALLOWED,
	gridLoadingModel,
	gridNoDataModel,
	limitBackupSize
} from '../shared/models';
import { ConfigHubRoles } from '../shared/models/config-hub.model';
import { ConfigHubBackupsApiService, ConfigHubTenantConnectionsService } from '../shared/services';
import { BackupsAsyncAlertService } from '../shared/services/backups/backups.async-alert.service';
import { isConfigHubJobDone } from '../shared/utils';
import {
	BackupOverlayResult,
	getDeleteBackupModalConfig,
	getDeleteBackupSuccessAlertConfig,
	getJobsGridColumnDefs,
	getLatestCompletedBackupJobId,
	jobsGridOptions
} from './backup-list.model';
import { BackupChildRoutes } from './backups.model';
import { FeatureFlags } from 'app/featureflags.enum';
import { GlobalValue, LegacyGlobalServiceAdapter } from 'app/shared/services/globals';

/**
 * Configuration Hub Backups Page
 *
 * Displays a list of configuration backups for a user to view and manage.
 */
@Component({
	selector: 'app-config-hub-backup-list',
	templateUrl: './backup-list.component.html',
	styleUrls: ['./backup-list.component.scss'],
	changeDetection: ChangeDetectionStrategy.OnPush
})
export class ConfigHubBackupListComponent implements OnInit, OnDestroy {
	/**
	 * An array of options for the backup select input.
	 */
	public selectBackupInputOptions: Array<SelectInputItem>;

	/**
	 * Column definitions for the Backups grid.
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
		onRowDataUpdated: () => this.changeDetectorRef.detectChanges()
	};

	/**
	 * Whether a backup is currently in progress.
	 */
	public isBackupInProgress = false;

	/**
	 * Flag that determines whether or not the Create Backup Overlay is open.
	 */
	public showCreateBackupOverlay = false;

	/**
	 * The current tenant.
	 */
	public currentTenant: string;

	/**
	 * Currently selected tenant
	 */
	public selectedTenant$ = this.store.select(fromTenantConnections.selectSelectedTenantConnection);

	/**
	 * Whether the grid is currently loading new data.
	 */
	public loading = true;

	/**
	 * Internal grid loading mask model - disabled by default.
	 */
	public loadingModel = gridLoadingModel;

	/**
	 * Model containing the empty state component when the grid has no data.
	 */
	public noDataModel = gridNoDataModel('CONFIG_HUB.USE_CREATE_NEW_BUTTON_TO_INITIATE_BACKUP');

	/**
	 * Selected backup to be displayed in the overlays.
	 */
	public selectedBackup: ConfigHubBackupJob | null;

	/**
	 * An array of backups used to populate the grid.
	 */
	public rows: ConfigHubBackupJob[] = [];

	/**
	 * Value to enable edit mode
	 */
	public isEditMode = false;

	/**
	 * Number of total backups.
	 */
	public totalBackups!: number;

	/**
	 * Number of `MANUAL` type backups.
	 */
	public totalManualBackups = 0;

	/**
	 * Id of the latest backup job
	 */
	private latestBackupJobId$: Subject<string> = new BehaviorSubject<string>(null);

	/**
	 * Number of maximum backups allowed.
	 */
	public readonly MAX_MANUAL_BACKUPS_ALLOWED = MAX_MANUAL_BACKUPS_ALLOWED;

	/**
	 * Whether or not the PLT_UI_ADMIRAL_TENANT_CONNECTIONS_NAV flag is enabled.
	 * TODO: Cleanup in https://acme.atlassian.net/browse/PLTCONFHUB-1026
	 */
	public isTenantConnectionsNavEnabled = this.featureFlagService.isEnabled(
		FeatureFlags.PLT_UI_ADMIRAL_TENANT_CONNECTIONS_NAV
	);

	/**
	 * Whether or not the PLTIN_CONFIG_HUB_LIMIT_OVERRIDE flag is enabled.
	 */
	public isLimitOverrideEnabled = this.featureFlagService.isEnabled(FeatureFlags.PLTIN_CONFIG_HUB_LIMIT_OVERRIDE);

	/**
	 * Whether or not the PLTCONFHUB_SCHEDULED_ACTIONS flag is enabled.
	 */
	public isScheduledActionsEnabled = this.featureFlagService.isEnabled(FeatureFlags.PLTCONFHUB_SCHEDULED_ACTIONS);

	/**
	 * Reference to the DataGridComponent.
	 */
	@ViewChild('slptGrid', { static: true })
	public slptGrid: DataGridComponent;

	/**
	 * Checks wether user can create a backup
	 */
	public canUserCreateBackup$: Promise<boolean>;

	/**
	 * Checks wether user can delete a backup
	 */
	public canUserDeleteBackup$: Promise<boolean>;

	/**
	 * Checks wether user can create a draft
	 */
	public canUserCreateDraft$: Promise<boolean>;

	/**
	 * Checks wether user can schedule actions
	 */
	public canUserScheduleActions$: Promise<boolean>;

	/**
	 * Flag that determines whether or not the Scheduled Jobs Overlay is open.
	 */
	public showScheduledJobsOverlay = false;

	/**
	 * Flag that determines whether or not the backup summary Overlay is open.
	 */
	public showSummaryOverlay = false;

	/**
	 * Subject to unsubscribe on destroy.
	 */
	private unsubscribe$ = new Subject<void>();

	constructor(
		private alertService: AlertsToasterService,
		private activatedRoute: ActivatedRoute,
		private changeDetectorRef: ChangeDetectorRef,
		private columnsService: DataGridColumnsFactoryService,
		private configHubBackupsApiService: ConfigHubBackupsApiService,
		private configHubTenantConnectionsService: ConfigHubTenantConnectionsService,
		private datePipe: DatePipe,
		private featureFlagService: FeatureFlagService,
		private modalService: ModalService,
		private translateService: TranslateService,
		private router: Router,
		private globalService: LegacyGlobalServiceAdapter,
		private store: Store,
		private backupsAsyncAlertService: BackupsAsyncAlertService,
		private userRightsService: UserRightsService
	) {}

	/**
	 * Initialization of the component.
	 */
	public async ngOnInit(): Promise<void> {
		this.currentTenant = this.globalService.get<string>(GlobalValue.OrgScriptName);
		this.canUserCreateBackup$ = this.userRightsService.hasRight(ConfigHubRoles.BACKUP_CREATE);
		this.canUserDeleteBackup$ = this.userRightsService.hasRight(ConfigHubRoles.BACKUP_DELETE);
		this.canUserCreateDraft$ = this.userRightsService.hasRight(ConfigHubRoles.DRAFT_CREATE);
		this.canUserScheduleActions$ = this.userRightsService.hasRight(ConfigHubRoles.SCHEDULED_JOBS_CREATE);
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
	 * Watch for selected tenant change and load backups for the selected tenant
	 */
	private watchSelectedTenantChange(): void {
		this.activatedRoute.paramMap.pipe(takeUntil(this.unsubscribe$)).subscribe(paramMap => {
			const tenantConnectionId = paramMap.get('id');
			this.store.dispatch(tenantConnectionsSidebarActions.tenantConnectionsSidebarSelect({ tenantConnectionId }));
			if (tenantConnectionId) {
				this.loadBackupsFromTenant(tenantConnectionId);
			} else {
				this.loadBackups();
			}
			this.initializeGridOptions(tenantConnectionId);
		});
	}

	/**
	 * Opens the Create Backup Modal when the Create Backup Button is clicked.
	 */
	public handleCreateBackupClicked(): void {
		if (!this.isBackupInProgress && this.totalManualBackups < this.MAX_MANUAL_BACKUPS_ALLOWED) {
			this.showCreateBackupOverlay = true;
			this.destroyExistingAlerts();
		}
	}

	/**
	 * Sets the selected backup to null which hides the summary overlay.
	 */
	public handleSummaryOverlayClose(): void {
		this.showSummaryOverlay = false;
		this.selectedBackup = null;
	}

	/**
	 * Sets the flag that shows the backup overlay to false and validates if a backup should be created
	 * @param result Result of the backup overlay dismissal
	 */
	public handleBackupOverlayClose(result: BackupOverlayResult): void {
		this.showCreateBackupOverlay = false;
		if (result.backupName && result.selectedObjectTypes.length > 0) {
			const backupJobInProgress$ = this.handleBackupJob(result);
			const $observer = this.watchBackupJob(backupJobInProgress$);
			const showInProgressAlert = result.backupName && this.totalManualBackups < MAX_MANUAL_BACKUPS_ALLOWED;

			this.setBackupInProgress(showInProgressAlert);
			this.backupsAsyncAlertService.init($observer, result.backupName, showInProgressAlert);
		}
	}

	/**
	 * Creates a backup job for a regular or partial backup
	 * @param result Result of the backup overlay dismissal
	 * @returns {Observable<ConfigHubBackupJob>}
	 */
	public handleBackupJob(result: BackupOverlayResult): Observable<ConfigHubBackupJob> {
		return result.isPartialBackup
			? this.configHubBackupsApiService.createPartialBackupJob(
					result.backupName,
					result.selectedObjectTypes,
					result.options
				)
			: this.configHubBackupsApiService.createBackupJob(result.backupName);
	}

	/**
	 * Handles the gridReady event when the grid loads and initiates loading backups.
	 * @param event - The grid ready event emitted by ag-grid.
	 */
	public onGridReady(event?: GridReadyEvent): void {
		if (!this.gridApi) {
			this.gridApi = event;
		}

		this.checkForInProgressJobs();
		// TODO: Cleanup in https://acme.atlassian.net/browse/PLTCONFHUB-1026
		if (this.isTenantConnectionsNavEnabled) {
			this.watchSelectedTenantChange();
		} else {
			this.loadBackups();
		}
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
	 * Gets the number of manual backups.
	 * @param {ConfigHubBackupJob[]} rows - list of backup jobs.
	 * @returns {number} total of manual backups.
	 */
	private getManualBackupsTotal(rows: ConfigHubBackupJob[]): number {
		return rows.filter(row => row.backupType === ConfigHubBackupType.MANUAL).length;
	}

	/**
	 * Asks for confirmation and deletes backup.
	 */
	private handleDeleteBackup({ name, jobId, backupType }: ConfigHubBackupJob): void {
		if (backupType !== ConfigHubBackupType.MANUAL) {
			return;
		}
		this.destroyExistingAlerts();
		this.modalService.open(getDeleteBackupModalConfig(name)).then(confirm => {
			if (!confirm) {
				return;
			}
			this.loading = true;
			this.configHubBackupsApiService
				.deleteBackup(jobId)
				.pipe(take(1))
				.subscribe({
					next: () => {
						this.alertService.open(
							getDeleteBackupSuccessAlertConfig(
								name,
								this.translateService,
								'CONFIG_HUB.SUCCESS_BACKUP_HAS_BEEN_DELETED'
							)
						);
						this.rows = this.rows.filter(row => row.jobId !== jobId);
						this.setBackupRowsData(this.rows);
					},
					error: () => (this.loading = false)
				});
		});
	}

	/**
	 * Initialize the grid options.
	 */
	private async initializeGridOptions(selectedTenant?: string): Promise<void> {
		const actionButtons = await this.getActionButtons(selectedTenant);
		const actionsColumn = this.createActionsColumn(selectedTenant, actionButtons);
		this.columnDefs = getJobsGridColumnDefs(this.translateService, this.datePipe, this.latestBackupJobId$);
		this.columnDefs.push(actionsColumn);
		this.gridOptions.onCellClicked = this.handleCellClicked.bind(this);
		this.changeDetectorRef.detectChanges();
	}

	/**
	 * Returns action buttons based on roles
	 */
	private async getActionButtons(selectedTenant: String): Promise<DataGridActionsMenuDropdownModel[]> {
		const viewSummaryAction: DataGridActionsMenuDropdownModel = {
			slptIconName: '',
			label: 'CONFIG_HUB.VIEW_SUMMARY',
			preventFocusedMenuOnClick: true,
			disabledGetter: ({ data }) => data.fileExists === false,
			clickHandle: ({ data: backup }: RowNode<ConfigHubBackupJob>) => this.updateSelectedBackup(backup)
		};

		const prepareDraftAction: DataGridActionsMenuDropdownModel = {
			slptIconName: '',
			label: 'CONFIG_HUB.PREPARE_DRAFT_FOR_DEPLOYMENT',
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
					: null,
			preventFocusedMenuOnClick: true,
			clickHandle: ({ data: backup }: RowNode<ConfigHubBackupJob>) => {
				this.router.navigate(
					[CONFIG_HUB_URL, ConfigHubChildRoutes.DRAFTS.route, DraftsChildRoutes.CREATE.route],
					{
						state: {
							sourceBackupId: backup.jobId,
							sourceBackupName: backup.name,
							...(selectedTenant && { sourceTenant: selectedTenant })
						}
					}
				);
			}
		};

		const viewDetailsAction: DataGridActionsMenuDropdownModel = {
			slptIconName: '',
			label: 'CONFIG_HUB.VIEW_DETAILS',
			preventFocusedMenuOnClick: true,
			clickHandle: ({ data: backup }: RowNode<ConfigHubBackupJob>) => this.handleViewDetails(backup)
		};

		const createScheduledJobAction: DataGridActionsMenuDropdownModel = {
			slptIconName: '',
			label: 'CONFIG_HUB.CREATE_SCHEDULED_JOB',
			preventFocusedMenuOnClick: true,
			clickHandle: ({ data: backup }: RowNode<ConfigHubBackupJob>) => this.handleCreateScheduledJob(backup)
		};

		const deleteBackupAction: DataGridActionsMenuDropdownModel = {
			slptIconName: '',
			label: 'CONFIG_HUB.DELETE',
			preventFocusedMenuOnClick: true,
			clickHandle: ({ data }: RowNode<ConfigHubBackupJob>) => this.handleDeleteBackup(data),
			hiddenGetter: ({ data }: { data: ConfigHubBackupJob }) => data.backupType !== ConfigHubBackupType.MANUAL
		};

		const actionButtons: DataGridActionsMenuDropdownModel[] = [viewSummaryAction];

		if (await this.canUserCreateDraft$) {
			actionButtons.push(prepareDraftAction);
		}

		if (!selectedTenant) {
			actionButtons.push(viewDetailsAction);
		}

		if (this.isScheduledActionsEnabled && !selectedTenant && (await this.canUserScheduleActions$)) {
			actionButtons.push(createScheduledJobAction);
		}

		if ((await this.canUserDeleteBackup$) && !selectedTenant) {
			actionButtons.push(deleteBackupAction);
		}

		return actionButtons;
	}

	/**
	 * Start Hydration and redirect to backup details view
	 * @param backup - The selected backup data
	 */
	public handleViewDetails(backup: ConfigHubBackupJob): void {
		if (backup.hydrationStatus === HydrationStatuses.NOT_HYDRATED) {
			this.loading = true;
			this.configHubBackupsApiService
				.hydrateBackup(backup.jobId)
				.pipe(
					take(1),
					finalize(() => (this.loading = false))
				)
				.subscribe(() => {
					this.navigateToDetails(backup);
				});
		} else {
			this.navigateToDetails(backup);
		}
	}

	/**
	 * Open the modal to create a scheduled job
	 * @param backup - The selected backup data
	 */
	public handleCreateScheduledJob(backup: ConfigHubBackupJob): void {
		this.selectedBackup = backup;
		this.showScheduledJobsOverlay = true;
	}

	/**
	 * Handles when the scheduled jobs overlay is dismissed
	 */
	public handleScheduledJobsOverlayDismiss(): void {
		this.showScheduledJobsOverlay = false;
		this.selectedBackup = null;
		this.isEditMode = false;
	}

	/**
	 * Navigate to the backup details view
	 * @param backup - The selected backup data
	 */
	private navigateToDetails(backup: ConfigHubBackupJob): void {
		this.router.navigateByUrl(
			`${CONFIG_HUB_URL}/${BackupChildRoutes.BACKUP_DETAILS.route.replace(':id', backup.jobId)}`
		);
	}

	/**
	 * Creates the actions column for the grid view
	 * @param selectedTenant The currently selected tenant
	 */
	private createActionsColumn(selectedTenant: string, actionButtons: DataGridActionsMenuDropdownModel[]): ColDef {
		const actionsColumn = this.columnsService.createActionsColumnWithDropdown(
			actionButtons,
			this.translateService.instant('CONFIG_HUB.ACTIONS'),
			150
		);
		actionsColumn.colId = GRID_ACTION_COLUMN_ID;
		actionsColumn.cellStyle = {
			marginTop: '-2px'
		};
		actionsColumn.headerClass = 'backup-list-grid__actions-header';

		return actionsColumn;
	}

	/**
	 * Listen to the grid sort event, in order to refresh the icon displayed for sorting.
	 */
	private onGridSortChanged() {
		this.changeDetectorRef.detectChanges();
	}

	/**
	 * Handles changes to a job's status.
	 * @param backupJob - The the backup job to handle.
	 */
	private handleBackupJobStatusChanges(backupJob: ConfigHubBackupJob): void {
		if (isConfigHubJobDone(backupJob.status)) {
			this.loadBackups();
			this.setBackupInProgress(false);
		}
	}

	/**
	 * Handle cell clicked.
	 * @param args - Arguments passed from cell click event.
	 */
	private handleCellClicked(args: CellClickedEvent<ConfigHubBackupJob>): void {
		const colId = args.column.getColId();
		const notClickableElements = [GRID_ACTION_COLUMN_ID];
		if (!notClickableElements.includes(colId)) {
			this.updateSelectedBackup(args.data);
		}
	}

	/**
	 * Destroy both static and alerts with id.
	 */
	private destroyExistingAlerts(): void {
		this.alertService.destroy();
		Object.values(ConfigHubJobStatus).forEach(status => {
			this.alertService.destroy(status);
		});
	}

	/**
	 * Checks for in progress jobs to track their status.
	 */
	private checkForInProgressJobs(): void {
		const backupJobInProgress$ = this.configHubBackupsApiService.loadInProgressBackupJob();
		this.watchBackupJob(backupJobInProgress$).subscribe();
	}

	/**
	 * Loads the Configuration Hub backups.
	 */
	private loadBackups(): void {
		this.loading = true;
		this.configHubBackupsApiService
			.loadCompletedBackupJobs()
			.pipe(take(1))
			.subscribe({
				next: ({ items }: ApiListResponse<ConfigHubBackupJob>) => {
					this.setBackupRowsData(items);
				},
				error: () => (this.loading = false)
			});
	}

	/**
	 * Loads the Configuration Hub backups from the selected tenant.
	 * @param sourceTenant The name of the tenant to get backups for
	 */
	private loadBackupsFromTenant(sourceTenant: string): void {
		this.loading = true;
		this.configHubTenantConnectionsService
			.listTenantConnectionsBackups(sourceTenant)
			.pipe(take(1))
			.subscribe({
				next: (items: ConfigHubBackupJob[]) => {
					this.setBackupRowsData(items);
				},
				error: () => (this.loading = false)
			});
	}

	/**
	 * Sets the data for the grid rows
	 */
	private setBackupRowsData(items: ConfigHubBackupJob[]): void {
		this.rows = items;
		this.totalBackups = items.length;
		this.totalManualBackups = this.getManualBackupsTotal(items);
		this.latestBackupJobId$.next(getLatestCompletedBackupJobId(items));
		this.loading = false;
		this.changeDetectorRef.detectChanges();
	}

	/**
	 * Toggles isBackupInProgress.
	 * @param isInProgress next backup in progress state
	 */
	private setBackupInProgress(isInProgress: boolean): void {
		this.isBackupInProgress = isInProgress;
		this.changeDetectorRef.detectChanges();
	}

	/**
	 * Updates the selected backup and the array of options for the backup select input.
	 */
	private updateSelectedBackup(selectedBackup: ConfigHubBackupJob): void {
		this.showSummaryOverlay = true;
		this.selectedBackup = selectedBackup;

		this.selectBackupInputOptions = [
			...this.rows.flatMap(backup =>
				backup.jobId === selectedBackup.jobId
					? []
					: {
							displayName: { untranslated: backup.name },
							value: backup.jobId
						}
			)
		];

		this.changeDetectorRef.detectChanges();
	}

	/**
	 * Monitors a backup job and initiates changes when the job's status changes.
	 * @param backupJobToWatch - The backup job to watch.
	 * @returns {Observable<ConfigHubBackupJob>}
	 */
	private watchBackupJob(backupJobToWatch$: Observable<ConfigHubBackupJob>): Observable<ConfigHubBackupJob> {
		return backupJobToWatch$.pipe(
			filter(Boolean),
			switchMap((backupJob: ConfigHubBackupJob) => {
				this.setBackupInProgress(!isConfigHubJobDone(backupJob.status));
				return this.configHubBackupsApiService.watchInProgressJob(backupJob.jobId, JOB_STATUS_POLL_PERIOD);
			}),
			tap(backupJob => this.handleBackupJobStatusChanges(backupJob))
		);
	}
}
