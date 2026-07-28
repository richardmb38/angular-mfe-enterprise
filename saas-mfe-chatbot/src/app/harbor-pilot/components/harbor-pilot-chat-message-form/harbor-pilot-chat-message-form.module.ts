import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';

import { ButtonModule } from '@acme-priv/armada-angular/src/acme/angular/components/button';
import { DropdownSelectListModule } from '@acme-priv/armada-angular/src/acme/angular/components/dropdown-select-list';
import { TextAreaInputModule } from '@acme-priv/armada-angular/src/acme/angular/components/form';
import {
	IconBoltModule,
	IconBrainModule,
	IconBroomModule,
	IconMessageCaptionsModule,
	IconModule,
	IconSendModule,
	IconStopModule,
	IconTelescopeModule
} from '@acme-priv/armada-angular/src/acme/angular/components/icons';
import { TooltipModule } from '@acme-priv/armada-angular/src/acme/angular/components/tooltip';
import { TranslateModule } from '@acme-priv/armada-angular/src/acme/angular/l10n/translation';

import { HarborPilotChatMessageFormComponent } from './harbor-pilot-chat-message-form.component';

@NgModule({
	declarations: [HarborPilotChatMessageFormComponent],
	imports: [
		CommonModule,
		TooltipModule,
		TranslateModule,
		TextAreaInputModule,
		ButtonModule,
		DropdownSelectListModule,
		IconModule,
		IconTelescopeModule,
		IconBrainModule,
		IconBoltModule,
		IconStopModule,
		IconSendModule,
		IconBroomModule,
		IconMessageCaptionsModule
	],
	exports: [HarborPilotChatMessageFormComponent]
})
export class HarborPilotChatMessageFormModule {}
