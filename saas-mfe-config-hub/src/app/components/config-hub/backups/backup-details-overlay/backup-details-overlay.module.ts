/*
 * Copyright (C) 2023 Acme Technologies, Inc.  All rights reserved.
 */
import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';

import { ButtonModule } from '@acme-priv/armada-angular/src/acme/angular/components/button';
import { FieldModule } from '@acme-priv/armada-angular/src/acme/angular/components/form';
import { OverlayModule } from '@acme-priv/armada-angular/src/acme/angular/components/overlay';
import { TooltipModule } from '@acme-priv/armada-angular/src/acme/angular/components/tooltip';
import { TranslateModule } from '@acme-priv/armada-angular/src/acme/angular/l10n/translation';
import { TruncatedTextToolTipModule } from '@acme-priv/armada-angular/src/acme/angular/util/truncated-text-tooltip';

import { BackupDetailsOverlayComponent } from './backup-details-overlay.component';

/**
 * The module exporting the Configuration Hub Backup Summary Overlay.
 */
@NgModule({
	imports: [
		ButtonModule,
		CommonModule,
		FieldModule,
		OverlayModule,
		TooltipModule,
		TranslateModule,
		TruncatedTextToolTipModule
	],
	declarations: [BackupDetailsOverlayComponent],
	exports: [BackupDetailsOverlayComponent]
})
export class ConfigHubBackupDetailsOverlayModule {}
