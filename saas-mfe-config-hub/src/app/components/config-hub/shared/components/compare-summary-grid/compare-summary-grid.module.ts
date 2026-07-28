/*
 * Copyright (C) 2023 Acme Technologies, Inc.  All rights reserved.
 */
import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';

import { AgGridModule } from 'ag-grid-angular';

import { DataGridModule } from '@acme-priv/armada-angular/src/acme/angular/components/grid';
import { TranslateModule } from '@acme-priv/armada-angular/src/acme/angular/l10n/translation';

import { ObjectDiffCellModule } from '../object-diff-cell/object-diff-cell.module';
import { ObjectTypeCellModule } from '../object-type-cell/object-type-cell.module';
import { ConfigHubCompareSummaryGridComponent } from './compare-summary-grid.component';

/**
 * The module exporting the Configuration Hub Compare Summary Grid.
 */
@NgModule({
	imports: [AgGridModule, CommonModule, DataGridModule, TranslateModule, ObjectTypeCellModule, ObjectDiffCellModule],
	declarations: [ConfigHubCompareSummaryGridComponent],
	exports: [ConfigHubCompareSummaryGridComponent]
})
export class ConfigHubCompareSummaryGridModule {}
