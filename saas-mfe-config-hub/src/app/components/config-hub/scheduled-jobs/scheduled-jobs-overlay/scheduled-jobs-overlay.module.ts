/*
 * Copyright (C) 2025 Acme Technologies, Inc.  All rights reserved.
 */
import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';

import { ButtonModule } from '@acme-priv/armada-angular/src/acme/angular/components/button';
import { LoadingMaskModule } from '@acme-priv/armada-angular/src/acme/angular/components/loading-mask';
import { OverlayModule } from '@acme-priv/armada-angular/src/acme/angular/components/overlay';
import { TranslateModule } from '@acme-priv/armada-angular/src/acme/angular/l10n/translation';

import { ConfigHubScheduledDeployFormModule } from '../scheduled-deploy-form/scheduled-deploy-form.module';
import { ScheduledJobsFormModule } from '../scheduled-jobs-form/scheduled-jobs-form.module';
import { ConfigHubScheduledJobsOverlayComponent } from './scheduled-jobs-overlay.component';

@NgModule({
	declarations: [ConfigHubScheduledJobsOverlayComponent],
	imports: [
		CommonModule,
		OverlayModule,
		ButtonModule,
		TranslateModule,
		ScheduledJobsFormModule,
		LoadingMaskModule,
		ConfigHubScheduledDeployFormModule
	],
	exports: [ConfigHubScheduledJobsOverlayComponent]
})
export class ConfigHubScheduledJobsOverlayModule {}
