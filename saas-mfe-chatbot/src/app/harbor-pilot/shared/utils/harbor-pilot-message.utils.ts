/*
 * Copyright (C) 2024 Acme Technologies, Inc.  All rights reserved.
 */
import { HarborPilotAPIResponse, MessageType } from '../models/messages.model';

/**
 * Factory method to create new Harbor Pilot Messages View Model
 */
export function CreateHarborPilotMessageVM(
	messageType: MessageType,
	message?: string,
	loading = false,
	requestUserFeedback = false,
	botResp?: HarborPilotAPIResponse
) {
	this.id = botResp && !message ? 0 : 1;
	this.message = botResp ? botResp.sysMsg : message;
	this.type = botResp ? MessageType.BOT : messageType;
	this.loading = botResp ? false : loading;
	this.requestUserFeedback = requestUserFeedback;
	if (botResp) {
		this.actions = botResp.actions;
		this.requestId = botResp.requestId;
		this.sessionId = botResp.sessionId;
	}
}
