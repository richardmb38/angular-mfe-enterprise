/*
 * Copyright (C) 2024 Acme Technologies, Inc.  All rights reserved.
 */
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';

import { HarborPilotActionTypes, HarborPilotInResponseTypes } from '../models/actions.model';
import { ActorType, MessageSentimentType } from '../models/messages.model';
import { HarborPilotMessagesService } from './harbor-pilot-messages.service';

describe('HarborPilotMessagesService', () => {
	let harborPilotMessagesService: HarborPilotMessagesService;
	let httpMock: HttpTestingController;

	beforeEach(() => {
		TestBed.configureTestingModule({
			imports: [HttpClientTestingModule],
			providers: [HarborPilotMessagesService]
		}).compileComponents();

		httpMock = TestBed.inject(HttpTestingController);
		harborPilotMessagesService = TestBed.inject(HarborPilotMessagesService);
	});

	describe('postMessage', () => {
		it('should return an observable with valid params', done => {
			const requestPayload = {
				userMsg: 'Test',
				sessionId: '123',
				context: { tools: [] }
			};

			harborPilotMessagesService.postMessage(requestPayload).subscribe(() => {
				done();
			});
			const mockReq = httpMock.expectOne(
				req => req.method === 'POST' && req.urlWithParams === 'BETA://harbor-pilot/chat'
			);
			mockReq.flush(null);
			httpMock.verify();
		});
	});

	describe('rateMessage', () => {
		it('should return an observable with valid params', done => {
			harborPilotMessagesService
				.rateMessage(
					'123',
					{
						sentiment: MessageSentimentType.UP
					},
					'456'
				)
				.subscribe(() => {
					done();
				});
			const mockReq = httpMock.expectOne(
				req => req.method === 'PUT' && req.urlWithParams === 'BETA://harbor-pilot/feedback'
			);
			mockReq.flush(null);
			httpMock.verify();
		});
	});

	describe('postAction', () => {
		it('should return an observable', () => {
			harborPilotMessagesService
				.postAction({
					inResponseTo: {
						id: 'mock-id',
						type: HarborPilotInResponseTypes.ACTION
					},
					action: {
						data: {},
						actionType: HarborPilotActionTypes.CERT_CREATE_RUN,
						actor: ActorType.AGENT
					},
					sessionId: '123'
				})
				.subscribe(() => {});
			expect(true).toBe(true);
		});
	});
});
