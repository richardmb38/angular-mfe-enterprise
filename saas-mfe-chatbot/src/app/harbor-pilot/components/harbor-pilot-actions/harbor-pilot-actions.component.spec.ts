/*
 * Copyright (C) 2024 Acme Technologies, Inc.  All rights reserved.
 */
import { CommonModule } from '@angular/common';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';

import {
	IconBadgeCheckSolidModule,
	IconBrainModule,
	IconLayerGroupModule,
	IconModule
} from '@acme-priv/armada-angular/src/acme/angular/components/icons';
import { TranslateModule } from '@acme-priv/armada-angular/src/acme/angular/l10n/translation';

import {
	AppShellNavigationService,
	AppShellUrlsService
} from '@acme-priv/ui-common/src/acme/angular/util/app-shell';

import { HarborPilotStore } from '../../harbor-pilot.store';
import { HarborPilotAction, HarborPilotActionTypes } from '../../shared/models/actions.model';
import { ActorType, HarborPilotCommandActionDef, MessageType } from '../../shared/models/messages.model';
import { HarborPilotChatMessageModule } from '../harbor-pilot-chat-message/harbor-pilot-chat-message.module';
import { HarborPilotActionsComponent } from './harbor-pilot-actions.component';

describe('HarborPilotActionsComponent', () => {
	let component: HarborPilotActionsComponent;
	let fixture: ComponentFixture<HarborPilotActionsComponent>;
	let appShellUrlsService: AppShellUrlsService;
	let appShellNavigationService: AppShellNavigationService;
	let harborPilotStore: HarborPilotStore;

	beforeEach(() => {
		TestBed.configureTestingModule({
			imports: [
				CommonModule,
				HarborPilotChatMessageModule,
				IconBadgeCheckSolidModule,
				IconBrainModule,
				IconLayerGroupModule,
				IconModule,
				TranslateModule.forRoot(),
				HttpClientTestingModule
			],
			declarations: [HarborPilotActionsComponent],
			providers: [HarborPilotStore]
		}).compileComponents();
		fixture = TestBed.createComponent(HarborPilotActionsComponent);
		component = fixture.componentInstance;
		component.message = {
			message: 'Test message',
			type: MessageType.BOT,
			loading: false,
			requestUserFeedback: true
		};
		appShellUrlsService = TestBed.inject(AppShellUrlsService);
		appShellNavigationService = TestBed.inject(AppShellNavigationService);
		harborPilotStore = TestBed.inject(HarborPilotStore);
		fixture.detectChanges();
		jest.spyOn(component.triggerAction, 'emit');
	});

	it('should create', () => {
		expect(component).toBeTruthy();
	});

	it('should set the recommendedActionsMessage', () => {
		expect(component.recommendedActionsMessage).toEqual({
			id: 1,
			message: 'CHATBOT.RECOMMENDED_ACTIONS',
			type: 'static',
			loading: false,
			requestUserFeedback: false
		});
	});

	describe('handleClick', () => {
		it('should run the action method runAction', () => {
			const spyActionFn = jest.fn();
			const mockActionDefinition = {
				name: HarborPilotActionTypes.CERT_VIEW,
				message: 'CHATBOT.PREVIEW_CAMPAIGN',
				iconConfig: { name: 'badgeCheckSolid' },
				runAction: spyActionFn
			} as HarborPilotCommandActionDef;
			const mockAction = {
				actionType: HarborPilotActionTypes.CERT_VIEW,
				actor: ActorType.AGENT,
				data: {}
			};
			component.handleActionClick(mockActionDefinition, mockAction);
			expect(spyActionFn).toHaveBeenCalled();
		});
	});

	describe('navigationActionsDefinitions', () => {
		let mockAction: HarborPilotAction;
		beforeEach(() => {
			jest.spyOn(component, 'handleNavigationAction').mockImplementation();
			mockAction = {
				actionType: HarborPilotActionTypes.CERT_VIEW,
				actor: ActorType.AGENT,
				data: {}
			};
		});

		it('should trigger the navigation when SEARCH_VIEW runAction is called', fakeAsync(() => {
			component.navigationActionsDefinitions[HarborPilotActionTypes.SEARCH_VIEW].runAction(mockAction);
			expect(component.handleNavigationAction).toHaveBeenCalled();
		}));

		it('should trigger the navigation when CERT_VIEW runAction is called', fakeAsync(() => {
			component.navigationActionsDefinitions[HarborPilotActionTypes.CERT_VIEW].runAction(mockAction);
			expect(component.handleNavigationAction).toHaveBeenCalled();
		}));

		it('should trigger the navigation when SEARCH_VIEW runAction is called', fakeAsync(() => {
			component.navigationActionsDefinitions[HarborPilotActionTypes.WORKFLOW_VIEW].runAction(mockAction);
			expect(component.handleNavigationAction).toHaveBeenCalled();
		}));

		it('should trigger the navigation when SEARCH_VIEW runAction is called', fakeAsync(() => {
			component.navigationActionsDefinitions[HarborPilotActionTypes.GENERAL_POLICY_VIEW].runAction(mockAction);
			expect(component.handleNavigationAction).toHaveBeenCalled();
		}));
	});

	describe('commandActionsDefinitions', () => {
		let mockAction: HarborPilotAction;
		beforeEach(() => {
			jest.spyOn(component, 'handleCommandAction').mockImplementation();
			mockAction = {
				actionType: HarborPilotActionTypes.CERT_CREATE,
				actor: ActorType.AGENT,
				data: {}
			};
		});
		it('should trigger the command method when CERT_CREATE runAction is called', fakeAsync(() => {
			component.commandActionsDefinitions[HarborPilotActionTypes.CERT_CREATE].runAction(mockAction);
			expect(component.handleCommandAction).toHaveBeenCalled();
		}));
		it('should trigger the command method when CERT_CREATE_RUN runAction is called', fakeAsync(() => {
			component.commandActionsDefinitions[HarborPilotActionTypes.CERT_CREATE_RUN].runAction(mockAction);
			expect(component.handleCommandAction).toHaveBeenCalled();
		}));
		it('should trigger the command method when GENERAL_POLICY_CREATE runAction is called', fakeAsync(() => {
			component.commandActionsDefinitions[HarborPilotActionTypes.GENERAL_POLICY_CREATE].runAction(mockAction);
			expect(component.handleCommandAction).toHaveBeenCalled();
		}));
		it('should trigger the command method when WORKFLOW_CREATE runAction is called', fakeAsync(() => {
			component.commandActionsDefinitions[HarborPilotActionTypes.WORKFLOW_CREATE].runAction(mockAction);
			expect(component.handleCommandAction).toHaveBeenCalled();
		}));
	});

	describe('handleNavigationAction', () => {
		it('should navigate to the right url', fakeAsync(() => {
			const mockAction = {
				actionType: HarborPilotActionTypes.CERT_CREATE,
				actor: ActorType.AGENT,
				data: {}
			};
			jest.spyOn(appShellUrlsService, 'findUrlById').mockReturnValueOnce(
				Promise.resolve({ id: 'testId', absoluteUrl: 'urlTest' })
			);
			jest.spyOn(appShellNavigationService, 'navigateToUrl').mockReturnValueOnce(Promise.resolve());
			jest.spyOn(harborPilotStore, 'postAction');

			component.handleNavigationAction(mockAction, 'testId', '?param');
			tick();
			expect(harborPilotStore.postAction).toHaveBeenCalledWith({
				action: mockAction
			});
			expect(appShellNavigationService.navigateToUrl).toHaveBeenCalledWith('urlTest?param');
		}));
	});

	describe('handleCommandAction', () => {
		it('should emit triggerAction with the correct arguments', () => {
			jest.spyOn(harborPilotStore, 'sendCommand');
			const mockAction = {
				actionType: HarborPilotActionTypes.CERT_VIEW,
				actor: ActorType.AGENT,
				data: { query: 'foo:query', indices: [], id: '123' }
			};

			component.handleCommandAction(mockAction, 'message');
			expect(harborPilotStore.sendCommand).toHaveBeenCalledWith({
				action: mockAction,
				prompt: 'message'
			});
		});
	});
});
