/*
 * Copyright (C) 2024 Acme Technologies, Inc.  All rights reserved.
 */
import { Component, OnInit, model, output, signal } from '@angular/core';

import { Observable } from 'rxjs';

import { TranslateService } from '@acme-priv/armada-angular/src/acme/angular/l10n/translation';

import { AppShellWrapperService } from '@acme-priv/ui-common/src/acme/angular/util/app-shell';

import { HarborPilotStore } from 'app/harbor-pilot/harbor-pilot.store';
import { HarborPilotMessage, MessageType } from 'app/harbor-pilot/shared/models/messages.model';
import { CreateHarborPilotMessageVM } from 'app/harbor-pilot/shared/utils/harbor-pilot-message.utils';

@Component({
	selector: 'app-harbor-pilot-overlay-header',
	templateUrl: './harbor-pilot-overlay-header.component.html',
	styleUrl: './harbor-pilot-overlay-header.component.scss'
})
export class HarborPilotOverlayHeaderComponent implements OnInit {
	/**
	 * Tracking flag for the overlay expanded state.
	 */
	expanded = model<boolean>(false);

	/**
	 * Tracking flag for the overlay minimized state.
	 */
	minimized = model<boolean>(false);

	/**
	 * Tracking flag for displaying the new conversation elements on the header.
	 */
	isNewConversation$: Observable<boolean>;

	/**
	 * Agent welcome message prompt for the user.
	 */
	welcomeMessage = signal<HarborPilotMessage>(null);

	/**
	 * Emits a dismiss event, once the user clicks the dismiss overlay button.
	 */
	dismiss = output();

	constructor(
		private harborPilotStore: HarborPilotStore,
		private translateService: TranslateService,
		private appShellWrapperService: AppShellWrapperService
	) {}

	/**
	 * Component initialization
	 */
	ngOnInit() {
		this.isNewConversation$ = this.harborPilotStore.selectIsQuickStartSectionShown$;
		this.initializeWelcomeMessage();
	}

	/**
	 * Handles expand/collapse button clicks
	 */
	onExpandClick(): void {
		this.expanded.update(() => !this.expanded());
	}

	/**
	 * Handles maximize/minimize button clicks
	 */
	onMinimizeClick(): void {
		this.minimized.update(() => !this.minimized());
	}

	/**
	 * Handles close button clicks
	 */
	onCloseClick(): void {
		this.dismiss.emit();
	}

	/**
	 * Initializes the messages
	 */
	private async initializeWelcomeMessage() {
		// Get the user context to greet the user.
		const userContext = await this.appShellWrapperService.getUserContextV1();
		this.welcomeMessage.set(
			new CreateHarborPilotMessageVM(
				MessageType.BOT,
				this.translateService.instant({
					translateKey: 'CHATBOT.HEY_THERE_IM_HARBOR_PILOT',
					translateParams: { user: userContext.displayName }
				})
			)
		);
	}
}
