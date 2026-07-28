/*
 * Copyright (C) 2023 Acme Technologies, Inc.  All rights reserved.
 */
import { ConfigHubChildRouteDetails, ConfigHubChildRoutes } from '../config-hub.model';

/**
 * The names of Backup Details routes.
 */
export enum BackupChildRouteNames {
	BACKUP_DETAILS = 'BACKUP_DETAILS'
}

/**
 * Record of Backup Details route.
 */
export const BackupChildRoutes: Record<BackupChildRouteNames, ConfigHubChildRouteDetails> = {
	[BackupChildRouteNames.BACKUP_DETAILS]: {
		route: `${ConfigHubChildRoutes.BACKUPS.route}/:id/details`
	}
};
