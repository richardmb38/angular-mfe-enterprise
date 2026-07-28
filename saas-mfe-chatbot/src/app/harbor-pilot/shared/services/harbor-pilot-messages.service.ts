/*
 * Copyright (C) 2024 Acme Technologies, Inc.  All rights reserved.
 */
import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

import { map, tap } from 'rxjs';

import { Counter, MetricService } from '@acme-priv/armada-angular/src/acme/angular/monitoring/metrics';
import { WindowRef } from '@acme-priv/armada-angular/src/acme/angular/util/window-ref';

import { ApiService, ApiVersion } from '@acme-priv/ui-common/src/acme/angular/api';

import { HarborPilotActionAPIPayload } from '../models/actions.model';
import { HarborPilotAPIPayload, HarborPilotAPIResponse, HarborPilotMessageFeedback } from '../models/messages.model';

/**
 * Harbor Pilot Messages Service
 */
@Injectable({
	providedIn: 'root'
})
export class HarborPilotMessagesService extends ApiService<HarborPilotAPIResponse> {
	/**
	 * The base URL for the API calls
	 */
	public static readonly baseURL = 'harbor-pilot';

	/**
	 * Track's metric counter for the send message http request.
	 *
	 * @type {Counter}
	 * @memberof HarborPilotMessagesService
	 */
	public sendMessageMetricsCounter: Counter;

	/**
	 * Track's metric counter for the rate message http request.
	 *
	 * @type {Counter}
	 * @memberof HarborPilotMessagesService
	 */
	public rateMessageMetricsCounter: Counter;

	/**
	 * Track's metric counter for the post action http request.
	 *
	 * @type {Counter}
	 * @memberof HarborPilotMessagesService
	 */
	public postActionMetricsCounter: Counter;

	constructor(
		httpClient: HttpClient,
		private metricsService: MetricService,
		private windowReferenceService: WindowRef
	) {
		super(ApiVersion.BETA, HarborPilotMessagesService.baseURL, httpClient);
		// Initialize metrics service counters.
		this.initializeMetricsCounters();
	}

	/**
	 * Sends a message to the Harbor Pilot chat
	 * @param {HarborPilotAPIPayload} payload - the API payload necessary to send a message
	 */
	postMessage(payload: HarborPilotAPIPayload) {
		// Set the URL location context from where this request was performed for BE telemetry purposes.
		payload.context.location = this.windowReferenceService.nativeWindow.location.href;
		// Set Pendo visitor ID for the request context.
		const pendo = this.windowReferenceService.nativeWindow?.pendo;
		if (pendo) {
			payload.context.pendoVisitorId = pendo.getVisitorId();
		}

		const requestOptions = {
			handleErrors: ['*'],
			replaceUrl: `${HarborPilotMessagesService.baseURL}/chat`
		};
		return super.request('POST', requestOptions, payload).pipe(
			tap(() => this.sendMessageMetricsCounter.increment()),
			map(response => response.body)
		);
	}

	/**
	 * Rates a message to the harbor pilot feedback endpoint
	 * @param {string} requestId - The request ID of the message being rated
	 * @param {HarborPilotMessageSentiment} sentiment - The rating sentiment
	 * @param {string} sessionId - the session IF of the message being rated
	 */
	rateMessage(requestId: string, feedback: HarborPilotMessageFeedback, sessionId: string) {
		const requestOptions = {
			handleErrors: ['*'],
			replaceUrl: `${HarborPilotMessagesService.baseURL}/feedback`
		};
		return super
			.request('PUT', requestOptions, {
				sessionId,
				requestId,
				feedback
			})
			.pipe(tap(() => this.rateMessageMetricsCounter.increment()));
	}

	/**
	 * Sends an API command to harbor pilot
	 * @param {HarborPilotActionAPIPayload} payload - the payload for sending an API command action
	 */
	postAction(payload: HarborPilotActionAPIPayload) {
		const requestOptions = {
			handleErrors: ['*'],
			replaceUrl: `${HarborPilotMessagesService.baseURL}/actions`
		};
		return super.request('POST', requestOptions, payload).pipe(
			tap(() => this.postActionMetricsCounter.increment()),
			map(response => response.body)
		);
	}

	/**
	 * Initialize metrics counters once the metric service becomes available,
	 */
	private initializeMetricsCounters() {
		this.sendMessageMetricsCounter = this.metricsService.createCounter({
			name: 'data-sp-pendo-chatbot-hp-action-send-message-request',
			help: 'User interacted with Harbor Pilot sending a message through the /chat endpoint',
			analytics: true
		});
		this.rateMessageMetricsCounter = this.metricsService.createCounter({
			name: 'data-sp-pendo-chatbot-hp-action-rate-message-request',
			help: 'User interacted with Harbor Pilot rating a message through the /feedback endpoint',
			analytics: true
		});
		this.postActionMetricsCounter = this.metricsService.createCounter({
			name: 'data-sp-pendo-chatbot-hp-action-post-action-request',
			help: 'User interacted with Harbor Pilot triggering an action through the /actions endpoint',
			analytics: true
		});
	}
}
