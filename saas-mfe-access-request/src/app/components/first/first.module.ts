/*
 * Copyright (C) 2025 Acme Technologies, Inc.  All rights reserved.
 */
import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';

import { FirstComponent } from './first.component';

@NgModule({
	declarations: [FirstComponent],
	imports: [
		CommonModule,
		RouterModule.forChild([
			{
				path: '',
				component: FirstComponent
			}
		])
	]
})
export class FirstModule {}
