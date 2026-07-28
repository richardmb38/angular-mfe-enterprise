/*
 * Copyright (C) 2025 Acme Technologies, Inc.  All rights reserved.
 */
import { ConfigHubScheduledJob } from './scheduled-jobs.model';

export const mockScheduleJobResponse: ConfigHubScheduledJob = {
	id: 'a534034a-a295-47bb-8842-4768436561f3',
	created: '2025-01-27T17:15:50.965268Z',
	jobType: 'BACKUP',
	content: {
		name: 'Daily AUTH_ORG backup',
		backupOptions: {
			includeTypes: ['AUTH_ORG'],
			objectOptions: {}
		}
	},
	startTime: '2025-01-28T00:00:00Z',
	cronString: '0 0 0 * * * *'
};

export const mockScheduleJobSelected: ConfigHubScheduledJob = {
	id: 'a534034a-a295-47bb-8842-4768436561f3',
	created: '2025-01-27T17:15:50.965268Z',
	jobType: 'BACKUP',
	content: {
		name: 'Daily AUTH_ORG backup 2',
		backupOptions: {
			includeTypes: ['AUTH_ORG'],
			objectOptions: null
		}
	},
	startTime: '2025-01-28T00:00:00Z',
	cronString: '0 0 0 * * * *'
};

export const MOCK_SCHEDULE_JOB_ARRAY: ConfigHubScheduledJob[] = Array.from({ length: 50 }, (_, i) => ({
	id: `${(i + 1).toString(16)}fbe7b84-302e-4cc5-a95e-619edccc16a5`,
	created: '2025-01-27T17:15:50.965268Z',
	jobType: 'BACKUP',
	content: {
		name: 'Daily AUTH_ORG backup',
		backupOptions: {
			includeTypes: ['AUTH_ORG'],
			objectOptions: null
		}
	},
	startTime: '2025-01-28T00:00:00Z',
	cronString: '0 0 0 * * * *'
}));
