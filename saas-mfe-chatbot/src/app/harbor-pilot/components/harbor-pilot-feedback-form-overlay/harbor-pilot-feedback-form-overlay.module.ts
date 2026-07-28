/*
 * Copyright (C) 2024 Acme Technologies, Inc.  All rights reserved.
 */
import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';

import { BackdropModule } from '@acme-priv/armada-angular/src/acme/angular/components/backdrop';
import { ButtonModule } from '@acme-priv/armada-angular/src/acme/angular/components/button';
import { TextFieldModule } from '@acme-priv/armada-angular/src/acme/angular/components/form';
import { QuickFilterModule } from '@acme-priv/armada-angular/src/acme/angular/components/quick-filter';
import { TranslateModule } from '@acme-priv/armada-angular/src/acme/angular/l10n/translation';

import { HarborPilotIconButtonComponent } from '../harbor-pilot-icon-button/harbor-pilot-icon-button.component';
import { HarborPilotFeedbackFormOverlayComponent } from './harbor-pilot-feedback-form-overlay.component';

@NgModule({
	declarations: [HarborPilotFeedbackFormOverlayComponent],
	imports: [
		CommonModule,
		BackdropModule,
		TextFieldModule,
		ButtonModule,
		QuickFilterModule,
		TranslateModule,
		HarborPilotIconButtonComponent
	],
	exports: [HarborPilotFeedbackFormOverlayComponent]
})
export class HarborPilotFeedbackFormOverlayModule {}
