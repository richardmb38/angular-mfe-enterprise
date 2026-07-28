/*
 * Copyright (C) 2023 Acme Technologies, Inc.  All rights reserved.
 */
import { Routes, mapToCanActivate } from '@angular/router';

import { ROLE } from '@acme-priv/ui-common/src/acme/angular/util/user-info';

import { ConfigHubActivityLogComponent } from './activity-log/activity-log.component';
import { AdvancedSettingsRoutes } from './advanced-settings/advanced-settings.routes';
import { ConfigHubBackupUploadsComponent } from './backup-uploads/backup-uploads.component';
import { BackupDetailsRoutes, BackupRoutes } from './backups/backups.routes';
import { ConfigHubComponent } from './config-hub.component';
import { ConfigHubGuard } from './config-hub.guard';
import { CONFIG_HUB_URL, ConfigHubChildRoutes } from './config-hub.model';
import { DraftsRoutes } from './drafts/drafts.routes';
import { ConfigHubDraftsListComponent } from './drafts/list/drafts-list.component';
import { ConfigHubScheduledJobsComponent } from './scheduled-jobs/scheduled-jobs.component';
import { ConfigHubScheduledJobsGuard } from './scheduled-jobs/scheduled-jobs.guard';
import { ConfigHubRoles } from './shared/models/config-hub.model';
import { ConfigHubTenantConnectionsComponent } from './tenant-connections/tenant-connections.component';

export const ConfigHubRoutes: Routes = [
	{
		path: CONFIG_HUB_URL,
		canActivate: mapToCanActivate([ConfigHubGuard]),
		data: {
			rights: [ConfigHubRoles.PAGE_READ],
			legacyRoles: [ROLE.ORG_ADMIN]
		},
		children: [
			{
				path: '',
				component: ConfigHubComponent,
				children: [
					{
						path: '',
						redirectTo: ConfigHubChildRoutes.BACKUPS.route,
						pathMatch: 'full'
					},
					{
						path: ConfigHubChildRoutes.DRAFTS.route,
						component: ConfigHubDraftsListComponent,
						pathMatch: 'full'
					},
					{
						path: ConfigHubChildRoutes.BACKUP_UPLOADS.route,
						component: ConfigHubBackupUploadsComponent,
						pathMatch: 'full'
					},
					{
						path: ConfigHubChildRoutes.ACTIVITY_LOG.route,
						component: ConfigHubActivityLogComponent,
						pathMatch: 'full'
					},
					{
						path: ConfigHubChildRoutes.TENANT_CONNECTIONS.route,
						component: ConfigHubTenantConnectionsComponent,
						pathMatch: 'full'
					},
					{
						path: ConfigHubChildRoutes.SCHEDULED_JOBS.route,
						component: ConfigHubScheduledJobsComponent,
						canActivate: mapToCanActivate([ConfigHubScheduledJobsGuard]),
						pathMatch: 'full'
					},
					...AdvancedSettingsRoutes,
					...BackupRoutes
				]
			},
			...BackupDetailsRoutes,
			...DraftsRoutes,
			{
				path: '**',
				redirectTo: ConfigHubChildRoutes.BACKUPS.route,
				pathMatch: 'full'
			}
		]
	}
];
