/*
 * Copyright (C) 2023 Acme Technologies, Inc.  All rights reserved.
 */
import { Routes, mapToCanActivate } from '@angular/router';

import { ConfigHubChildRoutes } from '../config-hub.model';
import { ConfigHubAdvancedSettingsComponent } from './advanced-settings.component';
import { AdvancedSettingsChildRoutes } from './advanced-settings.model';
import { CloudStorageGuard } from './cloud-storage.guard';
import { ConfigHubCloudStorageComponent } from './cloud-storage/cloud-storage.component';
import { ConfigHubFeatureEnablementComponent } from './feature-enablement/feature-enablement.component';
import { ConfigHubFeatureEnablementGuard } from './feature-enablement/feature-enablement.guard';
import { ConfigHubObjectMappingComponent } from './object-mapping/object-mapping.component';

export const AdvancedSettingsRoutes: Routes = [
	{
		path: ConfigHubChildRoutes.ADVANCED_SETTINGS.route,
		component: ConfigHubAdvancedSettingsComponent,
		children: [
			{
				// Object Mapping Page
				path: AdvancedSettingsChildRoutes.OBJECT_MAPPING.route,
				component: ConfigHubObjectMappingComponent
			},
			{
				// Cloud Storage Page
				path: AdvancedSettingsChildRoutes.CLOUD_STORAGE.route,
				component: ConfigHubCloudStorageComponent,
				canActivate: mapToCanActivate([CloudStorageGuard])
			},
			{
				// Draft Approvals Settings
				path: AdvancedSettingsChildRoutes.FEATURE_ENABLEMENT.route,
				component: ConfigHubFeatureEnablementComponent,
				canActivate: mapToCanActivate([ConfigHubFeatureEnablementGuard])
			},
			{
				path: '**',
				redirectTo: AdvancedSettingsChildRoutes.OBJECT_MAPPING.route,
				pathMatch: 'full'
			}
		]
	}
];
