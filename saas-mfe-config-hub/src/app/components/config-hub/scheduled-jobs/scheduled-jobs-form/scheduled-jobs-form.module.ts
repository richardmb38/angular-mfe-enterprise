/*
 * Copyright (C) 2025 Acme Technologies, Inc.  All rights reserved.
 */
import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';

import {
	SelectFieldModule,
	TextFieldModule,
	TimeFieldModule
} from '@acme-priv/armada-angular/src/acme/angular/components/form';
import { TranslateModule } from '@acme-priv/armada-angular/src/acme/angular/l10n/translation';

import { ConfigHubScheduledJobsFormComponent } from './scheduled-jobs-form.component';

@NgModule({
	declarations: [ConfigHubScheduledJobsFormComponent],
	imports: [CommonModule, TranslateModule, SelectFieldModule, TimeFieldModule, ReactiveFormsModule, TextFieldModule],
	exports: [ConfigHubScheduledJobsFormComponent]
})
export class ScheduledJobsFormModule {}
