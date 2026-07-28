/*
 * Copyright (C) 2024 Acme Technologies, Inc.  All rights reserved.
 */
import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';

import { ButtonModule } from '@acme-priv/armada-angular/src/acme/angular/components/button';
import {
	IconDotsAnimatedModule,
	IconExternalLinkModule,
	IconLighthouseModule,
	IconModule,
	IconThumbsDownModule,
	IconThumbsUpModule,
	InitialsIconModule
} from '@acme-priv/armada-angular/src/acme/angular/components/icons';
import { TranslateModule } from '@acme-priv/armada-angular/src/acme/angular/l10n/translation';

import { HarborPilotFeedbackFormOverlayModule } from '../harbor-pilot-feedback-form-overlay/harbor-pilot-feedback-form-overlay.module';
import { HarborPilotIconButtonComponent } from '../harbor-pilot-icon-button/harbor-pilot-icon-button.component';
import { HarborPilotChatMessageComponent } from './harbor-pilot-chat-message.component';
import { MarkdownTableWidthDirective } from './markdown-table-width-directive';
import { MarkdownModule } from 'ngx-markdown';

@NgModule({
	imports: [
		CommonModule,
		ButtonModule,
		IconLighthouseModule,
		IconThumbsUpModule,
		IconThumbsDownModule,
		IconDotsAnimatedModule,
		IconExternalLinkModule,
		IconModule,
		InitialsIconModule,
		TranslateModule,
		MarkdownModule.forChild(),
		MarkdownTableWidthDirective,
		HarborPilotFeedbackFormOverlayModule,
		HarborPilotIconButtonComponent
	],
	declarations: [HarborPilotChatMessageComponent],
	exports: [HarborPilotChatMessageComponent]
})
export class HarborPilotChatMessageModule {}
