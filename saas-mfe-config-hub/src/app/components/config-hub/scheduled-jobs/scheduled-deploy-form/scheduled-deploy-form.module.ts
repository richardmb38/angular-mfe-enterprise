/*
 * Copyright (C) 2025 Acme Technologies, Inc.  All rights reserved.
 */
import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';

import { DateFieldModule, TimeFieldModule } from '@acme-priv/armada-angular/src/acme/angular/components/form';

import { ConfigHubScheduledDeployFormComponent } from './scheduled-deploy-form.component';

@NgModule({
	declarations: [ConfigHubScheduledDeployFormComponent],
	imports: [CommonModule, DateFieldModule, TimeFieldModule],
	exports: [ConfigHubScheduledDeployFormComponent]
})
export class ConfigHubScheduledDeployFormModule {}
