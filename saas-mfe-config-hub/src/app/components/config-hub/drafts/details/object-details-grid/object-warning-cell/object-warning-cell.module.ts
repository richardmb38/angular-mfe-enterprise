/*
 * Copyright (C) 2023 Acme Technologies, Inc.  All rights reserved.
 */
import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';

import { BadgeModule } from '@acme-priv/armada-angular/src/acme/angular/components/badge';
import { IconModule, IconWarningModule } from '@acme-priv/armada-angular/src/acme/angular/components/icons';
import { TooltipModule } from '@acme-priv/armada-angular/src/acme/angular/components/tooltip';
import { TranslateModule } from '@acme-priv/armada-angular/src/acme/angular/l10n/translation';

import { ObjectWarningCellComponent } from './object-warning-cell.component';

/**
 * The module exporting ObjectWarningCellComponent.
 */
@NgModule({
	imports: [BadgeModule, CommonModule, IconModule, IconWarningModule, TranslateModule, TooltipModule],
	declarations: [ObjectWarningCellComponent],
	exports: [ObjectWarningCellComponent]
})
export class ObjectWarningCellModule {}
