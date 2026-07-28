import { Injectable, OnDestroy } from '@angular/core';

import { ComponentStore, OnStateInit, tapResponse } from '@ngrx/component-store';
import {
	Observable,
	Subject,
	exhaustMap,
	merge,
	of,
	switchMap,
	takeUntil,
	tap,
	throwError,
	withLatestFrom
} from 'rxjs';

import { TranslateService } from '@acme-priv/armada-angular/src/acme/angular/l10n/translation';
import { BrowserStorageService } from '@acme-priv/armada-angular/src/acme/angular/security/session';

import { FeatureFlagService } from '@acme-priv/ui-common/src/acme/angular/util';

import {
	HARBOR_PILOT_DISABLED_ACTIONS,
	HarborPilotAction,
	HarborPilotActionAPIPayload,
	HarborPilotInResponseTypes
} from './shared/models/actions.model';
import {
	ActorType,
	HarborPilotAPIPayload,
	HarborPilotAPIResponse,
	HarborPilotMessage,
	HarborPilotMessageFeedback,
	MessageType
} from './shared/models/messages.model';
import { Tools } from './shared/models/suggestions.model';
import { HarborPilotMessagesService } from './shared/services/harbor-pilot-messages.service';
import { CreateHarborPilotMessageVM } from './shared/utils/harbor-pilot-message.utils';
import { FeatureFlags } from 'app/feature-flags.enum';

export interface HarborPilotState {
	messages: HarborPilotMessage[];
	sessionId: string;
	showQuickStart: boolean;
	tools: Tools[];
	lastUpdatedMessage: HarborPilotMessage;
	isOpen: boolean;
	isFeatureEnabledOnSystemSettings: boolean;
}

@Injectable()
export class HarborPilotStore extends ComponentStore<HarborPilotState> implements OnStateInit, OnDestroy {
	/**
	 * The default message to send on sendMessage in case method is called without a value
	 */
	readonly defaultMessage: string;

	/**
	 * Subject to end all subscriptions.
	 */
	destroy$: Subject<void> = new Subject();
	//										//
	// ============ SELECTORS =============	//
	//										//

	/**
	 * Selects the tools being used for the chatbot message
	 */
	selectTools$ = this.select(state => state.tools);

	/**
	 * Selects all the messages in the session
	 */
	selectMessages$ = this.select(state => state.messages);

	/**
	 * Selects the chat session ID
	 */
	selectSessionId$ = this.select(state => state.sessionId || null);

	/**
	 * Selects if the quick start tool tiles are shown.
	 */
	selectIsQuickStartSectionShown$ = this.select(state => state.showQuickStart);

	/**
	 * Selects the last message that was updated.
	 */
	selectLastUpdatedMessage$ = this.select(state => state.lastUpdatedMessage);

	/**
	 * Selects if there's currently a message request ongoing looking for a loading state.
	 */
	selectIsMessageLoading$ = this.select(state => state.messages.some(message => message.loading));

	/**
	 * Selects the last message from the bot.
	 */
	selectLastBotMessage$ = this.select(
		state => state.messages.filter(message => message.type === MessageType.BOT).slice(-1)[0]
	);

	/**
	 * Selects the current value of the Chatbox overlay open state.
	 */
	selectIsOpen$ = this.select(state => state.isOpen);

	/**
	 * Selects if the feature is enabled on the system settings.
	 *
	 * @memberof HarborPilotStore
	 */
	selectIsFeatureEnabledOnSystemSettings$ = this.select(state => state.isFeatureEnabledOnSystemSettings);

	//										//
	// ============= UPDATERS =============	//
	//										//

	/**
	 * Loads the state from the session service
	 */
	loadState = this.updater((state, loadedState: HarborPilotState): HarborPilotState => {
		return loadedState ? { ...state, ...loadedState } : state;
	});

	/**
	 * Updates the session ID
	 */
	setSessionId = this.updater(
		(state, sessionId: string): HarborPilotState => ({
			...state,
			sessionId: sessionId
		})
	);

	/**
	 * Clears the chat messages and session ID
	 */
	setNewChatSession = this.updater(
		(state): HarborPilotState => ({
			...this.getInitialState(),
			isOpen: state.isOpen,
			isFeatureEnabledOnSystemSettings: state.isFeatureEnabledOnSystemSettings
		})
	);

