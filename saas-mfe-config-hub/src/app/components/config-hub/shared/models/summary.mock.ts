/*
 * Copyright (C) 2023 Acme Technologies, Inc.  All rights reserved.
 */
import { ConfigHubJobType } from './config-hub-job-type.model';
import { mockConfigHubCompareJob, mockConfigHubDraftJob } from './job.mock';
import { ConfigHubCompareSummary, ConfigHubDraftSummary, ObjectTypeDeltas } from './summary.model';

export const mockObjectBreakdown: { [objectType: string]: ObjectTypeDeltas } = {
	GOVERNANCE_GROUP: { same: 2, added: 0, removed: 0, different: 0, errors: 0 },
	SOD_POLICY: { same: 0, added: 0, removed: 2, different: 0, errors: 0 },
	ACCESS_PROFILE: { same: 6, added: 0, removed: 1, different: 6, errors: 0 },
	IDENTITY_PROFILE: { same: 4, added: 0, removed: 2, different: 0, errors: 0 },
	PASSWORD_SYNC_GROUP: { same: 0, added: 0, removed: 1, different: 0, errors: 0 },
	ROLE: { same: 7, added: 3, removed: 0, different: 0, errors: 0 },
	RULE: { same: 3, added: 5, removed: 7, different: 2, errors: 0 },
	SOURCE: { same: 1, added: 0, removed: 5, different: 6, errors: 0 },
	ATTR_SYNC_SOURCE_CONFIG: { same: 0, added: 5, removed: 0, different: 0, errors: 0 },
	CAMPAIGN_FILTER: { same: 0, added: 1, removed: 3, different: 0, errors: 0 },
	TRANSFORM: { same: 1, added: 3, removed: 0, different: 1, errors: 0 },
	PASSWORD_POLICY: { same: 0, added: 0, removed: 2, different: 0, errors: 0 },
	PUBLIC_IDENTITIES_CONFIG: { same: 0, added: 0, removed: 1, different: 3, errors: 0 },
	AUTH_ORG: { same: 8, added: 2, removed: 4, different: 1, errors: 0 },
	NOTIFICATION_TEMPLATE: { same: 4, added: 6, removed: 0, different: 1, errors: 0 },
	TRIGGER_SUBSCRIPTION: { same: 14, added: 2, removed: 1, different: 0, errors: 0 }
};

/**
 * Mock data for a Configuration Hub backup job summary.
 */
export const mockConfigHubCompareJobSummary: ConfigHubCompareSummary = {
	...mockConfigHubCompareJob,
	numberOfObjectsSource: 26,
	numberOfObjectsTarget: 21,
	objectBreakdown: mockObjectBreakdown,
	type: ConfigHubJobType.COMPARE
};

/**
 * Mock data for a Configuration Hub draft job summary.
 */
export const mockConfigHubDraftJobSummary: ConfigHubDraftSummary = {
	...mockConfigHubDraftJob,
	targetBackupId: '60aca886-fcfc-4739-9cc2-663ae09d5fa7',
	numberOfObjectsSource: 72,
	numberOfObjectsTarget: 102,
	objectBreakdown: mockObjectBreakdown,
	type: ConfigHubJobType.DRAFT,
	approvalStatus: null,
	approvalComment: []
};
export const mockConfigHubDraftJobSummaryNoChanges: ConfigHubDraftSummary = {
	...mockConfigHubDraftJob,
	targetBackupId: '60aca886-fcfc-4739-9cc2-663ae09d5fa7',
	numberOfObjectsSource: 72,
	numberOfObjectsTarget: 72,
	objectBreakdown: {},
	type: ConfigHubJobType.DRAFT,
	approvalStatus: null,
	approvalComment: []
};
