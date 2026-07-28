/*
 * Copyright (C) 2024 Acme Technologies, Inc.  All rights reserved.
 */
import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';

import {
	IconBadgeCheckSolidModule,
	IconCodeBranchModule,
	IconLayerGroupModule,
	IconModule
} from '@acme-priv/armada-angular/src/acme/angular/components/icons';

import { HarborPilotChatMessageModule } from '../harbor-pilot-chat-message/harbor-pilot-chat-message.module';
import { HarborPilotActionsComponent } from './harbor-pilot-actions.component';

@NgModule({
	imports: [
		CommonModule,
		HarborPilotChatMessageModule,
		IconBadgeCheckSolidModule,
		IconCodeBranchModule,
		IconLayerGroupModule,
		IconModule
	],
	declarations: [HarborPilotActionsComponent],
	exports: [HarborPilotActionsComponent]
})
export class HarborPilotActionsModule {}