	/**
	 * Adds an array of messages to the end of the conversation
	 */
	addMessages = this.updater(
		(state, messages: HarborPilotMessage[]): HarborPilotState => ({
			...state,
			showQuickStart: false,
			messages: [...state.messages, ...messages],
			lastUpdatedMessage: messages[messages.length - 1]
		})
	);

	/**
	 * Updates the last bot messages.
	 * Adds the property of commandActions and navigationActions so the UI can properly group/display them
	 */
	updateLastBotMessage = this.updater((state, message: HarborPilotMessage): HarborPilotState => {
		const lastBotMessageIndex = state.messages
			.slice()
			.reverse()
			.findIndex(msg => msg.type === 'bot');
		if (lastBotMessageIndex !== -1) {
			const updatedMessages = [...state.messages];

			updatedMessages[state.messages.length - 1 - lastBotMessageIndex] = {
				...message,
				commandActions: message.actions?.filter(
					obj =>
						obj.actor &&
						obj.actor === ActorType.AGENT &&
						// Skip any disabled action on the UI side.
						!HARBOR_PILOT_DISABLED_ACTIONS.some(disabled => disabled === obj.actionType)
				),
				navigationActions: message.actions?.filter(
					obj =>
						obj.actor &&
						obj.actor === ActorType.USER &&
						// Skip any disabled action on the UI side.
						!HARBOR_PILOT_DISABLED_ACTIONS.some(disabled => disabled === obj.actionType)
				)
			};
			return {
				...state,
				messages: updatedMessages,
				lastUpdatedMessage: updatedMessages[state.messages.length - 1 - lastBotMessageIndex]
			};
		} else {
			return state;
		}
	});

	/**
	 * Updates the last bot messages.
	 * Adds the property of commandActions and navigationActions so the UI can properly group/display them
	 */
	clearLastBotMessageCommandActions = this.updater((state): HarborPilotState => {
		const lastBotMessageIndex = state.messages
			.slice()
			.reverse()
			.findIndex(msg => msg.type === 'bot');
		if (lastBotMessageIndex !== -1) {
			const updatedMessages = [...state.messages];

			updatedMessages[state.messages.length - 1 - lastBotMessageIndex].commandActions = [];
			return {
				...state,
				messages: updatedMessages,
				lastUpdatedMessage: updatedMessages[state.messages.length - 1 - lastBotMessageIndex]
			};
		} else {
			return state;
		}
	});

	/**
	 * Updates a given message.
	 * Takes the current state and the target message to update as parameters.
	 */
	updateMessage = this.updater((state, updatedMessage: HarborPilotMessage): HarborPilotState => {
		const messageToUpdateIndex = state.messages.findIndex(
			message => message.requestId === updatedMessage.requestId
		);
		if (messageToUpdateIndex) {
			const updatedMessages = [...state.messages];
			updatedMessages[messageToUpdateIndex] = updatedMessage;
			return { ...state, messages: updatedMessages, lastUpdatedMessage: updatedMessage };
		} else {
			return state;
		}
	});

	/**
	 * Updates a message feedback value.
	 *
	 * @memberof HarborPilotStore
	 */
	updateMessageFeedback = this.updater((state, updated: HarborPilotMessage): HarborPilotState => {
		state.messages.forEach((message, index) => {
			if (message.requestId === updated.requestId) {
				state.messages[index].feedback = updated.feedback;
			}
		});

		return { ...state };
	});

	/**
	 * Updates the tools being used in the chat
	 */
	setTools = this.updater((state, tool: Tools[]): HarborPilotState => {
		return { ...state, tools: tool };
	});

	/**
	 * Updates chat box overlay open state.
	 */
	setOpen = this.updater((state, isOpen: boolean): HarborPilotState => {
		return { ...state, isOpen };
	});

	/**
	 * Updates the feature enabled on system settings state.
	 */
	setFeatureEnabledOnSystemSettings = this.updater(
		(state, isFeatureEnabledOnSystemSettings: boolean): HarborPilotState => {
			return { ...state, isFeatureEnabledOnSystemSettings };
		}
	);

	//										//
	// ============= EFFECTS ==============	//
	//										//

	/**
	 * Saves the state to the session service.
	 */
	saveSessionState = this.effect(args$ =>
		args$.pipe(
			tap(() => {
				const currentState = this.get();
				this.browserStorageService.set('harbor-pilot-state', currentState);
			})
		)
	);

	/**
	 * Saves the state to the session service.
	 */
	setOpenState = this.effect((isOpen: Observable<boolean>) =>
		isOpen.pipe(
			tap((open: boolean) => {
				this.setOpen(open);
			})
		)
	);

