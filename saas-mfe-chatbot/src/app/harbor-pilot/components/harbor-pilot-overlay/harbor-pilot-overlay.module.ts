/*
 * Copyright (C) 2024 Acme Technologies, Inc.  All rights reserved.
 */
import { DragDropModule } from '@angular/cdk/drag-drop';
import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';

import { ButtonModule } from '@acme-priv/armada-angular/src/acme/angular/components/button';
import { TranslateModule } from '@acme-priv/armada-angular/src/acme/angular/l10n/translation';

import { HarborPilotActionsModule } from '../harbor-pilot-actions/harbor-pilot-actions.module';
import { HarborPilotChatMessageFormModule } from '../harbor-pilot-chat-message-form/harbor-pilot-chat-message-form.module';
import { HarborPilotChatMessageModule } from '../harbor-pilot-chat-message/harbor-pilot-chat-message.module';
import { HarborPilotFeatureEnableOverlayModule } from '../harbor-pilot-feature-enable-overlay/harbor-pilot-feature-enable-overlay.module';
import { HarborPilotOverlayHeaderModule } from '../harbor-pilot-overlay-header/harbor-pilot-overlay-header.module';
import { HarborPilotPromptsOverlayModule } from '../harbor-pilot-prompts-overlay/harbor-pilot-prompts-overlay.module';
import { HarborPilotOverlayComponent } from './harbor-pilot-overlay.component';

@NgModule({
	imports: [
		CommonModule,
		DragDropModule,
		ButtonModule,
		TranslateModule,
		HarborPilotChatMessageModule,
		HarborPilotActionsModule,
		HarborPilotChatMessageFormModule,
		HarborPilotOverlayHeaderModule,
		HarborPilotPromptsOverlayModule,
		HarborPilotFeatureEnableOverlayModule
	],
	declarations: [HarborPilotOverlayComponent],
	exports: [HarborPilotOverlayComponent]
})
export class HarborPilotOverlayModule {}
