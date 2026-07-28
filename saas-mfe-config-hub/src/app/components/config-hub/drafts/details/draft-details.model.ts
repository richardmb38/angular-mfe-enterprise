/*
 * Copyright (C) 2023 Acme Technologies, Inc.  All rights reserved.
 */
import { ConfigHubApprovalStatus, ObjectOperationType } from '../../shared/models';

/**
 * A record of ObjectOperationTypes to their tab titles.
 */
export const objectOperationTabTitles: Record<ObjectOperationType, string> = {
	[ObjectOperationType.ADDED]: 'CONFIG_HUB.ADDS_TO_LIVE',
	[ObjectOperationType.CHANGED]: 'CONFIG_HUB.MODIFIES_TO_LIVE',
	[ObjectOperationType.REMOVED]: 'CONFIG_HUB.NOT_IN_BACKUP'
};

/**
 * Defines configuration options for slpt-tabs on the Draft Details page.
 */
export interface DraftDetailsTabConfig {
	/**
	 * The tab item's id.
	 */
	id: string;

	/**
	 * The tab item's title/label.
	 */
	title: string;

	/**
	 * Operation Type
	 */
	type: ObjectOperationType;

	/**
	 * The tab enabled/disabled state
	 */
	disabled: boolean;

	/**
	 * The number of operation types affected
	 */
	count: number;

	/**
	 * A function called when the tab item is clicked.
	 */
	onTabClick: () => void;
}

/**
 * A record of approval statuses to their translations
 */
export const ApprovalStatusTranslations: Record<ConfigHubApprovalStatus, string> = {
	[ConfigHubApprovalStatus.APPROVED]: 'CONFIG_HUB.APPROVED',
	[ConfigHubApprovalStatus.DENIED]: 'CONFIG_HUB.DENIED',
	[ConfigHubApprovalStatus.PENDING_FOR_APPROVAL]: 'CONFIG_HUB.PENDING_APPROVAL'
};

/**
 * A record of approval statuses to badge colors
 */
export const ApprovalStatusBadgeColors: Record<ConfigHubApprovalStatus, string> = {
	[ConfigHubApprovalStatus.APPROVED]: 's2l',
	[ConfigHubApprovalStatus.DENIED]: 's4l',
	[ConfigHubApprovalStatus.PENDING_FOR_APPROVAL]: 'a2l'
};
