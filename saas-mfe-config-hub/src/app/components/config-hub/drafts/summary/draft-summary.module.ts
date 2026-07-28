/*
 * Copyright (C) 2023 Acme Technologies, Inc.  All rights reserved.
 */
import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';

import { AgGridModule } from 'ag-grid-angular';

import { LoadingMaskModule } from '@acme-priv/armada-angular/src/acme/angular/components/loading-mask';
import { TranslateModule } from '@acme-priv/armada-angular/src/acme/angular/l10n/translation';

import { ConfigHubCompareSummaryGridModule } from '../../shared/components/compare-summary-grid/compare-summary-grid.module';
import { ConfigHubDeployOverlayModule } from './deploy-overlay/deploy-overlay.module';
import { ConfigHubDraftSummaryComponent } from './draft-summary.component';

/**
 * The module exporting the Configuration Hub Draft Summary Page.
 */
@NgModule({
	imports: [
		AgGridModule,
		CommonModule,
		ConfigHubCompareSummaryGridModule,
		ConfigHubDeployOverlayModule,
		LoadingMaskModule,
		TranslateModule
	],
	declarations: [ConfigHubDraftSummaryComponent],
	exports: [ConfigHubDraftSummaryComponent]
})
export class ConfigHubDraftSummaryModule {}
