/*
 * Copyright (C) 2025 Acme Technologies, Inc.  All rights reserved.
 */
import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';

import { BackdropModule } from '@acme-priv/armada-angular/src/acme/angular/components/backdrop';
import { IconCloseModule, IconModule } from '@acme-priv/armada-angular/src/acme/angular/components/icons';
import { TranslateModule } from '@acme-priv/armada-angular/src/acme/angular/l10n/translation';

import { HarborPilotPromptsModule } from '../harbor-pilot-prompts/harbor-pilot-prompts.module';
import { HarborPilotPromptsOverlayComponent } from './harbor-pilot-prompts-overlay.component';

@NgModule({
	declarations: [HarborPilotPromptsOverlayComponent],
	imports: [CommonModule, IconModule, IconCloseModule, BackdropModule, TranslateModule, HarborPilotPromptsModule],
	exports: [HarborPilotPromptsOverlayComponent]
})
export class HarborPilotPromptsOverlayModule {}
