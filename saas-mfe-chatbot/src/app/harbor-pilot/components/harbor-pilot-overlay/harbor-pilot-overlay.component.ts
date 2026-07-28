/*
 * Copyright (C) 2024 Acme Technologies, Inc.  All rights reserved.
 */
import { animate, style, transition, trigger } from '@angular/animations';
import {
	AfterViewInit,
	Component,
	DestroyRef,
	ElementRef,
	Injector,
	QueryList,
	Signal,
	ViewChild,
	ViewChildren,
	computed,
	effect,
	inject,
	input,
	output,
	signal
} from '@angular/core';
import { takeUntilDestroyed, toSignal } from '@angular/core/rxjs-interop';

import { debounceTime, map } from 'rxjs';

import { HarborPilotStore } from '../../harbor-pilot.store';
import { HarborPilotChatMessageComponent } from '../harbor-pilot-chat-message/harbor-pilot-chat-message.component';
import { HarborPilotMessage, HarborPilotMessageFeedback } from 'app/harbor-pilot/shared/models/messages.model';

@Component({
	selector: 'app-harbor-pilot-overlay',
	templateUrl: './harbor-pilot-overlay.component.html',
	styleUrls: ['./harbor-pilot-overlay.component.scss'],
	animations: [
		trigger('popInOut', [
			transition(':enter', [
				style({ opacity: 0, scale: 0 }),
				animate('200ms', style({ opacity: 0.7, scale: 1.02 })),
				animate('100ms', style({ opacity: 1, scale: 1 }))
			]),
			transition(':leave', [
				animate('100ms', style({ scale: 1, opacity: 1 })),
				animate('200ms', style({ scale: 0, opacity: 0 }))
			])
		])
	]
})
export class HarborPilotOverlayComponent implements AfterViewInit {
	/**
	 * Reference to the scrollable messages container we listen to for auto scroll functionality.
	 */
	@ViewChild('messagesContainer') messagesContainer: ElementRef;

	/**
	 * QueryList containing all the message components present in the chat body
	 */
	@ViewChildren(HarborPilotChatMessageComponent) messageChildComponents: QueryList<HarborPilotChatMessageComponent>;

	/**
	 * Whether the overlay is shown
	 */
	open = input(false);

	/**
	 * Boundary area for the draggable overlay.
	 */
	boundary = input();

	/**
	 * Flag to show the feature enable and terms disclaimer overlay.
	 */
	disclaimer = input(false);

	/**
	 * Whether the overlay is expanded.
	 */
	expanded = signal(false);

	/**
	 * Whether the overlay is minimized.
	 */
	minimized = signal(false);

	/**
	 * Observable containing the messages that have been sent by both the user and the bot
	 */
	messages = signal<HarborPilotMessage[]>([]);

	/**
	 * Flag to keep track if the conversation is new or not.
	 */
	isNewConversation = computed(() => this.messages().length === 0);

	/**
	 * Flag to keep track of if the application should auto scroll when new blocks are added.
	 */
	isAutoScrollDisabled = signal(false);

	/**
	 * Flag to keep track of if the prompts overlay is shown.
	 */
	isPromptsOverlayShown = signal(false);

	/**
	 * Flag to keep track of if the feature enable overlay is shown.
	 */
	isFeatureEnableOverlayShown: Signal<boolean> = signal(false);

	/**
	 * Emits a dismiss event, once the user clicks the dismiss overlay button.
	 */
	dismiss = output();

	/**
	 *
	 * Reference to the component on destroy lifecicle callback.
	 * @private
	 */
	private destroyRef = inject(DestroyRef);

	/**
	 * Injector instance to inject the required services.
	 */
	private injector = inject(Injector);

	constructor(private harborPilotStore: HarborPilotStore) {
		effect(
			() => {
				if (this.open()) {
					this.messagesContainer?.nativeElement?.scrollTo({
						top: this.messagesContainer?.nativeElement?.scrollHeight,
						behavior: 'auto'
					});
				} else {
					// Set the overlay size modifiers flags back to default.
					this.minimized.set(false);
					this.expanded.set(false);
				}
			},
			{
				allowSignalWrites: true
			}
		);
		// Terms and feature enablement overlay visibility state.
		this.isFeatureEnableOverlayShown = toSignal(
			this.harborPilotStore.selectIsFeatureEnabledOnSystemSettings$.pipe(
				map(isFeatureEnabledOnSystemSettings => !isFeatureEnabledOnSystemSettings)
			),
			{
				injector: this.injector
			}
		);
	}

	/**
	 * Lifecycle hook to wait until DOM elements exist.
	 */
	ngAfterViewInit(): void {
		// Subscribe to the messages observable and update the messages signal when new messages are added.
		this.harborPilotStore.selectMessages$.pipe(takeUntilDestroyed(this.destroyRef)).subscribe(messages => {
			this.messages.set(messages as HarborPilotMessage[]);
		});
		// Subscribe to the last updated message observable and scroll to the bottom of the messages container when new messages are added.
		this.harborPilotStore.selectLastUpdatedMessage$
			.pipe(debounceTime(100), takeUntilDestroyed(this.destroyRef))
			.subscribe(last => {
				if (this.open()) {
					/**
					 * Scroll to last message always unless there's a explicit flag to skip this behavior
					 * @see HarborPilotMessage.skipScrollTo
					 */
					if (!last?.skipScrollTo) {
						setTimeout(() => {
							this.messagesContainer?.nativeElement?.scrollTo({
								top: this.messagesContainer?.nativeElement?.scrollHeight,
								behavior: 'smooth'
							});
						});
					}
				}
			});
	}

	/**
	 * Handles close button clicks
	 */
	onDismiss(): void {
		this.dismiss.emit();
	}

	/**
	 * Handles overlay expand flag state changes.
	 */
	onExpandChanged(): void {
		if (!this.isAutoScrollDisabled()) {
			this.messagesContainer.nativeElement.scrollTo({
				top: this.messagesContainer.nativeElement.scrollHeight,
				behavior: 'auto'
			});
		}
	}

	/**
	 * Handles user feedback submitted.
	 */
	onUserFeedbackSubmitted(message: HarborPilotMessage, feedback: HarborPilotMessageFeedback): void {
		this.harborPilotStore.rateMessage({ message, feedback });
	}

	/**
	 * Sets the isAutoScrollDisabled flag depending on if the user is currently scrolled to the bottom of the screen or not.
	 */
	onScroll(scrollContainer: HTMLDivElement): void {
		// markdown can make the height a floating point value
		this.isAutoScrollDisabled.set(
			!!scrollContainer.scrollTop &&
				Math.abs(scrollContainer.scrollTop - (scrollContainer.scrollHeight - scrollContainer.offsetHeight)) >
					0.5
		);
	}
}
