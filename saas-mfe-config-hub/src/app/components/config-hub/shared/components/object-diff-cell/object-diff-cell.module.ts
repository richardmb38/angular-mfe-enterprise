/*
 * Copyright (C) 2023 Acme Technologies, Inc.  All rights reserved.
 */
import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';

import { ObjectDiffCellComponent } from './object-diff-cell.component';

/**
 * The module exporting ObjectDiffCellComponent.
 */
@NgModule({
	declarations: [ObjectDiffCellComponent],
	imports: [CommonModule],
	exports: [ObjectDiffCellComponent]
})
export class ObjectDiffCellModule {}
