/*
 * Copyright (C) 2023 Acme Technologies, Inc.  All rights reserved.
 */
import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';

import { AgGridModule } from 'ag-grid-angular';

import { CompositeDataGridModule } from '@acme-priv/armada-angular/src/acme/angular/components/grid';
import { TranslateModule } from '@acme-priv/armada-angular/src/acme/angular/l10n/translation';

import { ConfigHubObjectMetadataGridComponent } from './object-metadata-grid.component';

/*
 * The module exporting the ConfigHubObjectMetadataGridComponent
 */
@NgModule({
	declarations: [ConfigHubObjectMetadataGridComponent],
	imports: [AgGridModule, CommonModule, CompositeDataGridModule, TranslateModule],
	exports: [ConfigHubObjectMetadataGridComponent]
})
export class ConfigHubObjectMetadataGridModule {}
