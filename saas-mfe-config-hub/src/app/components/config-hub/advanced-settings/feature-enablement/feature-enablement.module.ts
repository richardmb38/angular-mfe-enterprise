/*
 * Copyright (C) 2024 Acme Technologies, Inc.  All rights reserved.
 */
import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';

import { BadgeModule } from '@acme-priv/armada-angular/src/acme/angular/components/badge';
import { ButtonModule } from '@acme-priv/armada-angular/src/acme/angular/components/button';
import { ToggleModule } from '@acme-priv/armada-angular/src/acme/angular/components/form';
import { LoadingMaskModule } from '@acme-priv/armada-angular/src/acme/angular/components/loading-mask';
import { TranslateModule } from '@acme-priv/armada-angular/src/acme/angular/l10n/translation';
import { IsFalsyModule } from '@acme-priv/armada-angular/src/acme/angular/util/isFalsy';

import { ConfigHubFeatureEnablementComponent } from './feature-enablement.component';

@NgModule({
	declarations: [ConfigHubFeatureEnablementComponent],
	imports: [
		CommonModule,
		ButtonModule,
		LoadingMaskModule,
		ReactiveFormsModule.withConfig({ callSetDisabledState: 'whenDisabledForLegacyCode' }),
		ToggleModule,
		BadgeModule,
		IsFalsyModule,
		TranslateModule
	],
	exports: [ConfigHubFeatureEnablementComponent]
})
export class ConfigHubFeatureEnablementModule {}
