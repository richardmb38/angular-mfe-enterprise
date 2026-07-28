/*
 * Copyright (C) 2024 Acme Technologies, Inc.  All rights reserved.
 */
import { Component, EventEmitter, Input, Output } from '@angular/core';

import { TranslateService } from '@acme-priv/armada-angular/src/acme/angular/l10n/translation';
import { SessionService } from '@acme-priv/armada-angular/src/acme/angular/security/session';

import {
	AppShellNavigationService,
	AppShellUrlsService,
	URLSet
} from '@acme-priv/ui-common/src/acme/angular/util/app-shell';

import { CreateHarborPilotMessageVM } from '../../shared/utils/harbor-pilot-message.utils';
import { HarborPilotStore } from 'app/harbor-pilot/harbor-pilot.store';
import {
	HarborPilotAction,
	HarborPilotActionTypes,
	SEARCH_QUERY_STORAGE_KEY
} from 'app/harbor-pilot/shared/models/actions.model';
import {
	HarborPilotCommandActionDef,
	HarborPilotMessage,
	HarborPilotNavigationActionDef,
	MessageType
} from 'app/harbor-pilot/shared/models/messages.model';

@Component({
	selector: 'app-harbor-pilot-actions',
	templateUrl: './harbor-pilot-actions.component.html',
	styleUrls: ['./harbor-pilot-actions.component.scss']
})
export class HarborPilotActionsComponent {
	/**
	 * The message to be displayed
	 */
	@Input() message: HarborPilotMessage;

	/**
	 * The trigger action clicked on
	 */
	@Output() triggerAction = new EventEmitter();

	/**
	 * The message to be displayed for recommended actions
	 */
	readonly recommendedActionsMessage: HarborPilotMessage;

	/**
	 * The navigation actions messages and action methods
	 */
	navigationActionsDefinitions = {
		[HarborPilotActionTypes.SEARCH_VIEW]: {
			name: HarborPilotActionTypes.SEARCH_VIEW,
			message: 'CHATBOT.VIEW_SEARCH_RESULTS_HERE',
			runAction: (action: HarborPilotAction) => {
				this.sessionService.set(SEARCH_QUERY_STORAGE_KEY, action.data?.query, { forceRefresh: true });
				this.handleNavigationAction(action, 'slpt-nav-search', `?local=true&refresh=${Date.now()}`);
			}
		} as HarborPilotNavigationActionDef,
		[HarborPilotActionTypes.CERT_VIEW]: {
			name: HarborPilotActionTypes.CERT_VIEW,
			message: 'CHATBOT.YOU_CAN_VIEW_THE_CAMPAIGN_HERE',
			runAction: (action: HarborPilotAction) =>
				this.handleNavigationAction(action, 'slpt-nav-admin-cert', `/all-gov-campaigns/${action.data?.id}`)
		} as HarborPilotNavigationActionDef,
		[HarborPilotActionTypes.WORKFLOW_VIEW]: {
			name: HarborPilotActionTypes.WORKFLOW_VIEW,
			message: 'CHATBOT.VIEW_WORKFLOW_HERE',
			runAction: (action: HarborPilotAction) =>
				this.handleNavigationAction(action, 'slpt-nav-admin-workflows', `/edit/${action.data?.id}`)
		} as HarborPilotNavigationActionDef,
		[HarborPilotActionTypes.GENERAL_POLICY_VIEW]: {
			name: HarborPilotActionTypes.GENERAL_POLICY_VIEW,
			message: 'CHATBOT.VIEW_GENERAL_POLICY_HERE',
			runAction: (action: HarborPilotAction) =>
				this.handleNavigationAction(action, 'slpt-nav-search', `policies/landing/${action.data?.id}/view`)
		} as HarborPilotNavigationActionDef,
		[HarborPilotActionTypes.WORKFLOWS_LANDING_PAGE]: {
			name: HarborPilotActionTypes.WORKFLOWS_LANDING_PAGE,
			message: 'CHATBOT.CREATE_A_NEW_WORKFLOW_IN_THE_WORKFLOWS_PAGE',
			runAction: (action: HarborPilotAction) =>
				this.handleNavigationAction(
					action,
					'slpt-nav-admin-workflows',
					this.navigationActionsDefinitions[HarborPilotActionTypes.GENERAL_POLICY_VIEW].message
				)
		} as HarborPilotNavigationActionDef
	};

