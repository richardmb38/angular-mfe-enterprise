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
import { IconEditModule } from '@acme-priv/armada-angular/src/acme/angular/components/icons';
import { TranslateModule } from '@acme-priv/armada-angular/src/acme/angular/l10n/translation';

import { ConfigHubObjectDetailsGridComponent } from './object-details-grid.component';
import { ObjectWarningCellModule } from './object-warning-cell/object-warning-cell.module';

/**
 * The module exporting the Configuration Hub Object Details Grid.
 */
@NgModule({
	imports: [
		AgGridModule,
		CommonModule,
		CompositeDataGridModule,
		MultiSelectBarModule,
		ObjectWarningCellModule,
		SearchBarInputModule,
		IconEditModule,
		TranslateModule
	],
	declarations: [ConfigHubObjectDetailsGridComponent],
	exports: [ConfigHubObjectDetailsGridComponent]
})
export class ConfigHubObjectDetailsGridModule {}
