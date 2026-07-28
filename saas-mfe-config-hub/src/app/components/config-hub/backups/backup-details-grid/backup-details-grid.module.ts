/*
 * Copyright (C) 2023 Acme Technologies, Inc.  All rights reserved.
 */
import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';

import { AgGridModule } from 'ag-grid-angular';

import { SearchBarInputModule } from '@acme-priv/armada-angular/src/acme/angular/components/form';
import {
	CompositeDataGridModule,
	MultiSelectBarModule
} from '@acme-priv/armada-angular/src/acme/angular/components/grid';
import { LoadingMaskModule } from '@acme-priv/armada-angular/src/acme/angular/components/loading-mask';
import { TranslateModule } from '@acme-priv/armada-angular/src/acme/angular/l10n/translation';

import { ConfigHubBackupDetailsOverlayModule } from '../backup-details-overlay/backup-details-overlay.module';
import { ConfigHubBackupDetailsGridComponent } from './backup-details-grid.component';

/**
 * The module exporting ConfigHubBackupDetailsGridModule.
 */
@NgModule({
	declarations: [ConfigHubBackupDetailsGridComponent],
	imports: [
		AgGridModule,
		CommonModule,
		CompositeDataGridModule,
		TranslateModule,
		LoadingMaskModule,
		MultiSelectBarModule,
		SearchBarInputModule,
		ConfigHubBackupDetailsOverlayModule
	],
	exports: [ConfigHubBackupDetailsGridComponent]
})
export class ConfigHubBackupDetailsGridModule {}
