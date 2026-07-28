/*
 * Copyright (C) 2023 Acme Technologies, Inc.  All rights reserved.
 */
import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';

import { ConfigHubAdvancedSettingsComponent } from './advanced-settings.component';

/**
 * Exports the Configuration Hub Advanced Settings Component
 */
@NgModule({
	declarations: [ConfigHubAdvancedSettingsComponent],
	exports: [ConfigHubAdvancedSettingsComponent],
	imports: [CommonModule, RouterModule]
})
export class ConfigHubAdvancedSettingsModule {}
