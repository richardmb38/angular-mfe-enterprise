/*
 * Copyright (C) 2023 Acme Technologies, Inc.  All rights reserved.
 */
import { Routes, mapToCanActivate } from '@angular/router';

import { ConfigHubChildRoutes } from '../config-hub.model';
import { ConfigHubBackupDetailsGuard } from './backup-details.guard';
import { ConfigHubBackupDetailsComponent } from './backup-details/backup-details.component';
import { ConfigHubBackupListComponent } from './backup-list.component';
import { ConfigHubBackupListGuard } from './backup-list.guard';
import { BackupChildRoutes } from './backups.model';

export const BackupRoutes: Routes = [
	{
		path: ConfigHubChildRoutes.BACKUPS.route,
		component: ConfigHubBackupListComponent
	},
	{
		path: `${ConfigHubChildRoutes.BACKUPS.route}/:id`,
		component: ConfigHubBackupListComponent,
		canActivate: mapToCanActivate([ConfigHubBackupListGuard])
	}
];

export const BackupDetailsRoutes: Routes = [
	{
		path: BackupChildRoutes.BACKUP_DETAILS.route,
		component: ConfigHubBackupDetailsComponent,
		canActivate: mapToCanActivate([ConfigHubBackupDetailsGuard])
	}
];
