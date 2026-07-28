/*
 * Copyright (C) 2023 Acme Technologies, Inc.  All rights reserved.
 */
import { CommonModule, DatePipe } from '@angular/common';
import { NgModule } from '@angular/core';

import { AgGridModule } from 'ag-grid-angular';

import { AlertModule } from '@acme-priv/armada-angular/src/acme/angular/components/alert';
import { ButtonModule } from '@acme-priv/armada-angular/src/acme/angular/components/button';
import { DataGridModule } from '@acme-priv/armada-angular/src/acme/angular/components/grid';
import {
	IconClockModule,
	IconCompleteModule,
	IconEmptyModule,
	IconErrorModule,
	IconLoadingModule,
	IconModule
} from '@acme-priv/armada-angular/src/acme/angular/components/icons';
import { LoadingMaskModule } from '@acme-priv/armada-angular/src/acme/angular/components/loading-mask';
import { TranslateModule } from '@acme-priv/armada-angular/src/acme/angular/l10n/translation';

import { ConfigHubScheduledJobsOverlayModule } from '../scheduled-jobs/scheduled-jobs-overlay/scheduled-jobs-overlay.module';
import { BackupDetailsModule } from './backup-details/backup-details.module';
import { ConfigHubBackupListComponent } from './backup-list.component';
import { BackupNameCellModule } from './backup-name-cell/backup-name-cell.module';
import { ConfigHubCreateBackupOverlayModule } from './create-backup-overlay/create-backup-overlay.module';
import { DateTimeCreatedCellModule } from './date-time-created-cell/date-time-created-cell.module';
import { ConfigHubBackupSummaryOverlayModule } from './summary-overlay/summary-overlay.module';

/**
 * The module exporting the Configuration Hub Backups Page.
 */
@NgModule({
	imports: [
		AgGridModule,
		AlertModule,
		ButtonModule,
		CommonModule,
		ConfigHubBackupSummaryOverlayModule,
		ConfigHubCreateBackupOverlayModule,
		ConfigHubScheduledJobsOverlayModule,
		DataGridModule,
		DateTimeCreatedCellModule,
		BackupNameCellModule,
		BackupDetailsModule,
		IconModule,
		IconClockModule,
		IconCompleteModule,
		IconErrorModule,
		IconLoadingModule,
		IconEmptyModule,
		LoadingMaskModule,
		TranslateModule
	],
	declarations: [ConfigHubBackupListComponent],
	providers: [DatePipe],
	exports: [ConfigHubBackupListComponent]
})
export class ConfigHubBackupListModule {}
