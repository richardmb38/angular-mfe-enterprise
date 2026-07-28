/*
 * Copyright (C) 2024 Acme Technologies, Inc.  All rights reserved.
 */
import { CommonModule } from '@angular/common';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';

import { ButtonModule } from '@acme-priv/armada-angular/src/acme/angular/components/button';
import { TextAreaInputModule } from '@acme-priv/armada-angular/src/acme/angular/components/form';
import {
	IconBroomModule,
	IconCloseModule,
	IconCollapseWindowModule,
	IconEditModule,
	IconExpandWindowModule,
	IconModule
} from '@acme-priv/armada-angular/src/acme/angular/components/icons';
import { TooltipModule } from '@acme-priv/armada-angular/src/acme/angular/components/tooltip';
import { TranslateModule } from '@acme-priv/armada-angular/src/acme/angular/l10n/translation';

import { AppShellWrapperService } from '@acme-priv/ui-common/src/acme/angular/util/app-shell';

import { HarborPilotStore } from '../../harbor-pilot.store';
import { MessageSentimentType, MessageType } from '../../shared/models/messages.model';
import { HarborPilotMessagesService } from '../../shared/services/harbor-pilot-messages.service';
import { HarborPilotOverlayComponent } from './harbor-pilot-overlay.component';
import { MarkdownModule, MarkdownService } from 'ngx-markdown';

describe('HarborPilotOverlayComponent', () => {
	let component: HarborPilotOverlayComponent;
	let fixture: ComponentFixture<HarborPilotOverlayComponent>;
	let messageService: HarborPilotMessagesService;

	beforeEach(waitForAsync(() => {
		TestBed.configureTestingModule({
			imports: [
				ButtonModule,
				CommonModule,
				IconEditModule,
				IconCloseModule,
				IconCollapseWindowModule,
				IconExpandWindowModule,
				IconBroomModule,
				IconModule,
				TooltipModule,
				TranslateModule.forRoot(),
				TextAreaInputModule,
				MarkdownModule,
				NoopAnimationsModule,
				HttpClientTestingModule
			],
			declarations: [HarborPilotOverlayComponent],
			providers: [
				HarborPilotStore,
				MarkdownService,
				{
					provide: AppShellWrapperService,
					useValue: {
						getUserContextV1: () => ({
							displayName: 'Test User'
						})
					}
				}
			],
			schemas: [CUSTOM_ELEMENTS_SCHEMA]
		}).compileComponents();
	}));

	beforeEach(() => {
		messageService = TestBed.inject(HarborPilotMessagesService);

		fixture = TestBed.createComponent(HarborPilotOverlayComponent);
		component = fixture.componentInstance;
		fixture.detectChanges();

		component.messagesContainer = {
			nativeElement: {
				scrollTo: (top, behavior) => false
			}
		};
	});

	it('should create', () => {
		expect(component).toBeTruthy();
	});

	it('should have initial values set', () => {
		expect(component.open()).toBe(false);
		expect(component.isAutoScrollDisabled()).toBe(false);
		expect(component.expanded()).toBe(false);
	});

	describe('ngAfterViewInit', () => {
		it('should set showQuickStartTiles false if isAutoScrollDisabled is false and open is true', () => {
			component.messages.set([
				{
					message: 'Test message',
					type: MessageType.USER,
					loading: true,
					requestUserFeedback: true
				}
			]);
			component.isAutoScrollDisabled.set(false);
			component.ngAfterViewInit();
		});

		it('should set showQuickStartTiles true if isAutoScrollDisabled is true and open is false and there is no message', () => {
			component.messages.set([
				{
					message: '',
					type: MessageType.USER,
					loading: true,
					requestUserFeedback: true
				}
			]);
			component.isAutoScrollDisabled.set(true);
			component.ngAfterViewInit();
		});
	});

	describe('onUserFeedbackSubmitted', () => {
		it('should call the rate message in message service', () => {
			jest.spyOn(messageService, 'rateMessage');
			component.onUserFeedbackSubmitted(
				{ message: '', requestId: 'testId', type: MessageType.BOT },
				{ sentiment: MessageSentimentType.UP }
			);
			expect(messageService.rateMessage).toHaveBeenCalledWith(
				'testId',
				{ sentiment: MessageSentimentType.UP },
				null
			);
		});
	});

	describe('onScroll', () => {
		it('should set isAutoScrollDisabled to true if scrollTop has value and scroll container is not at bottom', () => {
			component.onScroll({ scrollTop: 10, scrollHeight: 10, offsetHeight: 0 } as never);
			expect(component.isAutoScrollDisabled()).toBe(false);

			component.onScroll({ scrollTop: null, scrollHeight: 10, offsetHeight: 5 } as never);
			expect(component.isAutoScrollDisabled()).toBe(false);

			component.onScroll({ scrollTop: 10, scrollHeight: 10, offsetHeight: 5 } as never);
			expect(component.isAutoScrollDisabled()).toBe(true);
		});
	});
});
