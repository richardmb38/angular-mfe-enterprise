/*
 * Copyright (C) 2023 Acme Technologies, Inc.  All rights reserved.
 */
import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';

import { AgGridModule } from 'ag-grid-angular';

import { AlertModule } from '@acme-priv/armada-angular/src/acme/angular/components/alert';
import { ButtonModule } from '@acme-priv/armada-angular/src/acme/angular/components/button';
import { DataGridModule } from '@acme-priv/armada-angular/src/acme/angular/components/grid';
import {
	IconClockModule,
	IconCompleteModule,
	IconEmptyModule,
	IconErrorModule,
	IconLoadingModule,
	IconModule
} from '@acme-priv/armada-angular/src/acme/angular/components/icons';
import { LoadingMaskModule } from '@acme-priv/armada-angular/src/acme/angular/components/loading-mask';
import { TranslateModule } from '@acme-priv/armada-angular/src/acme/angular/l10n/translation';

import { ConfigHubScheduledJobsOverlayModule } from './scheduled-jobs-overlay/scheduled-jobs-overlay.module';
import { ConfigHubScheduledJobsComponent } from './scheduled-jobs.component';

/**
 * The module exporting the Configuration Hub Scheduled Jobs Page.
 */
@NgModule({
	imports: [
		AgGridModule,
		AlertModule,
		ButtonModule,
		CommonModule,
		DataGridModule,
		ConfigHubScheduledJobsOverlayModule,
		IconModule,
		IconClockModule,
		IconCompleteModule,
		IconErrorModule,
		IconLoadingModule,
		IconEmptyModule,
		LoadingMaskModule,
		TranslateModule
	],
	declarations: [ConfigHubScheduledJobsComponent],
	providers: [],
	exports: [ConfigHubScheduledJobsComponent]
})
export class ConfigHubScheduledJobsModule {}
