/*
 * Copyright (C) 2023 Acme Technologies, Inc.  All rights reserved.
 */
import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';

import { AgGridModule } from 'ag-grid-angular';

import { CompositeDataGridModule } from '@acme-priv/armada-angular/src/acme/angular/components/grid';
import { TranslateModule } from '@acme-priv/armada-angular/src/acme/angular/l10n/translation';

import { ConfigHubObjectChangelogGridComponent } from './object-changelog-grid.component';

/**
 * The module exporting the Configuration Hub Object Changelog Grid.
 */
@NgModule({
	declarations: [ConfigHubObjectChangelogGridComponent],
	imports: [AgGridModule, CommonModule, CompositeDataGridModule, TranslateModule],
	exports: [ConfigHubObjectChangelogGridComponent]
})
export class ConfigHubObjectChangelogGridModule {}