	/**
	 * The command actions messages, iconConfig and action methods
	 */
	commandActionsDefinitions = {
		[HarborPilotActionTypes.CERT_CREATE]: {
			name: HarborPilotActionTypes.CERT_CREATE,
			message: 'CHATBOT.PREVIEW_CAMPAIGN',
			iconConfig: { name: 'badgeCheckSolid' },
			runAction: (action: HarborPilotAction) =>
				this.handleCommandAction(
					action,
					this.commandActionsDefinitions[HarborPilotActionTypes.CERT_CREATE].message
				)
		} as HarborPilotCommandActionDef,
		[HarborPilotActionTypes.CERT_CREATE_RUN]: {
			name: HarborPilotActionTypes.CERT_CREATE_RUN,
			message: 'CHATBOT.RUN_CERTIFICATION',
			iconConfig: { name: 'badgeCheckSolid' },
			runAction: (action: HarborPilotAction) =>
				this.handleCommandAction(
					action,
					this.commandActionsDefinitions[HarborPilotActionTypes.CERT_CREATE_RUN].message
				)
		} as HarborPilotCommandActionDef,
		[HarborPilotActionTypes.GENERAL_POLICY_CREATE]: {
			name: HarborPilotActionTypes.GENERAL_POLICY_CREATE,
			message: 'CHATBOT.CREATE_POLICY',
			iconConfig: { name: 'layerGroup' },
			runAction: (action: HarborPilotAction) =>
				this.handleCommandAction(
					action,
					this.commandActionsDefinitions[HarborPilotActionTypes.GENERAL_POLICY_CREATE].message
				)
		} as HarborPilotCommandActionDef,
		[HarborPilotActionTypes.WORKFLOW_CREATE]: {
			name: HarborPilotActionTypes.WORKFLOW_CREATE,
			message: 'CHATBOT.CREATE_WORKFLOW',
			iconConfig: { name: 'codeBranch' },
			runAction: (action: HarborPilotAction) =>
				this.handleCommandAction(
					action,
					this.commandActionsDefinitions[HarborPilotActionTypes.WORKFLOW_CREATE].message
				)
		} as HarborPilotCommandActionDef
	};

	constructor(
		private translateService: TranslateService,
		private appShellNavigationService: AppShellNavigationService,
		private appShellUrlsService: AppShellUrlsService,
		private sessionService: SessionService,
		private harborPilotStore: HarborPilotStore
	) {
		this.recommendedActionsMessage = new CreateHarborPilotMessageVM(
			MessageType.STATIC,
			this.translateService.instant('CHATBOT.RECOMMENDED_ACTIONS')
		);
	}

	/**
	 * Handles clicks on an action button
	 * @param {HarborPilotCommandActionDef | HarborPilotNavigationActionDef} actionDef - the definition of the action that was clicked
	 * @param {HarborPilotAction} action - the Harbor Pilot Action that was clicked
	 */
	handleActionClick(
		actionDef: HarborPilotCommandActionDef | HarborPilotNavigationActionDef,
		action: HarborPilotAction
	) {
		actionDef.runAction(action);
	}

	/**
	 * Handles the navigation
	 * @param {string} urlId - url to navigate
	 * @param {string} param - additional url params
	 */
	handleNavigationAction(action: HarborPilotAction, urlId: string, param?: string) {
		this.appShellUrlsService.findUrlById(URLSet.cloudUINavbar, urlId).then(async res => {
			// Also post an action to the BE to be able track its telemetry.
			this.harborPilotStore.postAction({ action });
			// Navigate to the target URL appending the given params.
			await this.appShellNavigationService.navigateToUrl(`${res?.absoluteUrl}${param || ''}`);
		});
	}

	/**
	 * Handles creating and running a certification
	 * @param {HarborPilotAPIResponseData} data - the data payload necessary to send to the API call
	 * @param {string} message - message of the action clicked
	 * @param {HarborPilotActionTypes} actionType - the type of action to be performed
	 */
	handleCommandAction(action: HarborPilotAction, prompt: string) {
		this.harborPilotStore.sendCommand({
			action,
			prompt
		});
	}
}
