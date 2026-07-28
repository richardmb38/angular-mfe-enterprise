/*
 * Copyright (C) 2024 Acme Technologies, Inc.  All rights reserved.
 */
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { TestBed, fakeAsync, flush } from '@angular/core/testing';

import { combineLatest, of } from 'rxjs';

import { TranslateModule } from '@acme-priv/armada-angular/src/acme/angular/l10n/translation';
import { BrowserStorageService } from '@acme-priv/armada-angular/src/acme/angular/security/session';

import { HarborPilotState, HarborPilotStore } from './harbor-pilot.store';
import { HarborPilotActionTypes } from './shared/models/actions.model';
import { ActorType, HarborPilotMessage, MessageSentimentType, MessageType } from './shared/models/messages.model';
import { Tools } from './shared/models/suggestions.model';
import { HarborPilotMessagesService } from './shared/services/harbor-pilot-messages.service';

describe('HarborPilotStore', () => {
	let harborPilotStore: HarborPilotStore;
	let httpMock: HttpTestingController;
	let harborPilotMessagesService: HarborPilotMessagesService;

	beforeEach(() => {
		TestBed.configureTestingModule({
			imports: [HttpClientTestingModule, TranslateModule.forRoot()],
			providers: [
				HarborPilotStore,
				{
					provide: BrowserStorageService,
					useValue: {
						get: () =>
							of({
								...harborPilotStore.getInitialState(),
								messages: [
									{ id: 1, message: 'Test', type: 'user', loading: false, requestUserFeedback: false }
								]
							}),
						set: () => of(null)
					}
				}
			]
		});
		harborPilotStore = TestBed.inject(HarborPilotStore);
		httpMock = TestBed.inject(HttpTestingController);
		harborPilotMessagesService = TestBed.inject(HarborPilotMessagesService);
	});

	afterEach(() => {
		httpMock.verify();
	});

	describe('SELECTORS', () => {
		describe('selectTools$', () => {
			it('should select the tools', fakeAsync(() => {
				harborPilotStore.setState({ tools: [] } as unknown as HarborPilotState);

				harborPilotStore.selectTools$.subscribe(tools => {
					expect(tools).toEqual([]);
				});
				flush();
			}));
		});

		describe('selectMessages$', () => {
			it('should select the messages', fakeAsync(() => {
				harborPilotStore.setState({
					messages: [
						{
							id: 1,
							message: 'Test',
							type: 'user',
							loading: false,
							requestUserFeedback: false
						}
					]
				} as HarborPilotState);

				harborPilotStore.selectMessages$.subscribe(messages => {
					expect(messages).toEqual([
						{
							id: 1,
							message: 'Test',
							type: 'user',
							loading: false,
							requestUserFeedback: false
						}
					]);
				});
				flush();
			}));
		});

		describe('selectSessionId$', () => {
			it('should select the session id', fakeAsync(() => {
				harborPilotStore.setState({ sessionId: '123' } as HarborPilotState);

				harborPilotStore.selectSessionId$.subscribe(sessionId => {
					expect(sessionId).toEqual('123');
				});
				flush();
			}));
		});
	});

	describe('UPDATERS', () => {
		describe('setSessionId', () => {
			it('should update the session id', fakeAsync(() => {
				harborPilotStore.setSessionId('123');
				harborPilotStore.selectSessionId$.subscribe(sessionId => {
					expect(sessionId).toEqual('123');
				});
				flush();
			}));
		});

		describe('setNewChatSession', () => {
			it('should clear the chat session', fakeAsync(() => {
				harborPilotStore.setState({
					sessionId: '123',
					messages: [
						{
							id: 1,
							message: 'Test',
							type: 'user',
							loading: false,
							requestUserFeedback: false
						}
					]
				} as HarborPilotState);
				harborPilotStore.setNewChatSession();
				combineLatest([harborPilotStore.selectSessionId$, harborPilotStore.selectMessages$]).subscribe(
					([sessionId, messages]) => {
						expect(sessionId).toEqual(null);
						expect(messages).toEqual([]);
					}
				);
				flush();
			}));
		});

		describe('addMessages', () => {
			it('should add messages', fakeAsync(() => {
				const message = {
					id: 1,
					message: 'Test',
					type: 'user',
					loading: false,
					requestUserFeedback: false
				} as HarborPilotMessage;
				harborPilotStore.addMessages([message]);
				harborPilotStore.selectMessages$.subscribe(messages => {
					expect(messages).toEqual([message]);
				});
				flush();
			}));
		});

		describe('updateLastBotMessage', () => {
			it('should update the last bot message', fakeAsync(() => {
				const userMessage = {
					id: 1,
					message: 'Test',
					type: 'user',
					loading: false,
					requestUserFeedback: false
				} as HarborPilotMessage;

				const botMessage = {
					id: 0,
					message: 'Bot Resp',
					type: 'bot',
					loading: false,
					requestUserFeedback: false,
					actions: [
						{ actionType: HarborPilotActionTypes.WORKFLOW_VIEW, actor: ActorType.USER },
						{ actionType: HarborPilotActionTypes.WORKFLOW_VIEW, actor: ActorType.AGENT }
					]
				} as HarborPilotMessage;

				harborPilotStore.addMessages([userMessage, botMessage]);
				harborPilotStore.updateLastBotMessage(botMessage);
				harborPilotStore.selectMessages$.subscribe(messages => {
					expect(messages[1].commandActions).toEqual([
						{ actionType: HarborPilotActionTypes.WORKFLOW_VIEW, actor: ActorType.AGENT }
					]);
					expect(messages[1].navigationActions).toEqual([
						{ actionType: HarborPilotActionTypes.WORKFLOW_VIEW, actor: ActorType.USER }
					]);
				});
				flush();
			}));
		});

		describe('clearLastBotMessageCommandActions', () => {
			it('should clear the command actions of the last bot message', fakeAsync(() => {
				const userMessage = {
					id: 1,
					message: 'Test',
					type: 'user',
					loading: false,
					requestUserFeedback: false
				} as HarborPilotMessage;

				const botMessage = {
					id: 0,
					message: 'Bot Resp',
					type: 'bot',
					loading: false,
					requestUserFeedback: false,
					actions: [
						{ actionType: HarborPilotActionTypes.WORKFLOW_VIEW, actor: ActorType.USER },
						{ actionType: HarborPilotActionTypes.WORKFLOW_VIEW, actor: ActorType.AGENT }
					]
				} as HarborPilotMessage;

				harborPilotStore.addMessages([userMessage, botMessage]);
				harborPilotStore.updateLastBotMessage(botMessage);
				harborPilotStore.clearLastBotMessageCommandActions();
				harborPilotStore.selectMessages$.subscribe(messages => {
					expect(messages[1].commandActions).toEqual([]);
					expect(messages[1].navigationActions).toEqual([
						{ actionType: HarborPilotActionTypes.WORKFLOW_VIEW, actor: ActorType.USER }
					]);
				});
				flush();
			}));
		});

		describe('setTools', () => {
			it('should update the tooles', fakeAsync(() => {
				harborPilotStore.setTools([Tools.ACME_DOC]);
				harborPilotStore.selectTools$.subscribe(tools => {
					expect(tools).toEqual([Tools.ACME_DOC]);
				});
				flush();
			}));
		});
	});

	describe('EFFECTS', () => {
		describe('sendMessage', () => {
			it('should update the state and call the harbor pilot endpoint', fakeAsync(() => {
				const message = 'Hello World';
				const expectedUserMessage = {
					id: 1,
					message,
					type: 'user',
					loading: false,
					requestUserFeedback: false
				};
				const expectedBotMessage = {
					sessionId: '123',
					requestId: '456',
					id: 0,
					type: 'bot',
					message: 'API Response',
					loading: false,
					requestUserFeedback: true,
					actions: [
						{ actionType: HarborPilotActionTypes.WORKFLOW_VIEW, actor: ActorType.USER },
						{ actionType: HarborPilotActionTypes.WORKFLOW_VIEW, actor: ActorType.AGENT }
					],
					navigationActions: [{ actionType: HarborPilotActionTypes.WORKFLOW_VIEW, actor: ActorType.USER }],
					commandActions: [{ actionType: HarborPilotActionTypes.WORKFLOW_VIEW, actor: ActorType.AGENT }]
				};
				jest.spyOn(harborPilotMessagesService, 'postMessage').mockReturnValue(
					of({
						sysMsg: 'API Response',
						sessionId: '123',
						requestId: '456',
						actions: [
							{ actionType: HarborPilotActionTypes.WORKFLOW_VIEW, actor: ActorType.USER },
							{ actionType: HarborPilotActionTypes.WORKFLOW_VIEW, actor: ActorType.AGENT }
						]
					})
				);
				harborPilotStore.sendMessage({
					message,
					cancel: false
				});

				harborPilotStore.selectMessages$.subscribe(messages => {
					expect(messages[0]).toEqual(expectedUserMessage);
					expect(messages[1]).toEqual(expectedBotMessage);
				});
				flush();
			}));
		});

		describe('sendCommand', () => {
			// @TODO update this test once the right API call has been wired up
			it('should add the command message to the messages array', fakeAsync(() => {
				const message = 'CHATBOT.TOOLS.ACME_DOC.USER_PROMPT';
				const expectedMessage = 'API Response';

				jest.spyOn(harborPilotMessagesService, 'postMessage').mockReturnValue(
					of({
						sysMsg: expectedMessage,
						sessionId: '123',
						requestId: '456',
						actions: []
					})
				);
				harborPilotStore.setTools([Tools.ACME_DOC]);
				harborPilotStore.sendMessage({
					message,
					cancel: false
				});

				harborPilotStore.selectMessages$.subscribe(messages => {
					expect(messages[1].message).toStrictEqual(expectedMessage);
				});
				flush();
			}));
		});

		describe('startConversationFromPrompt', () => {
			it('should update the tools state to a the match the selected tile', fakeAsync(() => {
				jest.spyOn(harborPilotMessagesService, 'postMessage').mockReturnValue(
					of({
						sysMsg: 'API Response',
						sessionId: '123',
						requestId: '456',
						actions: []
					})
				);
				harborPilotStore.startConversationFromPrompt(
					of({
						id: 'a-mock-tile',
						message: 'Hello World',
						iconName: 'testIcon',
						prompt: 'testPrompt',
						tools: [Tools.ACME_DOC]
					})
				);
				harborPilotStore.selectTools$.subscribe(tools => {
					expect(tools).toEqual([Tools.ACME_DOC]);
				});

				flush();
			}));

			it('should call sendMessage if conversation started from a prompt', fakeAsync(() => {
				jest.spyOn(harborPilotMessagesService, 'postMessage').mockReturnValue(
					of({
						sysMsg: 'API Response',
						sessionId: '123',
						requestId: '456',
						actions: []
					})
				);
				harborPilotStore.startConversationFromPrompt(
					of({
						id: Tools.ADMIN_SEARCH,
						title: 'CHATBOT.TOOLS.ADMIN_SEARCH.TITLE',
						message: 'CHATBOT.TOOLS.ADMIN_SEARCH.USER_PROMPT',
						prompt: 'CHATBOT.TOOLS.ADMIN_SEARCH.BOT_PROMPT',
						tools: [Tools.ADMIN_SEARCH],
						iconName: 'telescope'
					})
				);
				harborPilotStore.selectTools$.subscribe(tools => {
					expect(tools).toEqual([Tools.ADMIN_SEARCH]);
					expect(harborPilotMessagesService.postMessage).toHaveBeenCalled();
					harborPilotStore.selectMessages$.subscribe(messages => {
						expect(messages[0]).toEqual({
							id: 1,
							loading: false,
							message: 'CHATBOT.TOOLS.ADMIN_SEARCH.USER_PROMPT',
							requestUserFeedback: false,
							type: 'user'
						});
						expect(messages[1]).toEqual({
							id: 0,
							message: 'API Response',
							type: 'bot',
							loading: false,
							requestUserFeedback: true,
							actions: [],
							requestId: '456',
							sessionId: '123',
							commandActions: [],
							navigationActions: []
						});
					});
				});

				flush();
			}));
		});

		describe('startNewSession', () => {
			it('should clear the chat session', () => {
				harborPilotStore.startNewSession();
				combineLatest([harborPilotStore.selectMessages$, harborPilotStore.selectSessionId$]).subscribe(
					([messages, sessionId]) => {
						expect(messages).toEqual([]);
						expect(sessionId).toEqual('');
					}
				);
			});
		});

		describe('rateMessage', () => {
			it('should call the service to submit the rating', fakeAsync(() => {
				harborPilotStore.setSessionId('123');
				jest.spyOn(harborPilotMessagesService, 'rateMessage');
				harborPilotStore.rateMessage(
					of({
						message: {
							sessionId: '123',
							message: 'CHATBOT.TOOLS.ADMIN_SEARCH.USER_PROMPT',
							requestId: '456',
							type: MessageType.BOT
						},
						feedback: {
							sentiment: MessageSentimentType.DOWN
						}
					})
				);
				expect(harborPilotMessagesService.rateMessage).toHaveBeenCalledWith(
					'456',
					{
						sentiment: MessageSentimentType.DOWN
					},
					'123'
				);
				const mock = httpMock.expectOne(
					req => req.method === 'PUT' && req.urlWithParams === 'BETA://harbor-pilot/feedback'
				);
				mock.flush(null);
			}));
		});

		describe('updateMessageFeedback', () => {
			it('should trigger an update in a message feedback value state', () => {
				const REQUEST_ID = '456';
				harborPilotStore.updateMessageFeedback({
					sessionId: '123',
					message: 'CHATBOT.TOOLS.ADMIN_SEARCH.USER_PROMPT',
					requestId: REQUEST_ID,
					type: MessageType.BOT,
					feedback: {
						sentiment: MessageSentimentType.UP,
						comment: 'Lorem ipsum'
					}
				});
				harborPilotStore.selectMessages$.subscribe(messages => {
					const updated = messages.find(m => m.requestId === REQUEST_ID) ?? { feedback: null };
					expect(updated.feedback).toEqual({
						sentiment: MessageSentimentType.UP,
						comment: 'Lorem ipsum'
					});
				});
			});
		});

		describe('ngrxOnStateInit', () => {
			it('should be able to initialize state from browser storage', fakeAsync(() => {
				harborPilotStore.ngrxOnStateInit();
				harborPilotStore.selectMessages$.subscribe(messages => {
					expect(messages).toEqual([
						{
							id: 1,
							message: 'Test',
							type: 'user',
							loading: false,
							requestUserFeedback: false
						}
					]);
				});
				flush();
			}));

			it('should set state to browser storage upon select messages or open states', fakeAsync(() => {
				jest.spyOn(harborPilotStore, 'saveSessionState');

				harborPilotStore.ngrxOnStateInit();
				harborPilotStore.addMessages([
					{
						id: 1,
						message: 'A New Message was Added',
						type: MessageType.BOT,
						loading: false,
						requestUserFeedback: false
					}
				]);
				harborPilotStore.selectMessages$.subscribe(messages => {
					expect(messages.pop()).toEqual({
						id: 1,
						message: 'A New Message was Added',
						type: MessageType.BOT,
						loading: false,
						requestUserFeedback: false
					});
				});

				flush();
				expect(harborPilotStore.saveSessionState).toHaveBeenCalled();
			}));
		});
	});
});
