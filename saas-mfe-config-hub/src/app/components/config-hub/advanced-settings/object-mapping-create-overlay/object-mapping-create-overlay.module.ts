/*
 * Copyright (C) 2023 Acme Technologies, Inc.  All rights reserved.
 */
import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';

import { AgGridModule } from 'ag-grid-angular';

import { ButtonModule } from '@acme-priv/armada-angular/src/acme/angular/components/button';
import { SelectInputModule } from '@acme-priv/armada-angular/src/acme/angular/components/form';
import { CompositeDataGridModule } from '@acme-priv/armada-angular/src/acme/angular/components/grid';
import { LoadingMaskModule } from '@acme-priv/armada-angular/src/acme/angular/components/loading-mask';
import { OverlayModule } from '@acme-priv/armada-angular/src/acme/angular/components/overlay';
import { TranslateModule } from '@acme-priv/armada-angular/src/acme/angular/l10n/translation';

import { DropdownCellModule } from '../../shared/components/dropdown-cell/dropdown-cell.module';
import { IconCellModule } from '../../shared/components/icon-cell/icon-cell.module';
import { ConfigHubObjectMappingOverlayComponent } from './object-mapping-create-overlay.component';

/**
 * The module exporting the Object Mapping Create Overlay.
 */
@NgModule({
	imports: [
		AgGridModule,
		CommonModule,
		TranslateModule,
		ButtonModule,
		OverlayModule,
		LoadingMaskModule,
		CompositeDataGridModule,
		SelectInputModule,
		DropdownCellModule,
		IconCellModule
	],
	declarations: [ConfigHubObjectMappingOverlayComponent],
	exports: [ConfigHubObjectMappingOverlayComponent]
})
export class ConfigHubObjectMappingOverlayModule {}
