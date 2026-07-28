/*
 * Copyright (C) 2023 Acme Technologies, Inc.  All rights reserved.
 */
import { DatePipe } from '@angular/common';

import { GridOptions } from 'ag-grid-community';

import {
	DataGridLoadingComponent,
	DataGridNoDataComponent,
	DataGridTruncatedTextTooltipCellComponent,
	SlptColDef
} from '@acme-priv/armada-angular/src/acme/angular/components/grid';
import { TranslateService } from '@acme-priv/armada-angular/src/acme/angular/l10n/translation';

import { FeatureFlagService } from '@acme-priv/ui-common/src/acme/angular/util';

import { ConfigHubDeployJob, ConfigHubSyncJob } from '../shared/models';
import { FeatureFlags } from 'app/featureflags.enum';

/**
 * Activity Log tabs enum
 */
export enum ConfigHubActivityLogTabs {
	DEPLOYMENT_LOG = 0,
	DEPLOYMENT_DRAFT = 1
}

export enum CloudStorageStatus {
	SYNCED = 'SYNCED',
	NOT_SYNCED = 'NOT_SYNCED',
	SYNC_FAILED = 'SYNC_FAILED'
}

/**
 * Activity Log single tab props
 */
export interface ConfigHubActivityLogTab {
	title: string;
	index: ConfigHubActivityLogTabs;
}

export interface GridTabs {
	title: string;
	index: ConfigHubActivityLogGridTabs;
}

export interface PrevioslyDeployLoadedData {
	[pageSize: number]: Array<ConfigHubDeployListResponse>;
}

export interface PrevioslyCloudSyncLoadedData {
	[pageSize: number]: Array<ConfigHubCloudSyncListResponse>;
}

/**
 * Config Hub activity log tabs enum
 */
export enum ConfigHubActivityLogGridTabs {
	GRID_DEPLOY = 0,
	GRID_CLOUD = 1
}

/**
 * A model for the expected API response from the deploy list endpoint.
 */
export interface ConfigHubDeployListResponse {
	/**
	 * An array of ObjectDetails.
	 */
	items: ConfigHubDeployJob[];

	/**
	 * The token to be passed as `lastEvaluatedKey` to retrieve the next page of results.
	 */
	nextToken?: string;
}

/**
 * A model for the expected API response from the deploy list endpoint.
 */
export interface ConfigHubCloudSyncListResponse {
	/**
	 * An array of ObjectDetails.
	 */
	items: ConfigHubSyncJob[];

	/**
	 * The token to be passed as `lastEvaluatedKey` to retrieve the next page of results.
	 */
	nextToken?: string;
}

/**
 * Column definitions for the Activity Log grid of cloud sync jobs.
 * @param translateService - The translate service.
 * @param datePipe - DatePipe used to format dates.
 * @returns {SlptColDef[]}
 */
export const getCloudSyncJobsGridColumnDefs = (
	translateService: TranslateService,
	datePipe: DatePipe,
	featureFlagService: FeatureFlagService
): SlptColDef[] => [
	{
		headerName: translateService.instant('CONFIG_HUB.ACTIVITY_TYPE'),
		field: 'type',
		valueGetter: () => translateService.instant('CONFIG_HUB.CLOUD_STORAGE'),
		sortable: true,
		cellRenderer: DataGridTruncatedTextTooltipCellComponent,
		width: 180,
		suppressSizeToFit: false
	},
	{
		headerName: translateService.instant('CONFIG_HUB.JOB_ID'),
		field: 'jobId',
		sortable: true,
		cellRenderer: DataGridTruncatedTextTooltipCellComponent
	},
	{
		headerName: translateService.instant('CONFIG_HUB.FILES_SYNCED'),
		field: 'fileSyncInfo',
		sortable: false,
		valueGetter: ({ data }) => {
			if (featureFlagService.isEnabled(FeatureFlags.PLTCONFHUB_2666_UPDATE_FILE_SYNC_INFO) && data.fileSyncInfo) {
				const filesSynced = data.fileSyncInfo.filter(file => file.status === CloudStorageStatus.SYNCED);
				return `${filesSynced.length} of ${data.fileSyncInfo.length}`;
			}
			if (data.filesSynced) {
				const filesSynced = Object.values<string>(data.filesSynced)
					.map(file => file.split('#'))
					.filter(([, status]) => status && status === CloudStorageStatus.SYNCED);

				return `${filesSynced.length} of ${Object.keys(data.filesSynced).length}`;
			}
			return 'No files synced';
		},
		cellRenderer: DataGridTruncatedTextTooltipCellComponent,
		width: 120,
		suppressSizeToFit: false
	},
	{
		headerName: translateService.instant('CONFIG_HUB.MESSAGE'),
		field: 'message',
		sortable: true,
		resizable: true,
		cellRenderer: DataGridTruncatedTextTooltipCellComponent,
		valueGetter: ({ data }) => {
			const match = data.message.match(/^[^:]+: (.+)$/);
			return match ? match[1] : data.message;
		},
		width: 380,
		suppressSizeToFit: false
	},
	{
		headerName: translateService.instant('CONFIG_HUB.CREATED'),
		field: 'created',
		valueGetter: ({ data }) => datePipe.transform(data.created, 'medium'),
		comparator: (_a, _b, nodeA, nodeB) => {
			return new Date(nodeA.data.created).getTime() - new Date(nodeB.data.created).getTime();
		},
		sortable: true,
		sort: 'desc',
		cellRenderer: DataGridTruncatedTextTooltipCellComponent
	},
	{
		headerName: translateService.instant('CONFIG_HUB.STATUS'),
		field: 'status',
		sortable: true,
		valueGetter: ({ data }) => {
			const translateKey = `CONFIG_HUB.${data.status.toUpperCase()}`;
			if (translateService.exists(translateKey)) {
				return translateService.instant(translateKey);
			}
			return data.status.toLowerCase();
		},
		cellStyle: { textTransform: 'capitalize' },
		width: 120,
		suppressSizeToFit: false
	}
];

