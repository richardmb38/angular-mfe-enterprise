/*
 * Copyright (C) 2023 Acme Technologies, Inc.  All rights reserved.
 */
import { ModalConfig } from '@acme-priv/armada-angular/src/acme/angular/components/modal';
import { NotificationType } from '@acme-priv/armada-angular/src/acme/angular/components/notification-header';

import { ConfigHubChildRouteDetails } from '../config-hub.model';
import { ConfigHubApprovalStatus } from '../shared/models';

/**
 * The names of Drafts routes.
 */
export enum DraftsChildRouteNames {
	CREATE = 'CREATE',
	DETAILS = 'DETAILS',
	EDIT = 'EDIT',
	LIST = 'LIST'
}

/**
 * Record of Drafts routes and their details.
 */
export const DraftsChildRoutes: Record<DraftsChildRouteNames, ConfigHubChildRouteDetails> = {
	[DraftsChildRouteNames.CREATE]: {
		route: 'create'
	},
	[DraftsChildRouteNames.DETAILS]: {
		route: ':id/details'
	},
	[DraftsChildRouteNames.EDIT]: {
		route: ':id'
	},
	[DraftsChildRouteNames.LIST]: {
		route: ''
	}
};

/**
 * Get cancel request confirmation modal config
 */
export function getConfirmCancelRequestModalConfig(approvalStatus: ConfigHubApprovalStatus): ModalConfig {
	let modalMessage;

	switch (approvalStatus) {
		case ConfigHubApprovalStatus.PENDING_FOR_APPROVAL:
			modalMessage = 'CONFIG_HUB.CANCEL_REQUEST_PENDING';
			break;
		case ConfigHubApprovalStatus.APPROVED:
			modalMessage = 'CONFIG_HUB.CANCEL_REQUEST_APPROVED';
			break;
		case ConfigHubApprovalStatus.DENIED:
			modalMessage = 'CONFIG_HUB.CANCEL_REQUEST_DENIED';
			break;
	}

	return {
		title: 'CONFIG_HUB.CANCEL_REQUEST',
		message: modalMessage,
		footer: [
			{ label: 'CONFIG_HUB.CONFIRM', value: true, type: 'primary' },
			{ label: 'SLPT.CANCEL', value: false, type: 'secondary' }
		],
		width: 'lg',
		type: NotificationType.Warning,
		verticallyCentered: true,
		documentScrollOnHover: false,
		dismissible: true,
		keyboard: true
	};
}
