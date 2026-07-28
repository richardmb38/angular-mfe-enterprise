/*
 * Copyright (C) 2023 Acme Technologies, Inc.  All rights reserved.
 */
import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';

import { AgGridModule } from 'ag-grid-angular';

import { LoadingMaskModule } from '@acme-priv/armada-angular/src/acme/angular/components/loading-mask';
import { TabListModule, TabModule } from '@acme-priv/armada-angular/src/acme/angular/components/tabs';
import { TranslateModule } from '@acme-priv/armada-angular/src/acme/angular/l10n/translation';

import { ConfigHubDraftDetailsComponent } from './draft-details.component';
import { ConfigHubObjectDetailsGridModule } from './object-details-grid/object-details-grid.module';
import { ConfigHubObjectOverlayModule } from './object-overlay/object-overlay.module';

/**
 * The module exporting the Configuration Hub Draft Details Page.
 */
@NgModule({
	imports: [
		AgGridModule,
		CommonModule,
		ConfigHubObjectDetailsGridModule,
		ConfigHubObjectOverlayModule,
		LoadingMaskModule,
		TabListModule,
		TabModule,
		TranslateModule
	],
	declarations: [ConfigHubDraftDetailsComponent],
	exports: [ConfigHubDraftDetailsComponent]
})
export class ConfigHubDraftDetailsModule {}
