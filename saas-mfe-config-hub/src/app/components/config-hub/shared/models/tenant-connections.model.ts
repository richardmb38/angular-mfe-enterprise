import { DatePipe } from '@angular/common';

import { AlertConfig } from '@acme-priv/armada-angular/src/acme/angular/components/alert';
import { SlptColDef } from '@acme-priv/armada-angular/src/acme/angular/components/grid';
import { ModalConfig } from '@acme-priv/armada-angular/src/acme/angular/components/modal';
import { NotificationType } from '@acme-priv/armada-angular/src/acme/angular/components/notification-header';
import { TranslateService } from '@acme-priv/armada-angular/src/acme/angular/l10n/translation';

import { JOB_ALERT_DURATION } from './constants';

/*
 * Copyright (C) 2023 Acme Technologies, Inc.  All rights reserved.
 */
export interface ConfigHubTenantConnection {
	/**
	 * Name of the target tenant for promotion jobs.
	 */
	targetTenant: string;

	/**
	 * User ID
	 */
	targetUserId: string;

	/**
	 * The target's user ID.
	 */
	targetUserName: string;

	/**
	 * Name of the source tenant for promotion jobs.
	 */
	sourceTenant: string;

	/**
	 * The client ID of the source's PAT.
	 */
	sourcePatClientId: string;

	/**
	 * The source's user ID.
	 */
	sourceUserId: string;

	/**
	 * The source's user name.
	 */
	sourceUserName: string;

	/**
	 * Timestamp of when this connection was created.
	 * ISO 8601 format.
	 */
	created: string;

	/**
	 * Timestamp of when this connection was modified.
	 * ISO 8601 format.
	 */
	modified: string;

	/**
	 * The client URL
	 */
	clientUrl: string;
}

export interface CreateTenantConnectionParams {
	/**
	 * The source tenant for the new connection
	 */
	sourceTenant: string;

	/**
	 * The client id from the desired tenant
	 */
	sourcePatClientId: string;

	/**
	 * The client secret from the desired tenant
	 */
	sourcePatClientSecret: string;
}

/**
 * Alert identifiers for Tenant Connections
 */
export enum ConfigHubTenantConnectionAlerts {
	CREATE_CONNECTION_SUCCESS = 'CREATE_CONNECTION_SUCCESS'
}

/**
 * Returns the configuration for specific alerts for tenant connections
 * @param translateService - The translate service.
 * @param tenantConnection - The tenant connection that the alert is for
 */
export const getTenantConnectionsAlertConfigs = (
	translateService: TranslateService,
	tenantConnection?: ConfigHubTenantConnection
): Partial<Record<ConfigHubTenantConnectionAlerts, AlertConfig>> => {
	return {
		[ConfigHubTenantConnectionAlerts.CREATE_CONNECTION_SUCCESS]: {
			id: ConfigHubTenantConnectionAlerts.CREATE_CONNECTION_SUCCESS,
			title: 'CONFIG_HUB.TENANT_CONNECTION_CREATED',
			html: translateService.instantSafeHtml({
				translateKey: 'CONFIG_HUB.TENANT_CONNECTION_CREATED_DETAILS',
				translateParams: {
					source: tenantConnection?.sourceTenant
				}
			}),
			align: 'top',
			popup: true,
			type: NotificationType.Success,
			dismissible: true,
			duration: JOB_ALERT_DURATION
		}
	};
};

/**
 * Column definitions for the Backups grid.
 * @param translateService - The translate service.
 * @param datePipe - DatePipe used to format dates.
 * @returns {SlptColDef[]}
 */
export const getTenantConnectionGridColumnDefs = (
	translateService: TranslateService,
	datePipe: DatePipe
): SlptColDef[] => {
	return [
		{
			headerName: translateService.instant('CONFIG_HUB.TENANT_NAME'),
			field: 'sourceTenant',
			sortable: false
		},
		{
			headerName: translateService.instant('CONFIG_HUB.CLIENT_ID'),
			field: 'sourcePatClientId',
			sortable: false
		},
		{
			headerName: translateService.instant('CONFIG_HUB.ADDED'),
			field: 'created',
			sortable: false,
			valueGetter: ({ data }) => datePipe.transform(data.created, 'medium'),
			comparator: (_a, _b, nodeA, nodeB) =>
				new Date(nodeA.data.created).getTime() - new Date(nodeB.data.created).getTime()
		}
	];
};

/**
 * Returns modal configuration for deleting a backup.
 * @param connectionName - name of the tenant connection to be deleted.
 * @returns {ModalConfig} configuration to be opened by the ModalService.
 */
export function getDeleteConnectionModalConfig(connectionName: string): ModalConfig {
	return {
		title: {
			translateKey: 'CONFIG_HUB.DELETE_TENANT_CONNECTION',
			translateParams: { connectionName }
		},
		message: 'CONFIG_HUB.YOU_WONT_BE_ABLE_TO_DEPLOY_DRAFTS',
		type: NotificationType.Warning,
		footer: [
			{ label: 'CONFIG_HUB.DELETE', value: true, type: 'primary' },
			{ label: 'CONFIG_HUB.CANCEL', value: false, type: 'secondary' }
		],
		verticallyCentered: false
	};
}

/**
 * Gets an AlertConfig indicating a successful tenant connection deletion.
 *
 * @param name - name of the deleted tenant connection.
 * @param translateService - provides the translateService for html translation.
 * @returns - Alert config indicating that the delete operation was successful.
 */
export function getDeleteConnectionSuccessAlertConfig(
	name: string,
	translateService: TranslateService,
	translateKey: string
): AlertConfig {
	return {
		html: translateService.instantSafeHtml({
			translateKey: translateKey,
			translateParams: { name }
		}),
		type: NotificationType.Success,
		dismissible: true,
		duration: 4000,
		align: 'top',
		popup: true
	};
}
