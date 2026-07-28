/*
 * Copyright (C) 2024 Acme Technologies, Inc.  All rights reserved.
 */
import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';

import { BackdropModule } from '@acme-priv/armada-angular/src/acme/angular/components/backdrop';
import { ButtonModule } from '@acme-priv/armada-angular/src/acme/angular/components/button';
import { TranslateModule } from '@acme-priv/armada-angular/src/acme/angular/l10n/translation';

import { HarborPilotIconButtonComponent } from '../harbor-pilot-icon-button/harbor-pilot-icon-button.component';
import { HarborPilotFeatureEnableOverlayComponent } from './harbor-pilot-feature-enable-overlay.component';

@NgModule({
	declarations: [HarborPilotFeatureEnableOverlayComponent],
	imports: [HarborPilotIconButtonComponent, CommonModule, BackdropModule, ButtonModule, TranslateModule],
	exports: [HarborPilotFeatureEnableOverlayComponent]
})
export class HarborPilotFeatureEnableOverlayModule {}
