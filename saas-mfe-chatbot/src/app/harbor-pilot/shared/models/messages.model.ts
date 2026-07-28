/*
 * Copyright (C) 2024 Acme Technologies, Inc.  All rights reserved.
 */
import { HarborPilotAction, HarborPilotActionTypes } from './actions.model';
import { Tools } from './suggestions.model';

export interface HarborPilotMessage {
	id?: number;
	message: string;
	type: MessageType;
	requestId?: string;
	sessionId?: string;
	feedback?: HarborPilotMessageFeedback;
	navigationActions?: HarborPilotAction[];
	commandActions?: HarborPilotAction[];
	actions?: HarborPilotAction[];
	loading?: boolean;
	/**
	 * Flag to evaluate if we will run the scroll into this message behavior on the chatbox.
	 */
	skipScrollTo?: boolean;
	/**
	 * Flag to evaluate if we will show a feedback form for this message to the user.
	 */
	requestUserFeedback?: boolean;
}

export interface HarborPilotNavigationActionDef {
	name: HarborPilotActionTypes;
	action: HarborPilotAction;
	message: string;
	runAction: (action: HarborPilotAction) => void;
}

export interface HarborPilotCommandActionDef {
	name: HarborPilotActionTypes;
	message: string;
	iconConfig: { name: string };
	runAction: (action: HarborPilotAction) => void;
}

export interface HarborPilotAPIResponse {
	sysMsg: string;
	sessionId: string;
	requestId: string;
	actions: HarborPilotAction[];
}

export interface HarborPilotAPIPayload {
	userMsg: string;
	sessionId: string;
	context: {
		tools: Tools[];
		location?: string;
		pendoVisitorId?: string;
	};
}

export interface HarborPilotAPIResponseData {
	query?: string;
	indices?: string[];
	id?: string;
}

/**
 * Message feedback payload model.
 */
export interface HarborPilotMessageFeedback {
	sentiment: MessageSentimentType;
	comment?: string;
}

export enum ActorType {
	USER = 'user',
	AGENT = 'agent'
}

export enum MessageType {
	USER = 'user',
	BOT = 'bot',
	STATIC = 'static'
}

/**
 * Enum collection for the sentiment icon fill,
 * used to represent its voted/unvoted state.
 */
export enum SentimentIconTypes {
	LIGHT = 'light',
	REGULAR = 'regular'
}

/**
 * Enum collection of message sentiments types, represents an
 * up or down vote for how usefull are our AI generated responses.
 */
export enum MessageSentimentType {
	UP = 1,
	DOWN = -1
}
