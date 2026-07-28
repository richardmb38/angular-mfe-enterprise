/*
 * Copyright (C) 2023 Acme Technologies, Inc.  All rights reserved.
 */
import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';

import { ButtonModule } from '@acme-priv/armada-angular/src/acme/angular/components/button';
import { FullWidthHeaderModule } from '@acme-priv/armada-angular/src/acme/angular/components/full-width-header';
import {
	IconArrowFromBottomModule,
	IconBroadcastTowerModule,
	IconCalendarModule,
	IconClockModule,
	IconCloseModule,
	IconCogModule,
	IconEditModule,
	IconModule,
	IconPlusCircleModule
} from '@acme-priv/armada-angular/src/acme/angular/components/icons';
import { ListGroupModule, ListItemModule } from '@acme-priv/armada-angular/src/acme/angular/components/list';
import { TranslateModule } from '@acme-priv/armada-angular/src/acme/angular/l10n/translation';
import {
	FullPageWizardTemplateModule,
	LeftSidebarTemplateModule
} from '@acme-priv/armada-angular/src/acme/angular/templates';
import { TruncatedTextToolTipModule } from '@acme-priv/armada-angular/src/acme/angular/util/truncated-text-tooltip';

import { ConfigHubActivityLogModule } from './activity-log/activity-log.module';
import { ConfigHubAdvancedSettingsModule } from './advanced-settings/advanced-settings.module';
import { ConfigHubCloudStorageModule } from './advanced-settings/cloud-storage/cloud-storage.module';
import { ConfigHubFeatureEnablementModule } from './advanced-settings/feature-enablement/feature-enablement.module';
import { ConfigHubObjectMappingModule } from './advanced-settings/object-mapping/object-mapping.module';
import { ConfigHubBackupUploadsModule } from './backup-uploads/backup-uploads.module';
import { ConfigHubBackupListModule } from './backups/backup-list.module';
import { ConfigHubComponent } from './config-hub.component';
import { ConfigHubDraftsModule } from './drafts/drafts.module';
import { ConfigHubScheduledJobsModule } from './scheduled-jobs/scheduled-jobs.module';
import { ConfigHubTenantConnectionsModule } from './tenant-connections/tenant-connections.module';

/**
 * The module exporting the Configuration Hub Page.
 */
@NgModule({
	imports: [
		ButtonModule,
		CommonModule,
		ConfigHubBackupListModule,
		ConfigHubDraftsModule,
		ConfigHubActivityLogModule,
		ConfigHubTenantConnectionsModule,
		ConfigHubAdvancedSettingsModule,
		ConfigHubObjectMappingModule,
		ConfigHubCloudStorageModule,
		ConfigHubBackupUploadsModule,
		ConfigHubFeatureEnablementModule,
		ConfigHubScheduledJobsModule,
		FullPageWizardTemplateModule,
		FullWidthHeaderModule,
		IconModule,
		IconClockModule,
		IconCloseModule,
		IconEditModule,
		IconPlusCircleModule,
		IconArrowFromBottomModule,
		IconCalendarModule,
		IconBroadcastTowerModule,
		IconCogModule,
		ListItemModule,
		TranslateModule,
		TruncatedTextToolTipModule,
		RouterModule,
		LeftSidebarTemplateModule,
		ListGroupModule
	],
	declarations: [ConfigHubComponent],
	exports: [ConfigHubComponent]
})
export class ConfigHubModule {}
