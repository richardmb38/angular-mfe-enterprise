/*
 * Copyright (C) 2023 Acme Technologies, Inc.  All rights reserved.
 */
import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';

import { IconModule } from '@acme-priv/armada-angular/src/acme/angular/components/icons';
import { TranslateModule } from '@acme-priv/armada-angular/src/acme/angular/l10n/translation';

import { IconCellComponent } from './icon-cell.component';

/**
 * The module exporting IconCellComponent.
 */
@NgModule({
	declarations: [IconCellComponent],
	imports: [CommonModule, IconModule, TranslateModule],
	exports: [IconCellComponent]
})
export class IconCellModule {}
