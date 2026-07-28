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

import { GridOptions, GridReadyEvent, RowNode } from 'ag-grid-community';
import { Subject, take } from 'rxjs';

import {
	DataGridActionsMenuDropdownModel,
	DataGridColumnsFactoryService,
	DataGridComponent,
	SlptColDef
} from '@acme-priv/armada-angular/src/acme/angular/components/grid';
import { TranslateService } from '@acme-priv/armada-angular/src/acme/angular/l10n/translation';
import { Alignment } from '@acme-priv/armada-angular/src/acme/theme/typescript';

import { FeatureFlagService } from '@acme-priv/ui-common/src/acme/angular/util';
import { UserRightsService } from '@acme-priv/ui-common/src/acme/angular/util/user-rights';

import { CONFIG_HUB_PAGE_SIZE_OPTIONS, ConfigHubDeployJob, gridLoadingModel, gridNoDataModel } from '../shared/models';
import { ConfigHubRoles } from '../shared/models/config-hub.model';
import { ConfigHubDeployResults, ConfigHubSyncJob } from '../shared/models/job.model';
import { ConfigHubDeployApiService } from '../shared/services';
import { ConfigHubCloudStorageSyncApiService } from '../shared/services/cloud-storage/cloud-storage-sync.service';
import {
	ConfigHubActivityLogGridTabs,
	GridTabs,
	PrevioslyCloudSyncLoadedData,
	PrevioslyDeployLoadedData,
	getCloudSyncJobsGridColumnDefs,
	getDeployJobsGridColumnDefs,
	gridTabs,
	jobsGridOptions
} from './activity-log.model';

/**
 * Activity Log Page
 *
 * Acts as a container for child components, enabling navigation between them via a side navigation bar.
 */
@Component({
	selector: 'app-activity-log',
	templateUrl: './activity-log.component.html',
	styleUrls: ['./activity-log.component.scss'],
	changeDetection: ChangeDetectionStrategy.OnPush
})
export class ConfigHubActivityLogComponent implements OnInit, OnDestroy {
	/**
	 * Column definitions for the Activity Log grid.
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
		autoSizeStrategy: {
			type: 'fitGridWidth'
		},
		onSortChanged: this.onGridSortChanged.bind(this)
	};

	/**
	 * The selectable page size options.
	 */
	public pageSizeOptions = CONFIG_HUB_PAGE_SIZE_OPTIONS;

	/**
	 * Activity Log view loading state
	 */
	public loading = false;

	/**
	 * Internal grid loading mask model - disabled by default.
	 */
	public loadingModel = gridLoadingModel;

	/**
	 * Model containing the empty state component when the grid has no data.
	 */
	public noDataModel = gridNoDataModel();

	/**
	 * An array of containing activity log data. Used to populate the grid.
	 */
	public rows: ConfigHubDeployJob[] | ConfigHubSyncJob[] = [];

	/**
	 * The deploy activity log data
	 */
	public deployLogs: ConfigHubDeployJob[] = [];

	/**
	 * The deploy activity log data
	 */
	public cloudSyncLogs: ConfigHubSyncJob[] = [];

	/**
	 * Handles details overlay display
	 */
	public showDetailsOverlay = false;

	/**
	 * Details overlay data, when details are selected the overlay display
	 */
	public selectedDetails: ConfigHubDeployJob;

	/**
	 * Download results object
	 */
	public downloadResults: ConfigHubDeployResults;

	/**
	 * Page Size Indicator
	 */
	public pageSize = CONFIG_HUB_PAGE_SIZE_OPTIONS[2];

	/**
	 * The currently selected page.
	 */
	public currentPage = 1;

	/**
	 * The total amount of pages.
	 */
	public totalPages: number;

	/**
	 * Next token
	 */
	public lastEvaluatedObject: string;

	/**
	 * The currently selected tab
	 */
	public currentTab: ConfigHubActivityLogGridTabs = ConfigHubActivityLogGridTabs.GRID_DEPLOY;

	/**
	 * Tabs for the grid component
	 */
	public tabs: GridTabs[];

	/**
	 * Alignment used for the pager
	 */
	public Alignment = Alignment;

	/**
	 * Grod tab names enum to use for the conditional rendering
	 */
	public readonly configHubActivityLogGridTabs: typeof ConfigHubActivityLogGridTabs = ConfigHubActivityLogGridTabs;

	/**
	 * Reference to the DataGridComponent.
	 */
	@ViewChild('slptGrid', { static: true })
	public slptGrid: DataGridComponent;

	/**
	 * Checks wether the user have the right to access cloud storage
	 */
	public canUserSeeCloudStorage: boolean | null = null;

	/**
	 * Subject to unsubscribe on destroy.
	 */
	private unsubscribe$ = new Subject<void>();

