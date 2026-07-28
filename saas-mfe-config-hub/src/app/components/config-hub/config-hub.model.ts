/*
 * Copyright (C) 2023 Acme Technologies, Inc.  All rights reserved.
 */
import { Action } from '@ngrx/store';

import { ConfigHubRoles } from './shared/models/config-hub.model';
import { FeatureFlags } from 'app/featureflags.enum';

/**
 * The base Configuration Hub URL.
 */
export const CONFIG_HUB_URL = 'admin/config-hub';

export const UPLOADS = 'uploads';

/**
 * The details of Configuration Hub routes.
 */
export interface ConfigHubChildRouteDetails {
	route: string;
	featureFlag?: FeatureFlags;
	permission?: string;
	label?: string;
	selected?: boolean;
	icon?: string;
	iconType?: 'regular' | 'light';
	expanded?: boolean;
	children?: Array<ConfigHubChildRouteDetails>;
}

/**
 * The names of Configuration Hub routes.
 */
export enum ConfigHubChildRouteNames {
	BACKUPS = 'BACKUPS',
	DRAFTS = 'DRAFTS',
	TENANT_CONNECTIONS = 'TENANT_CONNECTIONS',
	ACTIVITY_LOG = 'ACTIVITY_LOG',
	ADVANCED_SETTINGS = 'ADVANCED_SETTINGS',
	OBJECT_MAPPING = 'OBJECT_MAPPING',
	BACKUP_UPLOADS = 'BACKUP_UPLOADS',
	SCHEDULED_JOBS = 'SCHEDULED_JOBS'
}

/**
 * Record of Configuration Hub routes and their details.
 */
export const ConfigHubChildRoutes: Partial<Record<ConfigHubChildRouteNames, ConfigHubChildRouteDetails>> = {
	[ConfigHubChildRouteNames.BACKUPS]: {
		label: 'CONFIG_HUB.BACKUPS',
		route: 'backups',
		selected: false,
		icon: 'clock',
		iconType: 'light'
	},
	[ConfigHubChildRouteNames.DRAFTS]: {
		label: 'CONFIG_HUB.DRAFTS',
		featureFlag: FeatureFlags.PLT_UI_ADMIRAL_CONFIG_HUB_DRAFT_DETAILS,
		route: 'drafts',
		selected: false,
		icon: 'edit',
		iconType: 'regular'
	},
	[ConfigHubChildRouteNames.BACKUP_UPLOADS]: {
		label: 'CONFIG_HUB.UPLOADS',
		featureFlag: FeatureFlags.PLT_UI_ADMIRAL_CONFIG_HUB_BACKUP_UPLOAD,
		route: UPLOADS,
		selected: false,
		icon: 'arrowFromBottom',
		iconType: 'regular'
	},
	[ConfigHubChildRouteNames.ACTIVITY_LOG]: {
		label: 'CONFIG_HUB.ACTIVITY_LOG',
		route: 'activity-log',
		selected: false,
		icon: 'calendar',
		iconType: 'regular'
	},
	[ConfigHubChildRouteNames.TENANT_CONNECTIONS]: {
		label: 'CONFIG_HUB.TENANT_CONNECTIONS',
		featureFlag: FeatureFlags.PLT_UI_ADMIRAL_TENANT_CONNECTIONS,
		route: 'tenant-connections',
		selected: false,
		icon: 'broadcastTower',
		iconType: 'regular'
	},
	[ConfigHubChildRouteNames.ADVANCED_SETTINGS]: {
		label: 'CONFIG_HUB.ADVANCED_SETTINGS',
		route: 'advanced-settings',
		expanded: false,
		selected: false,
		icon: 'cog',
		iconType: 'regular',
		children: [
			{
				label: 'CONFIG_HUB.OBJECT_MAPPING',
				featureFlag: FeatureFlags.PLT_UI_ADMIRAL_CONFIG_HUB_OBJECT_MAPPING,
				route: 'object-mapping',
				selected: false
			},
			{
				label: 'CONFIG_HUB.CLOUD_STORAGE',
				permission: ConfigHubRoles.CLOUD_STORAGE_PAGE,
				route: 'cloud-storage',
				selected: false
			},
			{
				label: 'CONFIG_HUB.FEATURE_ENABLEMENT',
				permission: ConfigHubRoles.ADVANCED_SETTINGS_READ,
				route: 'feature-enablement',
				selected: false
			}
		]
	},
	[ConfigHubChildRouteNames.SCHEDULED_JOBS]: {
		label: 'CONFIG_HUB.SCHEDULED_JOBS',
		featureFlag: FeatureFlags.PLTCONFHUB_SCHEDULED_ACTIONS,
		route: 'scheduled-jobs',
		selected: false,
		icon: 'plusCircle',
		iconType: 'light'
	}
};

/**
 * Information about currently selected and deselected ids in the grid API and store
 */
export interface ConfigHubObservedIds {
	/**
	 * List of deselected ids in the grid API
	 */
	deselectedIds: string[];

	/**
	 * List of selected ids in the grid API
	 */
	selectedIds: string[];

	/**
	 * List of deselected ids in the store
	 */
	storeDeselectedIds: string[];
}

export interface ConfigHubSelectionChangedActions {
	/**
	 * Single item select action
	 */
	singleSelectAction: (...args: any[]) => Action;

	/**
	 * Single item deselect action
	 */
	singleDeselectAction: (...args: any[]) => Action;

	/**
	 * Bulk item select action
	 */
	bulkSelectAction: (...args: any[]) => Action;

	/**
	 * Bulk item select action
	 */
	bulkDeselectAction: (...args: any[]) => Action;
}
