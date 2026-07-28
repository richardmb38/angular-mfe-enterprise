/*
 * Copyright (C) 2024 Acme Technologies, Inc.  All rights reserved.
 */
import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';

import { BadgeModule } from '@acme-priv/armada-angular/src/acme/angular/components/badge';
import { ButtonModule } from '@acme-priv/armada-angular/src/acme/angular/components/button';
import {
	SecretFieldModule,
	SelectInputModule,
	TextFieldModule,
	ToggleModule
} from '@acme-priv/armada-angular/src/acme/angular/components/form';
import { LoadingMaskModule } from '@acme-priv/armada-angular/src/acme/angular/components/loading-mask';
import { TranslateModule } from '@acme-priv/armada-angular/src/acme/angular/l10n/translation';

import { ConfigHubCloudStorageComponent } from './cloud-storage.component';

/**
 * Exports the Configuration Hub Cloud Storage Component
 */
@NgModule({
	declarations: [ConfigHubCloudStorageComponent],
	imports: [
		CommonModule,
		TranslateModule,
		ButtonModule,
		SelectInputModule,
		LoadingMaskModule,
		ReactiveFormsModule.withConfig({ callSetDisabledState: 'whenDisabledForLegacyCode' }),
		TextFieldModule,
		SecretFieldModule,
		ToggleModule,
		BadgeModule
	],
	exports: [ConfigHubCloudStorageComponent]
})
export class ConfigHubCloudStorageModule {}
