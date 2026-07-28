import { ChangeDetectorRef, Component, OnDestroy, OnInit } from '@angular/core';

import { ColDef, GridOptions, RowNode } from 'ag-grid-community';
import { Subject, take } from 'rxjs';

import { AlertsToasterService } from '@acme-priv/armada-angular/src/acme/angular/components/alert';
import {
	DataGridActionsMenuDropdownModel,
	DataGridColumnsFactoryService,
	DataGridLoadingComponent,
	DataGridNoDataComponent,
	SlptColDef
} from '@acme-priv/armada-angular/src/acme/angular/components/grid';
import { ModalService } from '@acme-priv/armada-angular/src/acme/angular/components/modal';
import { TranslateService } from '@acme-priv/armada-angular/src/acme/angular/l10n/translation';
import { CronExpressionService } from '@acme-priv/armada-angular/src/acme/angular/util/cron-expression';

import { FeatureFlagService } from '@acme-priv/ui-common/src/acme/angular/util/feature-flag';
import { UserRightsService } from '@acme-priv/ui-common/src/acme/angular/util/user-rights';

import {
	ConfigHubBackupJob,
	ConfigHubScheduledJob,
	GRID_ACTION_COLUMN_ID,
	getDeleteScheduledJobModalConfig,
	getScheduledJobSuccessAlertConfig,
	getScheduledJobsGridColumnDefs,
	gridLoadingModel,
	gridNoDataModel
} from '../shared/models';
import { ConfigHubRoles } from '../shared/models/config-hub.model';
import { ConfigHubScheduledJobsApiService } from '../shared/services/scheduled-jobs/scheduled-jobs.api.service';
import { FeatureFlags } from 'app/featureflags.enum';

@Component({
	selector: 'app-scheduled-jobs',
	templateUrl: './scheduled-jobs.component.html',
	styleUrls: ['./scheduled-jobs.component.scss']
})
export class ConfigHubScheduledJobsComponent implements OnInit, OnDestroy {
	/**
	 * Column definitions for the Scheduled Jobs grid.
	 */
	public columnDefs: SlptColDef[];

	/**
	 * An array of scheduled jobs used to populate the grid.
	 */
	public scheduledJobsList: ConfigHubScheduledJob[] = [];

	/**
	 * Whether the grid is currently loading new data.
	 */
	public loading = true;

	/**
	 * The options for the grid.
	 */
	public gridOptions: GridOptions = {
		getRowId: data => data?.data?.id,
		suppressMovableColumns: true,
		enableBrowserTooltips: true,
		suppressMultiSort: true,
		suppressColumnVirtualisation: true,
		colResizeDefault: 'shift',
		domLayout: 'normal',
		components: {
			customLoadingOverlay: DataGridLoadingComponent,
			customNoRowsOverlay: DataGridNoDataComponent
		},
		onSortChanged: this.onGridSortChanged.bind(this),
		onRowDataUpdated: () => this.changeDetectorRef.detectChanges()
	};

	/**
	 * Model containing the empty state component when the grid has no data.
	 */
	public noDataModel = gridNoDataModel('CONFIG_HUB.USE_CREATE_NEW_BUTTON_TO_INITIATE_SCHEDULED_JOB');

	/**
	 * Internal grid loading mask model - disabled by default.
	 */
	public loadingModel = gridLoadingModel;

	/**
	 * Internal grid loading mask model - disabled by default.
	 */
	public scheduledJobSelected: ConfigHubScheduledJob;

	/**
	 * Check wether user can delete scheduled jobs
	 */
	private canUserDeleteScheduledJobs$: Promise<boolean>;

	/**
	 * Value to enable edit mode
	 */
	public isEditMode = false;

	/**
	 * Flag that determines whether or not the Scheduled Jobs Overlay is open.
	 */
	public showScheduledJobsOverlay = false;

	/**
	 * Whether or not the PLTCONFHUB_SCHEDULED_ACTIONS flag is enabled.
	 */
	public isScheduledActionsEnabled = this.featureFlagService.isEnabled(FeatureFlags.PLTCONFHUB_SCHEDULED_ACTIONS);

	/**
	 * Checks wether user can update schedule actions
	 */
	public canUserUpdateScheduleActions$: Promise<boolean>;

	/**
	 * Subject to unsubscribe on destroy.
	 */
	private unsubscribe$ = new Subject<void>();

	constructor(
		private columnsService: DataGridColumnsFactoryService,
		private translateService: TranslateService,
		private alertService: AlertsToasterService,
		private modalService: ModalService,
		private configHubScheduledJobsApiService: ConfigHubScheduledJobsApiService,
		private changeDetectorRef: ChangeDetectorRef,
		private userRightsService: UserRightsService,
		private featureFlagService: FeatureFlagService,
		private cronExpressionService: CronExpressionService
	) {}

	/**
	 * Initialization of the component.
	 */
	public async ngOnInit(): Promise<void> {
		this.canUserDeleteScheduledJobs$ = this.userRightsService.hasRight(ConfigHubRoles.SCHEDULED_JOBS_DELETE);
		this.canUserUpdateScheduleActions$ = this.userRightsService.hasRight(ConfigHubRoles.SCHEDULED_JOBS_UPDATE);
		this.initializeGridOptions();
		this.updateScheduledJobsList();
	}