	private deployObjectsRetrieved: PrevioslyDeployLoadedData = {};

	private cloudSyncObjectsRetrieved: PrevioslyCloudSyncLoadedData = {};

	constructor(
		private changeDetectorRef: ChangeDetectorRef,
		private translateService: TranslateService,
		private columnsService: DataGridColumnsFactoryService,
		private datePipe: DatePipe,
		private configHubDeployApiService: ConfigHubDeployApiService,
		private configHubCloudStorageSyncApiService: ConfigHubCloudStorageSyncApiService,
		private featureFlagService: FeatureFlagService,
		private userRightsService: UserRightsService
	) {}

	// TODO: Add tests and fix message column.
	/**
	 * Initialization of the component.
	 */
	public ngOnInit(): void {
		this.tabs = gridTabs();
		this.selectDataToLoad(this.currentTab);
		this.loadUserPermissions();
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

		switch (this.currentTab) {
			case ConfigHubActivityLogGridTabs.GRID_DEPLOY:
				this.updateGridForDeployRows();
				break;
			case ConfigHubActivityLogGridTabs.GRID_CLOUD:
				this.updateGridForCloudSyncRows();
				break;
		}
	}

	/**
	 * Handles the event in which the user changes to a different page.
	 * @param newPage - The index of the page.
	 */
	public onPageChanged(newPage: number) {
		this.currentPage = newPage;
		this.selectDataToLoad(this.currentTab);
	}

