/*
 * Copyright (C) 2023 Acme Technologies, Inc.  All rights reserved.
 */
import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';

import { ButtonModule } from '@acme-priv/armada-angular/src/acme/angular/components/button';
import { CopyModule } from '@acme-priv/armada-angular/src/acme/angular/components/copy';
import {
	DateFieldModule,
	FieldModule,
	RadioFieldModule,
	TextAreaInputModule,
	TextFieldModule,
	TimeFieldModule
} from '@acme-priv/armada-angular/src/acme/angular/components/form';
import {
	IconCheckCircleModule,
	IconModule,
	IconWarningModule
} from '@acme-priv/armada-angular/src/acme/angular/components/icons';
import { LoadingMaskModule } from '@acme-priv/armada-angular/src/acme/angular/components/loading-mask';
import { OverlayModule } from '@acme-priv/armada-angular/src/acme/angular/components/overlay';
import { TooltipModule } from '@acme-priv/armada-angular/src/acme/angular/components/tooltip';
import { TranslateModule } from '@acme-priv/armada-angular/src/acme/angular/l10n/translation';
import { IsFalsyModule } from '@acme-priv/armada-angular/src/acme/angular/util/isFalsy';
import { TruncatedTextToolTipModule } from '@acme-priv/armada-angular/src/acme/angular/util/truncated-text-tooltip';

import { ConfigHubDeployOverlayComponent } from './deploy-overlay.component';

/**
 * The module exporting the Configuration Hub Deploy Overlay.
 */
@NgModule({
	imports: [
		ButtonModule,
		CommonModule,
		CopyModule,
		FieldModule,
		IconCheckCircleModule,
		IconModule,
		IconWarningModule,
		LoadingMaskModule,
		OverlayModule,
		TextAreaInputModule,
		TooltipModule,
		TranslateModule,
		TruncatedTextToolTipModule,
		ReactiveFormsModule,
		RadioFieldModule,
		DateFieldModule,
		TimeFieldModule,
		IsFalsyModule,
		TextFieldModule
	],
	declarations: [ConfigHubDeployOverlayComponent],
	exports: [ConfigHubDeployOverlayComponent]
})
export class ConfigHubDeployOverlayModule {}
