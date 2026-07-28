/*
 * Copyright (C) 2023 Acme Technologies, Inc.  All rights reserved.
 */
import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';

import { AgGridModule } from 'ag-grid-angular';

import {
	DataGridExpandedRowWrapperModule,
	DataGridModule
} from '@acme-priv/armada-angular/src/acme/angular/components/grid';
import { TranslateModule } from '@acme-priv/armada-angular/src/acme/angular/l10n/translation';

import { ObjectNameRendererModule } from './object-name-renderer/object-name-renderer.module';
import { ConfigHubObjectSelectionGridComponent } from './object-selection-grid.component';

/**
 * The module exporting the Configuration Hub Object Selection Grid.
 */
@NgModule({
	declarations: [ConfigHubObjectSelectionGridComponent],
	imports: [
		AgGridModule,
		CommonModule,
		DataGridExpandedRowWrapperModule,
		DataGridModule,
		ReactiveFormsModule.withConfig({ callSetDisabledState: 'whenDisabledForLegacyCode' }),
		TranslateModule,
		ObjectNameRendererModule
	],
	exports: [ConfigHubObjectSelectionGridComponent]
})
export class ConfigHubObjectSelectionGridModule {}