	/**
	 * Handles the event in which the user selects a different page size
	 * @param pageSize - The size of the page.
	 */
	public onPageSizeChanges(pageSize: number) {
		this.pageSize = pageSize;
		this.resetVariables();
		this.selectDataToLoad(this.currentTab);
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
	 * Hide details overlay and reset data
	 */
	public handleDetailsOverlayClose(): void {
		this.showDetailsOverlay = false;
		this.selectedDetails = null;
	}

	/**
	 * Handle tab click to define current tab
	 * @param tab selected tab
	 */
	public handleTabClick(tab: number): void {
		this.currentTab = tab;
		this.pageSize = CONFIG_HUB_PAGE_SIZE_OPTIONS[2];
		this.resetVariables();
		this.selectDataToLoad(tab);
	}

	/**
	 * Determines whether to show a tab based on the tab index and cloud storage sync status.
	 *
	 * @param {ConfigHubActivityLogGridTabs} tabIndex - The index of the tab to show.
	 * @return {boolean} True if the tab should be shown, false otherwise.
	 */
	public showTab(tabIndex: ConfigHubActivityLogGridTabs): boolean {
		const isTabIndexCloudSync = tabIndex === ConfigHubActivityLogGridTabs.GRID_CLOUD;

		if (isTabIndexCloudSync) {
			return this.canUserSeeCloudStorage;
		}

		return true;
	}

	/**
	 * Asynchronously loads the user's permissions for accessing cloud storage.
	 *
	 * @return {Promise<void>} A Promise that resolves when the user's permissions are loaded.
	 */
	private async loadUserPermissions(): Promise<void> {
		this.canUserSeeCloudStorage = await this.userRightsService.hasRight(ConfigHubRoles.CLOUD_STORAGE_PAGE);
	}

	/**
	 * Selects the appropriate function to load data based on the given tab number.
	 *
	 * @param {number} tab - The tab number indicating which data to load.
	 */
	private selectDataToLoad(tab: number) {
		switch (tab) {
			case ConfigHubActivityLogGridTabs.GRID_DEPLOY:
				this.loadDeployLogs();
				this.initializeDeployGridOptions();
				break;
			case ConfigHubActivityLogGridTabs.GRID_CLOUD:
				this.loadCloudSyncLogs();
				this.initializeCloudSyncGridOptions();
				break;
		}
	}

	/**
	 * Resets the variables to their initial values.
	 */
	private resetVariables(): void {
		this.currentPage = 1;
		this.totalPages = null;
		this.lastEvaluatedObject = null;
		this.cloudSyncLogs = [];
		this.deployLogs = [];
	}

	/**
	 * Loads deploy activity logs
	 */
	private loadDeployLogs(): void {
		this.loading = true;
		if (
			this.deployObjectsRetrieved[this.pageSize] &&
			this.currentPage <= this.deployObjectsRetrieved[this.pageSize].length
		) {
			const previousResponses = this.deployObjectsRetrieved[this.pageSize];
			const previousResponse = previousResponses[this.currentPage - 1];
			this.lastEvaluatedObject = this.deployObjectsRetrieved[this.pageSize][this.currentPage - 1].nextToken;

			this.deployLogs = previousResponse.items;
			if (!previousResponse.nextToken) {
				this.totalPages = this.currentPage;
			}
			this.updateGridForDeployRows();
			this.loading = false;
			return;
		}

		this.configHubDeployApiService
			.getDeployListPaginated(this.lastEvaluatedObject, this.pageSize)
			.pipe(take(1))
			.subscribe({
				next: activity => {
					this.deployLogs = activity.items;
					this.lastEvaluatedObject = activity.nextToken;

					if (this.deployObjectsRetrieved[this.pageSize]) {
						this.deployObjectsRetrieved[this.pageSize].push(activity);
					} else {
						this.deployObjectsRetrieved[this.pageSize] = [activity];
					}

					if (!activity.nextToken) {
						this.totalPages = this.currentPage;
					}
					this.updateGridForDeployRows();
					this.loading = false;
				},
				error: () => {
					this.loading = false;
				}
			});
	}

	/**
	 * Loads deploy activity logs
	 */
	private loadCloudSyncLogs(): void {
		this.loading = true;

		if (
			this.cloudSyncObjectsRetrieved[this.pageSize] &&
			this.currentPage <= this.cloudSyncObjectsRetrieved[this.pageSize].length
		) {
			const previousResponses = this.cloudSyncObjectsRetrieved[this.pageSize];
			const previousResponse = previousResponses[this.currentPage - 1];
			this.lastEvaluatedObject = this.cloudSyncObjectsRetrieved[this.pageSize][this.currentPage - 1].nextToken;

			this.cloudSyncLogs = previousResponse.items;
			if (!previousResponse.nextToken) {
				this.totalPages = this.currentPage;
			}
			this.updateGridForCloudSyncRows();
			this.loading = false;
			return;
		}

		this.configHubCloudStorageSyncApiService
			.getCloudSyncListPaginated(this.lastEvaluatedObject, this.pageSize)
			.pipe(take(1))
			.subscribe({
				next: activity => {
					this.cloudSyncLogs = activity.items;
					this.lastEvaluatedObject = activity.nextToken;

					if (this.cloudSyncObjectsRetrieved[this.pageSize]) {
						this.cloudSyncObjectsRetrieved[this.pageSize].push(activity);
					} else {
						this.cloudSyncObjectsRetrieved[this.pageSize] = [activity];
					}

					if (!activity.nextToken) {
						this.totalPages = this.currentPage;
					}
					this.updateGridForCloudSyncRows();
					this.loading = false;
				},
				error: () => {
					this.loading = false;
				}
			});
	}

	/**
	 * Initialize the deploy grid options.
	 */
	private initializeDeployGridOptions(): void {
		this.columnDefs = getDeployJobsGridColumnDefs(this.translateService, this.datePipe);
		const actionsColumn = {
			colId: 'view',
			...this.columnsService.createActionsColumnWithDropdown(
				[
					{
						label: 'CONFIG_HUB.VIEW',
						slptIconName: 'view',
						clickHandle: this.onViewClick.bind(this),
						disabledGetter: ({ data }) => data.fileExists === false
					} as DataGridActionsMenuDropdownModel
				],
				this.translateService.instant('CONFIG_HUB.ACTIONS'),
				180
			),
			headerClass: 'activity-log-grid__actions-header'
		};
		this.columnDefs.push(actionsColumn);
	}

	/**
	 * Initialize the cloud sync grid options.
	 */
	private initializeCloudSyncGridOptions(): void {
		this.columnDefs = getCloudSyncJobsGridColumnDefs(this.translateService, this.datePipe, this.featureFlagService);
	}

	/**
	 * Handles click on view link, show overlay and set data
	 * @param data - Table row data
	 */
	private onViewClick({ data }: RowNode): void {
		this.showDetailsOverlay = true;

		this.configHubDeployApiService
			.getDownload(data.jobId)
			.pipe(take(1))
			.subscribe({
				next: results => {
					this.downloadResults = results;
					this.selectedDetails = data;
					this.changeDetectorRef.detectChanges();
				},
				error: () => {
					this.showDetailsOverlay = false;
					this.changeDetectorRef.detectChanges();
				}
			});
	}

	/**
	 * Listen to the grid sort event, in order to refresh the icon displayed for sorting.
	 */
	private onGridSortChanged(): void {
		this.changeDetectorRef.detectChanges();
	}

	/**
	 * Updates the grid rows with information from activity log.
	 */
	private updateGridForDeployRows(): void {
		if (!this.deployLogs) {
			return;
		}
		this.rows = this.deployLogs;
		this.gridApi?.api?.sizeColumnsToFit();
		this.changeDetectorRef.detectChanges();
	}

	/**
	 * Updates the grid rows with information from activity log.
	 */
	private updateGridForCloudSyncRows(): void {
		if (!this.cloudSyncLogs) {
			return;
		}

		this.rows = this.cloudSyncLogs;
		this.gridApi?.api?.sizeColumnsToFit();
		this.changeDetectorRef.detectChanges();
	}
}