	/**
	 * Clean up when the instance is destroyed.
	 */
	public ngOnDestroy(): void {
		this.unsubscribe$.next();
		this.unsubscribe$.complete();
	}

	/**
	 * Initialize the grid options.
	 */
	private async initializeGridOptions(): Promise<void> {
		const actionButtons = await this.getActionButtons();
		const actionsColumn = this.createActionsColumn(actionButtons);
		this.columnDefs = getScheduledJobsGridColumnDefs(this.translateService, this.cronExpressionService);
		this.columnDefs.push(actionsColumn);
	}

	/**
	 * Listen to the grid sort event, in order to refresh the icon displayed for sorting.
	 */
	private onGridSortChanged() {
		this.changeDetectorRef.detectChanges();
	}

	/**
	 * Returns action buttons
	 */
	private async getActionButtons(): Promise<DataGridActionsMenuDropdownModel[]> {
		const viewDetailsAction: DataGridActionsMenuDropdownModel = {
			slptIconName: '',
			label: 'CONFIG_HUB.VIEW_DETAILS',
			preventFocusedMenuOnClick: true,
			clickHandle: ({ data }: any) => (this.scheduledJobSelected = data)
		};

		const EditAction: DataGridActionsMenuDropdownModel = {
			slptIconName: '',
			label: 'CONFIG_HUB.EDIT',
			preventFocusedMenuOnClick: true,
			clickHandle: ({ data: job }: RowNode<ConfigHubScheduledJob>) => this.handleEditScheduledJob(job)
		};

		const DeleteAction: DataGridActionsMenuDropdownModel = {
			slptIconName: '',
			label: 'CONFIG_HUB.DELETE',
			preventFocusedMenuOnClick: true,
			clickHandle: this.handleDeleteScheduledJob.bind(this)
		};

		const actionButtons: DataGridActionsMenuDropdownModel[] = [viewDetailsAction];

		if (this.isScheduledActionsEnabled && (await this.canUserUpdateScheduleActions$)) {
			actionButtons.push(EditAction);
		}

		if (this.isScheduledActionsEnabled && (await this.canUserDeleteScheduledJobs$)) {
			actionButtons.push(DeleteAction);
		}

		return actionButtons;
	}

	/**
	 * Creates the actions column for the grid view
	 */
	private createActionsColumn(actionButtons: DataGridActionsMenuDropdownModel[]): ColDef {
		const actionsColumn = this.columnsService.createActionsColumnWithDropdown(
			actionButtons,
			this.translateService.instant('CONFIG_HUB.ACTIONS'),
			150
		);
		actionsColumn.colId = GRID_ACTION_COLUMN_ID;
		actionsColumn.cellStyle = {
			marginTop: '-2px'
		};
		actionsColumn.headerClass = 'scheduled-jobs-list-grid__actions-header';

		return actionsColumn;
	}

	/**
	 * Open the modal to edit a scheduled job
	 * @param backup - The selected backup data
	 */
	public handleEditScheduledJob(job: ConfigHubScheduledJob): void {
		this.scheduledJobSelected = job;
		this.isEditMode = true;
		this.showScheduledJobsOverlay = true;
	}

	/**
	 * Handles when the scheduled jobs overlay is dismissed
	 */
	public handleScheduledJobsOverlayDismiss(): void {
		this.showScheduledJobsOverlay = false;
		this.isEditMode = false;
		this.scheduledJobSelected = null;
	}

	/**
	 * Handles when the scheduled job gets updated
	 */
	public handleUpdatedJob(updatedJob: ConfigHubScheduledJob | ConfigHubBackupJob): void {
		if ('id' in updatedJob) {
			this.scheduledJobsList = this.scheduledJobsList.map(job => (job.id === updatedJob.id ? updatedJob : job));
		}
	}

	/**
	 * Get scheduled jobs from API
	 */
	private updateScheduledJobsList(): void {
		this.configHubScheduledJobsApiService
			.listScheduledJob()
			.pipe(take(1))
			.subscribe({
				next: objectScheduledJobsList => {
					this.scheduledJobsList = objectScheduledJobsList.items;
					this.changeDetectorRef.detectChanges();
					this.loading = false;
				},
				error: () => {
					this.loading = false;
				}
			});
	}

	/**
	 * Handle delete action for schedule job
	 * @param rowNode - The object selected for deletion
	 */
	public handleDeleteScheduledJob({ data: scheduledJob }): void {
		this.modalService.open(getDeleteScheduledJobModalConfig()).then(confirm => {
			if (!confirm) {
				return;
			}

			this.loading = true;
			this.configHubScheduledJobsApiService.deleteScheduledJob(scheduledJob.id).subscribe({
				next: () => {
					this.scheduledJobsList = this.scheduledJobsList.filter(({ id }) => id !== scheduledJob.id);
					this.alertService.open(
						getScheduledJobSuccessAlertConfig(
							this.translateService,
							'CONFIG_HUB.SCHEDULED_JOB_HAS_BEEN_DELETED'
						)
					);
					this.loading = false;
				},
				error: () => {
					this.loading = false;
				}
			});
		});
	}
}
