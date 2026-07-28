/*
 * Copyright (C) 2023 Acme Technologies, Inc.  All rights reserved.
 */
import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';

import { AlertModule } from '@acme-priv/armada-angular/src/acme/angular/components/alert';
import { ButtonModule } from '@acme-priv/armada-angular/src/acme/angular/components/button';
import { SelectInputModule } from '@acme-priv/armada-angular/src/acme/angular/components/form';
import { LoadingMaskModule } from '@acme-priv/armada-angular/src/acme/angular/components/loading-mask';
import { OverlayModule } from '@acme-priv/armada-angular/src/acme/angular/components/overlay';
import { TooltipModule } from '@acme-priv/armada-angular/src/acme/angular/components/tooltip';
import { TranslateModule } from '@acme-priv/armada-angular/src/acme/angular/l10n/translation';
import { TruncatedTextToolTipModule } from '@acme-priv/armada-angular/src/acme/angular/util/truncated-text-tooltip';

import { ConfigHubCompareSummaryGridModule } from '../../shared/components/compare-summary-grid/compare-summary-grid.module';
import { ConfigHubBackupSummaryGridModule } from './backup-summary-grid/backup-summary-grid.module';
import { ConfigHubBackupSummaryOverlayComponent } from './summary-overlay.component';

/**
 * The module exporting the Configuration Hub Backup Summary Overlay.
 */
@NgModule({
	imports: [
		AlertModule,
		ButtonModule,
		CommonModule,
		ConfigHubBackupSummaryGridModule,
		ConfigHubCompareSummaryGridModule,
		LoadingMaskModule,
		OverlayModule,
		SelectInputModule,
		TooltipModule,
		TranslateModule,
		TruncatedTextToolTipModule
	],
	declarations: [ConfigHubBackupSummaryOverlayComponent],
	exports: [ConfigHubBackupSummaryOverlayComponent]
})
export class ConfigHubBackupSummaryOverlayModule {}
