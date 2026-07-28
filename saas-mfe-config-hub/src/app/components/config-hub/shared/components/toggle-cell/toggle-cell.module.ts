/*
 * Copyright (C) 2023 Acme Technologies, Inc.  All rights reserved.
 */
import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';

import { ToggleModule } from '@acme-priv/armada-angular/src/acme/angular/components/form';

import { ToggleCellComponent } from './toggle-cell.component';

/**
 * Exports the Toggle Cell Component
 */
@NgModule({
	declarations: [ToggleCellComponent],
	exports: [ToggleCellComponent],
	imports: [CommonModule, ToggleModule]
})
export class ToggleCellModule {}
