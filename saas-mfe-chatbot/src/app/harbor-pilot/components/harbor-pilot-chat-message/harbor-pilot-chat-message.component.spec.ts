/*
 * Copyright (C) 2024 Acme Technologies, Inc.  All rights reserved.
 */
import { CommonModule } from '@angular/common';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { ComponentFixture, TestBed, fakeAsync, flush } from '@angular/core/testing';

import { ButtonModule } from '@acme-priv/armada-angular/src/acme/angular/components/button';
import {
	IconDotsAnimatedModule,
	IconLighthouseModule,
	IconModule,
	IconThumbsDownModule,
	IconThumbsUpModule,
	InitialsIconModule
} from '@acme-priv/armada-angular/src/acme/angular/components/icons';
import { TranslateModule } from '@acme-priv/armada-angular/src/acme/angular/l10n/translation';

import { HarborPilotStore } from '../../harbor-pilot.store';
import { MessageSentimentType, MessageType } from '../../shared/models/messages.model';
import { HarborPilotChatMessageComponent } from './harbor-pilot-chat-message.component';
import { MarkdownModule } from 'ngx-markdown';

describe('HarborPilotChatMessageComponent', () => {
	let component: HarborPilotChatMessageComponent;
	let fixture: ComponentFixture<HarborPilotChatMessageComponent>;

	beforeEach(async () => {
		await TestBed.configureTestingModule({
			imports: [
				CommonModule,
				ButtonModule,
				IconLighthouseModule,
				IconThumbsUpModule,
				IconThumbsDownModule,
				IconDotsAnimatedModule,
				IconModule,
				InitialsIconModule,
				HttpClientTestingModule,
				TranslateModule.forRoot(),
				MarkdownModule.forRoot()
			],
			declarations: [HarborPilotChatMessageComponent],
			providers: [HarborPilotStore]
		}).compileComponents();
		fixture = TestBed.createComponent(HarborPilotChatMessageComponent);
		component = fixture.componentInstance;
		component.message = {
			message: 'Test message',
			type: MessageType.BOT,
			loading: false,
			requestUserFeedback: true
		};
		fixture.detectChanges();
	});

	it('should create', () => {
		expect(component).toBeTruthy();
	});

	describe('userFeedbackSubmitted', () => {
		it('should set sentiment, sentimentIconType to regular if positive (1) and emit userFeedbackSubmitted', fakeAsync(() => {
			jest.spyOn(component.userFeedbackSubmitted, 'emit');
			component.handleRating(MessageSentimentType.UP);
			expect(component.feedback).toEqual({ sentiment: MessageSentimentType.UP });
			expect(component.userFeedbackSubmitted.emit).toHaveBeenCalledWith({ sentiment: MessageSentimentType.UP });
			flush();
		}));

		it('should set sentiment, sentimentIconType to light if sentiment is negative (-1) and open the message feedback form overlay', fakeAsync(() => {
			jest.spyOn(component.userFeedbackSubmitted, 'emit');
			component.handleRating(MessageSentimentType.DOWN);
			expect(component.isUserFeedbackOverlayOpen).toBeTruthy();
			flush();
		}));
	});

	describe('handleActionClick', () => {
		it('should emit onActionClick with the action', () => {
			const mockAction = { message: 'Test', runAction: jest.fn() };
			jest.spyOn(component.onActionClick, 'emit');
			component.handleActionClick(mockAction);
			expect(component.onActionClick.emit).toHaveBeenCalledWith(mockAction);
		});
	});
});
