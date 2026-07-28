/*
 * Copyright (C) 2023 Acme Technologies, Inc.  All rights reserved.
 */

/**
 * Mock api urls which can be referenced across stories
 */
export const ApiUrls = {
	backups: 'beta/sp-config/backups',
	backupDrafts: 'beta/sp-config/drafts',
	completedBackups: 'beta/sp-config/backups?filters=status%20eq%20%22COMPLETE%22',
	completedDrafts: 'beta/sp-config/drafts?filters=status%20eq%20%22COMPLETE%22',
	configObjects: '/beta/sp-config/config-objects?filters=exportable%20eq%20%22true%22',
	drafts: 'beta/sp-config/drafts',
	inProgressBackups: 'beta/sp-config/backups?filters=status%20eq%20%22IN_PROGRESS%22',
	backupSummary: id => `beta/sp-config/backups/${id}/summary`
};
