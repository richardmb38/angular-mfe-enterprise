import { Component, OnInit, output } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

import { Observable } from 'rxjs';

import { DropdownItemOption } from '@acme-priv/armada-angular/src/acme/angular/components/dropdown-item';
import { TranslateService } from '@acme-priv/armada-angular/src/acme/angular/l10n/translation';

import { FeatureFlagService } from '@acme-priv/ui-common/src/acme/angular/util';

import { FeatureFlags } from 'app/feature-flags.enum';
import { HarborPilotStore } from 'app/harbor-pilot/harbor-pilot.store';
import { HARBOR_PILOT_PROMPT_CATEGORIES_MAP, Tools } from 'app/harbor-pilot/shared/models/suggestions.model';

@Component({
	selector: 'app-harbor-pilot-chat-message-form',
	templateUrl: './harbor-pilot-chat-message-form.component.html',
	styleUrls: ['./harbor-pilot-chat-message-form.component.scss']
})
export class HarborPilotChatMessageFormComponent implements OnInit {
	/**
	 * Boolean flag to track if the tools selection is enabled.
	 */
	isToolsSelectionEnabled = false;

	/**
	 * Boolean flag to track Tools dropdown select list open state.
	 */
	isToolsDropdownListOpen = false;

	/**
	 * True if there is currently any prompt from the bot in a loading state.
	 */
	isMessageLoading = false;

	/**
	 * Tools id's map to a dropdown select list item options.
	 *
	 * @type {DropdownItemOption[]}
	 */
	toolsDropdownListOptionsMap = HARBOR_PILOT_PROMPT_CATEGORIES_MAP;

	/**
	 * Tools dropdown select list item options.
	 *
	 * @type {DropdownItemOption[]}
	 */
	toolsDropdownListOptions = Array.from(this.toolsDropdownListOptionsMap.values());

	/**
	 * Message value for the user prompt from the form textarea input.
	 */
	message = '';

	/**
	 * Current selected tool Observable.
	 */
	tool$: Observable<Tools[]>;

	/**
	 * Emits the explore prompts action
	 */
	openPromptsOverlay = output();

	constructor(
		private harborPilotStore: HarborPilotStore,
		private translateService: TranslateService,
		private featureFlagService: FeatureFlagService
	) {
		// Sets the is message loading flag value from the store.
		this.harborPilotStore.selectIsMessageLoading$
			.pipe(takeUntilDestroyed())
			.subscribe(isMessageLoading => (this.isMessageLoading = isMessageLoading));
	}

	/**
	 * Component initialization.
	 */
	ngOnInit(): void {
		// Set current selected tool from store.
		this.tool$ = this.harborPilotStore.selectTools$;
		// TODO: Remove HARBOR_PILOT_INTELLIGENT_TOOL feature flag check once the feature is enabled for all users.
		this.isToolsSelectionEnabled = !this.featureFlagService.isEnabled(FeatureFlags.HARBOR_PILOT_INTELLIGENT_TOOL);
	}

	/**
	 * Handles changes to the input element
	 */
	onInputChange(newValue: string): void {
		this.message = newValue;
	}

	/**
	 * Handles keydown event in the textarea field.
	 */
	onTextAreaKeydown(e: KeyboardEvent) {
		// If there's an ongoing message send interaction avoid execution.
		if (this.isMessageLoading) {
			if (e.key === 'Enter') {
				e.preventDefault();
			}
			return;
		}
		//  Else just continue to handle the event.
		if ((e.ctrlKey || e.shiftKey) && e.key === 'Enter') {
			this.message = this.message + '\n';
		} else if (e.key === 'Enter') {
			e.preventDefault();
			this.submitMessage();
		}
	}

	/**
	 * Handle's tool selection dropdown list change.
	 */
	onToolSelectChange(option: DropdownItemOption) {
		this.harborPilotStore.setTools([option.id as Tools]);
		this.isToolsDropdownListOpen = false;
	}

	/**
	 * Handles click event on the form main action button.
	 */
	onActionButtonClick() {
		if (this.isMessageLoading) {
			this.cancelSubmitMessage();
		} else {
			this.submitMessage();
		}
	}

	/**
	 * Handles clicks on the clear chat button
	 */
	onClearChatClick(): void {
		this.harborPilotStore.startNewSession();
	}

	/**
	 * Handles clicks on the explore prompts button
	 */
	onExplorePromptsClick(): void {
		this.openPromptsOverlay.emit();
	}

	/**
	 * Submits a user prompt to be processed.
	 */
	private submitMessage() {
		if (this.message && this.message.trim() !== '') {
			this.harborPilotStore.sendMessage({
				message: this.message
			});
			this.message = '';
		}
	}

	/**
	 * Cancels an ongoing propmt submit, prompting a cancelation message to the user.
	 */
	private cancelSubmitMessage() {
		this.harborPilotStore.sendMessage({
			message: this.translateService.instant('CHATBOT.MESSAGE_FORM.STOP_PROMPT'),
			cancel: true
		});
	}
}
