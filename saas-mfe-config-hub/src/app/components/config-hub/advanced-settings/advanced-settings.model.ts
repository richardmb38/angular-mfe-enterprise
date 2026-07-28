/*
 * Copyright (C) 2023 Acme Technologies, Inc.  All rights reserved.
 */
import { ConfigHubChildRouteDetails } from '../config-hub.model';

/**
 * The names of Advanced Setting routes.
 */
export enum AdvancedSettingsChildRouteNames {
	OBJECT_MAPPING = 'OBJECT_MAPPING',
	CLOUD_STORAGE = 'CLOUD_STORAGE',
	FEATURE_ENABLEMENT = 'FEATURE_ENABLEMENT'
}

/**
 * Record of Advanced Settings routes and their details.
 */
export const AdvancedSettingsChildRoutes: Record<AdvancedSettingsChildRouteNames, ConfigHubChildRouteDetails> = {
	[AdvancedSettingsChildRouteNames.OBJECT_MAPPING]: {
		route: 'object-mapping'
	},
	[AdvancedSettingsChildRouteNames.CLOUD_STORAGE]: {
		route: 'cloud-storage'
	},
	[AdvancedSettingsChildRouteNames.FEATURE_ENABLEMENT]: {
		route: 'feature-enablement'
	}
};
