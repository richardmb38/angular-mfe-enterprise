/*
 * Copyright (C) 2024 Acme Technologies, Inc.  All rights reserved.
 */
import { MessageType } from '../models/messages.model';
import { CreateHarborPilotMessageVM } from './harbor-pilot-message.utils';

describe('CreateHarborPilotMessageVM', () => {
	it('should exist and be a function', () => {
		expect(CreateHarborPilotMessageVM).toBeInstanceOf(Function);
	});

	it('should return a new message with the passed in arg', () => {
		const newMessage = new CreateHarborPilotMessageVM(MessageType.USER, 'test message', false, false);
		const expectedMessage = {
			id: 1,
			loading: false,
			message: 'test message',
			requestUserFeedback: false,
			type: 'user'
		};
		expect(newMessage).toEqual(expectedMessage);
	});

	it('should return a new message with the botResponse data if provided', () => {
		const botResponseData = {
			sysMsg: 'Test Api Resp',
			sessionId: '132',
			requestId: '786',
			actions: []
		};
		const expectedMessage = {
			actions: [],
			id: 0,
			loading: false,
			message: 'Test Api Resp',
			requestId: '786',
			sessionId: '132',
			requestUserFeedback: false,
			type: 'bot'
		};
		const newMessage = new CreateHarborPilotMessageVM(undefined, undefined, false, false, botResponseData);
		expect(newMessage).toEqual(expectedMessage);
	});
});
