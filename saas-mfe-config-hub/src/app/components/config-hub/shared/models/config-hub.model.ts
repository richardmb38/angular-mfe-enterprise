/*
 * Copyright (C) 2023 Acme Technologies, Inc.  All rights reserved.
 */

/**
 * Allowed Roles for config hub
 */
export enum ConfigHubRoles {
	PAGE_READ = 'sp:ui-config-hub-page:read',
	PAGE_WRITE = 'sp:ui-config-hub-page:write',
	BACKUP_CREATE = 'sp:ui-config-hub_backup-list-page:create',
	BACKUP_DELETE = 'sp:ui-config-hub_backup-list-page:delete',
	DRAFT_DELETE = 'sp:ui-config-hub_draft-list-page:delete',
	DRAFT_UPDATE = 'sp:ui-config-hub_draft-list-page:update',
	DRAFT_CREATE = 'sp:ui-config-hub_draft-list-page:create',
	DRAFT_APPROVE = 'sp:ui-config-hub_draft-list-page:approve',
	DEPLOY_CREATE = 'sp:ui-config-hub_deploy-list-page:create',
	CONNECTION_CREATE = 'sp:ui-config-hub_connection-list-page:create',
	CONNECTION_DELETE = 'sp:ui-config-hub_connection-list-page:delete',
	OBJECT_MAPPING_CREATE = 'sp:ui-config-hub_object-mapping-list-page:create',
	OBJECT_MAPPING_UPDATE = 'sp:ui-config-hub_object-mapping-list-page:update',
	OBJECT_MAPPING_DELETE = 'sp:ui-config-hub_object-mapping-list-page:delete',
	CLOUD_STORAGE_PAGE = 'sp:ui-config-hub_customer-s3-page:read',
	ADVANCED_SETTINGS_READ = 'sp:ui-config-hub_advanced-settings-page:read',
	ADVANCED_SETTINGS_UPDATE = 'sp:ui-config-hub_advanced-settings-page:update',
	ADVANCED_SETTINGS_CREATE = 'sp:ui-config-hub_advanced-settings-page:create',
	SCHEDULED_JOBS_READ = 'sp:ui-config-hub-scheduled-action:read',
	SCHEDULED_JOBS_CREATE = 'sp:ui-config-hub-scheduled-action:create',
	SCHEDULED_JOBS_DELETE = 'sp:ui-config-hub-scheduled-action:delete',
	SCHEDULED_JOBS_UPDATE = 'sp:ui-config-hub-scheduled-action:update'
}