/**
 * Column definitions for the Activity Log grid of deploy jobs.
 * @param translateService - The translate service.
 * @param datePipe - DatePipe used to format dates.
 * @returns {SlptColDef[]}
 */
export const getDeployJobsGridColumnDefs = (translateService: TranslateService, datePipe: DatePipe): SlptColDef[] => [
	{
		headerName: translateService.instant('CONFIG_HUB.ACTIVITY_TYPE'),
		field: 'type',
		valueGetter: () => translateService.instant('CONFIG_HUB.DEPLOY_CONFIGURATION_DRAFT'),
		sortable: true,
		cellRenderer: DataGridTruncatedTextTooltipCellComponent
	},
	{
		headerName: translateService.instant('CONFIG_HUB.EVENT_ID'),
		field: 'jobId',
		sortable: true,
		cellRenderer: DataGridTruncatedTextTooltipCellComponent
	},
	{
		headerName: translateService.instant('CONFIG_HUB.REQUESTER_NAME'),
		field: 'requesterName',
		sortable: true,
		valueGetter: ({ data }) => {
			return data?.requesterName?.toLowerCase();
		},
		cellStyle: { textTransform: 'capitalize' }
	},
	{
		headerName: translateService.instant('CONFIG_HUB.DRAFT_NAME'),
		field: 'draftName',
		sortable: true,
		cellRenderer: DataGridTruncatedTextTooltipCellComponent,
		comparator: (_a, _b, nodeA, nodeB) => {
			const nameA = nodeA?.data?.draftName;
			const nameB = nodeB?.data?.draftName;

			if (nameA === nameB) {
				return 0;
			}
			return nameA > nameB ? 1 : -1;
		}
	},
	{
		headerName: translateService.instant('CONFIG_HUB.CREATED'),
		field: 'created',
		valueGetter: ({ data }) => datePipe.transform(data.created, 'medium'),
		comparator: (_a, _b, nodeA, nodeB) => {
			return new Date(nodeA.data.created).getTime() - new Date(nodeB.data.created).getTime();
		},
		sortable: true,
		sort: 'desc',
		cellRenderer: DataGridTruncatedTextTooltipCellComponent
	},
	{
		headerName: translateService.instant('CONFIG_HUB.STATUS'),
		field: 'status',
		sortable: true,
		valueGetter: ({ data }) => {
			const translateKey = `CONFIG_HUB.${data.status.toUpperCase()}`;
			if (translateService.exists(translateKey)) {
				return translateService.instant(translateKey);
			}
			return data.status.toLowerCase();
		},
		cellStyle: { textTransform: 'capitalize' }
	}
];

/**
 * The options for the grid.
 */
export const jobsGridOptions: GridOptions = {
	getRowId: data => data?.data?.jobId,
	suppressMovableColumns: true,
	enableBrowserTooltips: true,
	suppressMultiSort: true,
	suppressColumnVirtualisation: true,
	colResizeDefault: 'shift',
	domLayout: 'normal',
	components: {
		customLoadingOverlay: DataGridLoadingComponent,
		customNoRowsOverlay: DataGridNoDataComponent
	}
};

/**
 * Generates an array of GridTabs objects based on the TranslateService provided.
 *
 * @param {TranslateService} translateService - The TranslateService used to translate the titles.
 * @return {GridTabs[]} An array of GridTabs objects with titles and corresponding indexes.
 */
export const gridTabs = (): GridTabs[] => [
	{
		title: 'CONFIG_HUB.DEPLOY',
		index: ConfigHubActivityLogGridTabs.GRID_DEPLOY
	},
	{
		title: 'CONFIG_HUB.CLOUD_STORAGE',
		index: ConfigHubActivityLogGridTabs.GRID_CLOUD
	}
];
