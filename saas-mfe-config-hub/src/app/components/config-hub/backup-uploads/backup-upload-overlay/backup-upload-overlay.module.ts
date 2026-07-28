/*
 * Copyright (C) 2024 Acme Technologies, Inc.  All rights reserved.
 */
import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';

import { ButtonModule } from '@acme-priv/armada-angular/src/acme/angular/components/button';
import {
	FileUploadFieldModule,
	FormModule
} from '@acme-priv/armada-angular/src/acme/angular/components/form';
import { LoadingMaskModule } from '@acme-priv/armada-angular/src/acme/angular/components/loading-mask';
import { OverlayModule } from '@acme-priv/armada-angular/src/acme/angular/components/overlay';
import { TranslateModule } from '@acme-priv/armada-angular/src/acme/angular/l10n/translation';

import { ConfigHubBackupUploadOverlayComponent } from './backup-upload-overlay.component';

/**
 * The module declaring the Configuration Hub Backup Upload Overlay
 */
@NgModule({
	declarations: [ConfigHubBackupUploadOverlayComponent],
	imports: [
		CommonModule,
		TranslateModule,
		OverlayModule,
		ButtonModule,
		FileUploadFieldModule,
		LoadingMaskModule,
		FormModule
	],
	exports: [ConfigHubBackupUploadOverlayComponent]
})
export class ConfigHubBackupUploadOverlayModule {}
