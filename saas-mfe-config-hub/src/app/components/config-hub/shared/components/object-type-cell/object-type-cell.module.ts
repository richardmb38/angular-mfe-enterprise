/*
 * Copyright (C) 2023 Acme Technologies, Inc.  All rights reserved.
 */
import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';

import { BadgeModule } from '@acme-priv/armada-angular/src/acme/angular/components/badge';
import { TranslateModule } from '@acme-priv/armada-angular/src/acme/angular/l10n/translation';
import { TruncatedTextToolTipModule } from '@acme-priv/armada-angular/src/acme/angular/util/truncated-text-tooltip';

import { ObjectTypeCellComponent } from './object-type-cell.component';

/**
 * The module exporting ObjectTypeCellComponent.
 */
@NgModule({
	imports: [BadgeModule, CommonModule, TranslateModule, TruncatedTextToolTipModule],
	declarations: [ObjectTypeCellComponent],
	exports: [ObjectTypeCellComponent]
})
export class ObjectTypeCellModule {}
