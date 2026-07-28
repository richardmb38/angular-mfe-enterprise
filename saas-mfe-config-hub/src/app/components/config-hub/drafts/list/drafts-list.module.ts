/*
 * Copyright (C) 2023 Acme Technologies, Inc.  All rights reserved.
 */
import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';

import { AgGridModule } from 'ag-grid-angular';

import { DataGridModule } from '@acme-priv/armada-angular/src/acme/angular/components/grid';
import { LoadingMaskModule } from '@acme-priv/armada-angular/src/acme/angular/components/loading-mask';
import { TranslateModule } from '@acme-priv/armada-angular/src/acme/angular/l10n/translation';

import { ConfigHubDraftsListComponent } from './drafts-list.component';

/**
 * The module exporting the Configuration Hub Draft List Page.
 */
@NgModule({
	declarations: [ConfigHubDraftsListComponent],
	imports: [CommonModule, AgGridModule, DataGridModule, LoadingMaskModule, TranslateModule],
	exports: [ConfigHubDraftsListComponent]
})
export class ConfigHubDraftsListModule {}
