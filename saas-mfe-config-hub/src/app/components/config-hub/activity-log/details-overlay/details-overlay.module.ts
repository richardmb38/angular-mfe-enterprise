/*
 * Copyright (C) 2023 Acme Technologies, Inc.  All rights reserved.
 */
import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';

import { ButtonModule } from '@acme-priv/armada-angular/src/acme/angular/components/button';
import { CopyModule } from '@acme-priv/armada-angular/src/acme/angular/components/copy';
import { FieldModule, TextAreaInputModule } from '@acme-priv/armada-angular/src/acme/angular/components/form';
import {
	IconCheckCircleModule,
	IconModule,
	IconWarningModule
} from '@acme-priv/armada-angular/src/acme/angular/components/icons';
import { LoadingMaskModule } from '@acme-priv/armada-angular/src/acme/angular/components/loading-mask';
import { OverlayModule } from '@acme-priv/armada-angular/src/acme/angular/components/overlay';
import { TabListModule, TabModule } from '@acme-priv/armada-angular/src/acme/angular/components/tabs';
import { TranslateModule } from '@acme-priv/armada-angular/src/acme/angular/l10n/translation';

import { ConfigHubDetailsOverlayComponent } from './details-overlay.component';

/**
 * The module exporting the Configuration Hub Activity Log Details Overlay.
 */
@NgModule({
	imports: [
		CommonModule,
		TranslateModule,
		CopyModule,
		ButtonModule,
		FieldModule,
		OverlayModule,
		TextAreaInputModule,
		LoadingMaskModule,
		IconCheckCircleModule,
		IconModule,
		IconWarningModule,
		TabListModule,
		TabModule
	],
	declarations: [ConfigHubDetailsOverlayComponent],
	exports: [ConfigHubDetailsOverlayComponent]
})
export class ConfigHubDetailsOverlayModule {}
