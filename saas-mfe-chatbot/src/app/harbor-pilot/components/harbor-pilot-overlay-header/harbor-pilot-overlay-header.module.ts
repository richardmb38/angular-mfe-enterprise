/*
 * Copyright (C) 2024 Acme Technologies, Inc.  All rights reserved.
 */
import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';

import {
	IconArrowDownModule,
	IconArrowUpModule,
	IconBroomModule,
	IconCloseModule,
	IconCollapseWindowModule,
	IconDragHandleModule,
	IconExpandWindowModule,
	IconModule
} from '@acme-priv/armada-angular/src/acme/angular/components/icons';
import { TooltipModule } from '@acme-priv/armada-angular/src/acme/angular/components/tooltip';
import { TranslateModule } from '@acme-priv/armada-angular/src/acme/angular/l10n/translation';

import { HarborPilotChatMessageModule } from '../harbor-pilot-chat-message/harbor-pilot-chat-message.module';
import { HarborPilotIconButtonComponent } from '../harbor-pilot-icon-button/harbor-pilot-icon-button.component';
import { HarborPilotPromptsModule } from '../harbor-pilot-prompts/harbor-pilot-prompts.module';
import { HarborPilotOverlayHeaderComponent } from './harbor-pilot-overlay-header.component';

@NgModule({
	declarations: [HarborPilotOverlayHeaderComponent],
	exports: [HarborPilotOverlayHeaderComponent],
	imports: [
		CommonModule,
		IconModule,
		IconCloseModule,
		IconCollapseWindowModule,
		IconExpandWindowModule,
		IconBroomModule,
		IconDragHandleModule,
		IconArrowUpModule,
		IconArrowDownModule,
		TooltipModule,
		TranslateModule,
		HarborPilotPromptsModule,
		HarborPilotIconButtonComponent,
		HarborPilotChatMessageModule
	]
})
export class HarborPilotOverlayHeaderModule {}
