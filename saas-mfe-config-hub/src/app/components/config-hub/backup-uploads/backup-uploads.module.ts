/*
 * Copyright (C) 2024 Acme Technologies, Inc.  All rights reserved.
 */
import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';

import { ButtonModule } from '@acme-priv/armada-angular/src/acme/angular/components/button';
import { DataGridModule } from '@acme-priv/armada-angular/src/acme/angular/components/grid';
import { LoadingMaskModule } from '@acme-priv/armada-angular/src/acme/angular/components/loading-mask';
import { TranslateModule } from '@acme-priv/armada-angular/src/acme/angular/l10n/translation';

import { ConfigHubBackupSummaryOverlayModule } from '../backups/summary-overlay/summary-overlay.module';
import { ConfigHubBackupUploadOverlayModule } from './backup-upload-overlay/backup-upload-overlay.module';
import { ConfigHubBackupUploadsComponent } from './backup-uploads.component';

/**
 * The module exporting the Configuration Hub Backup Uploads
 */
@NgModule({
	declarations: [ConfigHubBackupUploadsComponent],
	imports: [
		CommonModule,
		TranslateModule,
		DataGridModule,
		LoadingMaskModule,
		ButtonModule,
		ConfigHubBackupUploadOverlayModule,
		ConfigHubBackupSummaryOverlayModule
	]
})
export class ConfigHubBackupUploadsModule {}
