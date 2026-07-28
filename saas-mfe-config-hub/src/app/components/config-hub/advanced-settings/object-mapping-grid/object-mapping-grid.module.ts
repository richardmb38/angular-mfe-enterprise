/*
 * Copyright (C) 2023 Acme Technologies, Inc.  All rights reserved.
 */
import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';

import { AgGridModule } from 'ag-grid-angular';

import { CompositeDataGridModule } from '@acme-priv/armada-angular/src/acme/angular/components/grid';
import { IconPencilModule } from '@acme-priv/armada-angular/src/acme/angular/components/icons';
import { LoadingMaskModule } from '@acme-priv/armada-angular/src/acme/angular/components/loading-mask';
import { TranslateModule } from '@acme-priv/armada-angular/src/acme/angular/l10n/translation';

import { IconCellModule } from '../../shared/components/icon-cell/icon-cell.module';
import { ToggleCellModule } from '../../shared/components/toggle-cell/toggle-cell.module';
import { ConfigHubObjectMappingGridComponent } from './object-mapping-grid.component';

/**
 * Exports the Configuration Hub Object Mapping Grid Component
 */
@NgModule({
	declarations: [ConfigHubObjectMappingGridComponent],
	exports: [ConfigHubObjectMappingGridComponent],
	imports: [
		AgGridModule,
		CommonModule,
		CompositeDataGridModule,
		TranslateModule,
		ToggleCellModule,
		LoadingMaskModule,
		IconCellModule,
		IconPencilModule
	]
})
export class ConfigHubObjectMappingGridModule {}
