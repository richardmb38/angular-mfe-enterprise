/*
 * Copyright (C) 2023 Acme Technologies, Inc.  All rights reserved.
 */
import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';

import {
	CompositeDataGridModule,
	DataGridModule
} from '@acme-priv/armada-angular/src/acme/angular/components/grid';
import { LoadingMaskModule } from '@acme-priv/armada-angular/src/acme/angular/components/loading-mask';
import { TabsModule } from '@acme-priv/armada-angular/src/acme/angular/components/tabs';
import { TranslateModule } from '@acme-priv/armada-angular/src/acme/angular/l10n/translation';

import { ConfigHubActivityLogComponent } from './activity-log.component';
import { ConfigHubDetailsOverlayModule } from './details-overlay/details-overlay.module';

/**
 * The module exporting the Configuration Hub Activity Log Page.
 */
@NgModule({
	imports: [
		CommonModule,
		TranslateModule,
		DataGridModule,
		ConfigHubDetailsOverlayModule,
		LoadingMaskModule,
		CompositeDataGridModule,
		TabsModule
	],
	declarations: [ConfigHubActivityLogComponent],
	exports: [ConfigHubActivityLogComponent]
})
export class ConfigHubActivityLogModule {}
