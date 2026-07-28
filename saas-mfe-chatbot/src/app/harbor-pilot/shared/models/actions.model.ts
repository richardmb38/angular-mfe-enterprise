import { ActorType, HarborPilotAPIResponseData } from './messages.model';

/**
 * Search page local storage key used to store and retrieve a pre-populated search query
 */
export const SEARCH_QUERY_STORAGE_KEY = 'LOCAL_SEARCH_QUERY';

export interface HarborPilotActionAPIPayload {
	sessionId?: string;
	inResponseTo: {
		id: string;
		type: HarborPilotInResponseTypes;
	};
	action: {
		actor: ActorType;
		actionType?: HarborPilotActionTypes;
		data?: HarborPilotAPIResponseData;
	};
}

export interface HarborPilotAction {
	actionType: HarborPilotActionTypes;
	actor: ActorType;
	data?: HarborPilotAPIResponseData;
	id?: string;
}

export enum HarborPilotInResponseTypes {
	CHAT = 'CHAT',
	ACTION = 'ACTION'
}

export enum HarborPilotActionTypes {
	CERT_CREATE = 'cert:create',
	CERT_CREATE_RUN = 'cert:create:run',
	GENERAL_POLICY_CREATE = 'general-policy:create',
	WORKFLOW_CREATE = 'workflow:create',
	SEARCH_VIEW = 'search:view',
	CERT_VIEW = 'cert:view',
	GENERAL_POLICY_VIEW = 'general-policy:view',
	WORKFLOW_VIEW = 'workflow:view',
	// This Action Type is owner strictly by the UI to navigate the user to the landing page of Workflows
	WORKFLOWS_LANDING_PAGE = 'workflows-landing-page:view'
}

/**
 * Provides a quick way to disable specific actions on the UI side.
 * Product team requirement, for unstable or beta tools we could leverage this to use feature flags as well.
 */
export const HARBOR_PILOT_DISABLED_ACTIONS = [
	HarborPilotActionTypes.CERT_CREATE,
	HarborPilotActionTypes.GENERAL_POLICY_CREATE,
	HarborPilotActionTypes.CERT_CREATE_RUN
];