	/**
	 * Effect to sends a message to the API and updates the messages in the store
	 */
	sendMessage = this.effect(
		(
			args$: Observable<{
				message: string;
				cancel?: boolean;
			}>
		) => {
			return args$.pipe(
				withLatestFrom(this.selectSessionId$, this.selectTools$, this.selectLastUpdatedMessage$),
				tap(([args]) => {
					// Handling cancelation returning a static response message to the bot last loading message.
					if (args.cancel) {
						const cancelation: HarborPilotMessage = new CreateHarborPilotMessageVM(
							MessageType.BOT,
							args.message,
							false
						);
						this.updateLastBotMessage(cancelation);
					} else {
						const userMessage: HarborPilotMessage = new CreateHarborPilotMessageVM(
							MessageType.USER,
							args.message
						);
						const botMessage: HarborPilotMessage = new CreateHarborPilotMessageVM(
							MessageType.BOT,
							null,
							true
						);
						this.addMessages([userMessage, botMessage]);
					}
				}),
				switchMap(([args, sessionId, tools]) => {
					// Handling cancelation returns a null observable and cancel the previous request.
					if (args.cancel) {
						return of(null);
					} else {
						const payload: HarborPilotAPIPayload = {
							userMsg: args.message,
							context: { tools: tools },
							sessionId: sessionId
						};
						return this.harborPilotMessagesService.postMessage(payload).pipe(
							tapResponse(
								(botResp: HarborPilotAPIResponse) => {
									// Update the last bot message with the /chat response,
									// handle null responses from the BE with an error message.
									if (botResp) {
										this.updateLastBotMessage(
											new CreateHarborPilotMessageVM(
												undefined,
												undefined,
												undefined,
												true,
												botResp
											)
										);
									} else {
										throwError(null);
									}
									// set session id state when a conversation starts.
									this.setSessionId(botResp.sessionId);
								},
								() => {
									this.updateLastBotMessage({
										id: 0,
										type: MessageType.BOT,
										message: this.translationService.instant(
											'CHATBOT.SOMETHING_WRONG_HAPPENED_TRY_AGAIN'
										)
									});
								}
							)
						);
					}
				})
			);
		}
	);

	/**
	 * Effect to send a command to the API and updates the messages in the store
	 */
	sendCommand = this.effect(
		(
			args$: Observable<{
				action: HarborPilotAction;
				prompt: string;
			}>
		) => {
			return args$.pipe(
				tap((args: { action: HarborPilotAction; prompt: string }) => {
					const userMessage: HarborPilotMessage = new CreateHarborPilotMessageVM(
						MessageType.USER,
						this.translationService.instant(args.prompt)
					);
					const botMessage: HarborPilotMessage = new CreateHarborPilotMessageVM(
						MessageType.BOT,
						undefined,
						true
					);
					// once selected clear command actions from the chat box.
					this.clearLastBotMessageCommandActions();
					// append the new user message and a loading state message for the bot action.
					this.addMessages([userMessage, botMessage]);
				}),
				withLatestFrom(this.selectSessionId$),
				exhaustMap(
					([args, sessionId]: [
						{
							action: HarborPilotAction;
							prompt: string;
						},
						string
					]) => {
						const payload: HarborPilotActionAPIPayload = {
							inResponseTo: {
								id: args.action.id,
								type: HarborPilotInResponseTypes.ACTION
							},
							action: {
								actor: ActorType.AGENT,
								actionType: args.action.actionType,
								data: args.action.data
							},
							sessionId
						};
						return this.harborPilotMessagesService.postAction(payload).pipe(
							tapResponse(
								(botResp: HarborPilotAPIResponse) => {
									const botMessage: HarborPilotMessage = {
										type: MessageType.BOT,
										message: botResp.sysMsg,
										requestId: botResp.requestId,
										sessionId: botResp.sessionId,
										actions: botResp.actions,
										loading: false
									};
									this.updateLastBotMessage(botMessage);
								},
								() => {
									this.updateLastBotMessage({
										id: 0,
										type: MessageType.BOT,
										message: this.translationService.instant(
											'CHATBOT.SOMETHING_WRONG_HAPPENED_TRY_AGAIN'
										)
									});
								}
							)
						);
					}
				)
			);
		}
	);

