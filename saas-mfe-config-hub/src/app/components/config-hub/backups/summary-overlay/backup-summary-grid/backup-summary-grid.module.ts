/*
 * Copyright (C) 2023 Acme Technologies, Inc.  All rights reserved.
 */
import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';

import { AgGridModule } from 'ag-grid-angular';

import { DataGridModule } from '@acme-priv/armada-angular/src/acme/angular/components/grid';
import { TranslateModule } from '@acme-priv/armada-angular/src/acme/angular/l10n/translation';

import { ConfigHubBackupSummaryGridComponent } from './backup-summary-grid.component';

/**
 * The module exporting the Configuration Hub Backup Summary Grid.
 */
@NgModule({
	imports: [AgGridModule, CommonModule, DataGridModule, TranslateModule],
	declarations: [ConfigHubBackupSummaryGridComponent],
	exports: [ConfigHubBackupSummaryGridComponent]
})
export class ConfigHubBackupSummaryGridModule {}
