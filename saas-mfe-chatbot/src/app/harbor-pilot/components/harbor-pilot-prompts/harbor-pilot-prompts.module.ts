/*
 * Copyright (C) 2025 Acme Technologies, Inc.  All rights reserved.
 */
import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';

import { BadgeModule } from '@acme-priv/armada-angular/src/acme/angular/components/badge';
import { IconBrainModule, IconModule } from '@acme-priv/armada-angular/src/acme/angular/components/icons';
import { TooltipModule } from '@acme-priv/armada-angular/src/acme/angular/components/tooltip';
import { TranslateModule } from '@acme-priv/armada-angular/src/acme/angular/l10n/translation';

import { HarborPilotPromptsComponent } from './harbor-pilot-prompts.component';

@NgModule({
	declarations: [HarborPilotPromptsComponent],
	imports: [CommonModule, IconModule, IconBrainModule, TooltipModule, TranslateModule, BadgeModule],
	exports: [HarborPilotPromptsComponent]
})
export class HarborPilotPromptsModule {}