	/**
	 * Effect to start a conversation using the quick start prompts.
	 */
	startConversationFromPrompt = this.effect(($: Observable<{ message: string; tools: Tools[] }>) => {
		return $.pipe(
			tap((args: { message: string; tools: Tools[] }) => {
				// TODO: Remove HARBOR_PILOT_INTELLIGENT_TOOL feature flag check once the feature is enabled for all users.
				if (!this.featureFlagService.isEnabled(FeatureFlags.HARBOR_PILOT_INTELLIGENT_TOOL)) {
					// Set the tool context for the given quick start tile.
					this.setTools(args.tools);
				}

				this.sendMessage({ message: args.message });
			})
		);
	});

	/**
	 * Effect to start a new conversation
	 */
	startNewSession = this.effect($ => {
		return $.pipe(
			tap(() => {
				// cancel all pending messages prompts to the bot.
				this.sendMessage({ message: '', cancel: true });
				// clear the chat session state.
				this.setNewChatSession();
			})
		);
	});

	/**
	 * Effect to rate a Message.
	 */
	rateMessage = this.effect(($: Observable<{ message: HarborPilotMessage; feedback: HarborPilotMessageFeedback }>) =>
		$.pipe(
			withLatestFrom(this.selectSessionId$),
			exhaustMap(([arg, sessionId]) =>
				this.harborPilotMessagesService
					.rateMessage((arg.message as HarborPilotMessage).requestId, arg.feedback, sessionId)
					.pipe(
						tapResponse(
							() => {
								this.updateMessageFeedback({
									...arg.message,
									feedback: arg.feedback
								});
							},
							() => {}
						)
					)
			)
		)
	);

	/**
	 * Effect to post an Action.
	 *
	 * @memberof HarborPilotStore
	 */
	postAction = this.effect(($: Observable<{ action: HarborPilotAction }>) =>
		$.pipe(
			withLatestFrom(this.selectSessionId$),
			exhaustMap(([args, sessionId]) => {
				const payload: HarborPilotActionAPIPayload = {
					inResponseTo: {
						id: args.action.id,
						type: HarborPilotInResponseTypes.ACTION
					},
					action: {
						actor: args.action.actor,
						actionType: args.action.actionType,
						data: args.action.data
					},
					sessionId
				};
				return this.harborPilotMessagesService.postAction(payload);
			})
		)
	);

	constructor(
		private harborPilotMessagesService: HarborPilotMessagesService,
		private translationService: TranslateService,
		private browserStorageService: BrowserStorageService,
		private featureFlagService: FeatureFlagService
	) {
		super();
		this.setState(this.getInitialState());
		this.defaultMessage = this.translationService.instant('CHATBOT.NEXT_STEP');
	}

	/**
	 * On state init lifecycle hook	- Load the state from the session service
	 **/
	ngrxOnStateInit() {
		// Load the previous state from the browser storage.
		const unsubscribe$: Subject<void> = new Subject();
		this.browserStorageService
			.get('harbor-pilot-state')
			.pipe(takeUntil(unsubscribe$))
			.subscribe(state => {
				if (state) {
					this.loadState(state);
					// complete the unsubscribe subject after getting the state.
					unsubscribe$.next();
					unsubscribe$.complete();
				}
			});
		// On key state changes store the current state to the browser.
		merge(this.selectMessages$, this.selectIsOpen$)
			.pipe(
				takeUntil(this.destroy$),
				tap(() => this.saveSessionState())
			)
			.subscribe();
	}

	/**
	 * On destroy lifecycle hook - Clean up subscriptions and other resources.
	 */
	override ngOnDestroy(): void {
		// Call the super class ngOnDestroy method.
		super.ngOnDestroy();
		// Complete the destroy$ subject.
		this.destroy$.next();
		this.destroy$.complete();
	}

	/**
	 * Get the initial state of the store.
	 *
	 * @return HarborPilotState
	 */
	getInitialState(): HarborPilotState {
		return {
			messages: [],
			sessionId: null,
			showQuickStart: true,
			lastUpdatedMessage: null,
			isOpen: false,
			isFeatureEnabledOnSystemSettings: false,
			// initial tools would be defined based on HARBOR_PILOT_INTELLIGENT_TOOL feature flag.
			// TODO: Remove HARBOR_PILOT_INTELLIGENT_TOOL feature flag check once the feature is enabled for all users.
			tools: this.featureFlagService.isEnabled(FeatureFlags.HARBOR_PILOT_INTELLIGENT_TOOL)
				? []
				: [Tools.ACME_DOC]
		};
	}
}
