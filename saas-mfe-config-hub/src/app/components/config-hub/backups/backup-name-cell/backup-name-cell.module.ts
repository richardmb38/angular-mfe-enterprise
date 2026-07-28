/*
 * Copyright (C) 2023 Acme Technologies, Inc.  All rights reserved.
 */
import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';

import { BadgeModule } from '@acme-priv/armada-angular/src/acme/angular/components/badge';
import { TranslateModule } from '@acme-priv/armada-angular/src/acme/angular/l10n/translation';
import { TruncatedTextToolTipModule } from '@acme-priv/armada-angular/src/acme/angular/util/truncated-text-tooltip';

import { BackupNameCellComponent } from './backup-name-cell.component';

/**
 * The module exporting BackupNameCellComponent.
 */
@NgModule({
	imports: [BadgeModule, CommonModule, TranslateModule, TruncatedTextToolTipModule],
	declarations: [BackupNameCellComponent],
	exports: [BackupNameCellComponent]
})
export class BackupNameCellModule {}
