/*
 * Copyright (C) 2025 Acme Technologies, Inc.  All rights reserved.
 */
import { AlertConfig } from '@acme-priv/armada-angular/src/acme/angular/components/alert';
import { RadioInputItem } from '@acme-priv/armada-angular/src/acme/angular/components/form/field/radio';
import {
	DataGridTruncatedTextTooltipCellComponent,
	SlptColDef
} from '@acme-priv/armada-angular/src/acme/angular/components/grid';
import { ModalConfig } from '@acme-priv/armada-angular/src/acme/angular/components/modal';
import { NotificationType } from '@acme-priv/armada-angular/src/acme/angular/components/notification-header';
import { TranslateService } from '@acme-priv/armada-angular/src/acme/angular/l10n/translation';
import {
	CronExpressionService,
	CronTimeBasedAttributes
} from '@acme-priv/armada-angular/src/acme/angular/util/cron-expression';

import { ConfigHubJobType } from './config-hub-job-type.model';
import { ConfigHubBackupOptions } from './job.model';

/**
 * Interface for Scheduled Jobs
 */
export interface ConfigHubScheduledJob {
	id: string;
	created: string;
	jobType: string;
	content: {
		name: string;
		backupOptions: ConfigHubBackupOptions | undefined;
	};
	startTime: string;
	cronString: string;
}

/**
 * Interface for the Scheduled Job payload
 */
export interface ConfigHubScheduledJobPayload {
	jobType?: ConfigHubJobType;
	startTime?: string;
	content?: {
		name?: string;
		backupOptions?: ConfigHubBackupOptions;
		sourceBackupId?: string;
		draftId?: string;
	};
	cronString?: string;
}

/**
 * The form control keys for the scheduled jobs form
 */
export const ScheduledJobsFormControlKeys = {
	FREQUENCY: 'frequency',
	TIME: 'time',
	DATE: 'date',
	DAY: 'day',
	RECUR_EVERY: 'recurEvery',
	NAME: 'name'
};

/**
 * The form control keys for the scheduled deploy form
 */
export const ScheduleDeployFormControlKeys = {
	ACTION: 'action',
	DATE: 'date',
	TIME: 'time'
};

/**
 * Enum for schedule deploy actions
 */
export enum ScheduleDeployOptions {
	DEPLOY = 'DEPLOY',
	SCHEDULE = 'SCHEDULE'
}

/**
 * Options for the schedule deploy radio field
 */
export const ScheduleDeployRadioOptions: RadioInputItem[] = [
	{
		displayName: 'CONFIG_HUB.DEPLOY_NOW',
		value: ScheduleDeployOptions.DEPLOY
	},
	{
		displayName: 'CONFIG_HUB.SCHEDULE_DEPLOY',
		value: ScheduleDeployOptions.SCHEDULE
	}
];

/**
 * Enum for Frequency Options
 */
export enum FrequencyOptions {
	DAILY = 'DAILY',
	WEEKLY = 'WEEKLY',
	MONTHLY = 'MONTHLY'
}

export enum DaysOptions {
	Sunday = 1,
	Monday,
	Tuesday,
	Wednesday,
	Thursday,
	Friday,
	Saturday
}

/**
 * Translation dictionary for Frequency Options
 */
export const WeeklyTranslationKeyMap = {
	[DaysOptions[DaysOptions.Sunday]]: 'CONFIG_HUB.SUNDAY',
	[DaysOptions[DaysOptions.Monday]]: 'CONFIG_HUB.MONDAY',
	[DaysOptions[DaysOptions.Tuesday]]: 'CONFIG_HUB.TUESDAY',
	[DaysOptions[DaysOptions.Wednesday]]: 'CONFIG_HUB.WEDNESDAY',
	[DaysOptions[DaysOptions.Thursday]]: 'CONFIG_HUB.THURSDAY',
	[DaysOptions[DaysOptions.Friday]]: 'CONFIG_HUB.FRIDAY',
	[DaysOptions[DaysOptions.Saturday]]: 'CONFIG_HUB.SATURDAY'
};

/**
 * Translation dictionary for Frequency Options
 */
export const FrequencyTranslationKeyMap = {
	[FrequencyOptions.DAILY]: 'CONFIG_HUB.DAILY',
	[FrequencyOptions.WEEKLY]: 'CONFIG_HUB.WEEKLY',
	[FrequencyOptions.MONTHLY]: 'CONFIG_HUB.MONTHLY'
};

/**
 * Returns modal configuration for deleting an scheduled action.
 * @returns {ModalConfig} configuration to be opened by the ModalService.
 */
export function getDeleteScheduledJobModalConfig(): ModalConfig {
	return {
		title: {
			translateKey: 'CONFIG_HUB.DELETE_SCHEDULED_ACTION'
		},
		message: {
			translateKey: 'CONFIG_HUB.THE_SCHEDULED_ACTION_WILL_BE_DELETED'
		},
		type: NotificationType.Info,
		footer: [
			{ label: 'CONFIG_HUB.DELETE_SCHEDULED_ACTION', value: true, type: 'primary' },
			{ label: 'CONFIG_HUB.CANCEL', value: false, type: 'secondary' }
		],
		verticallyCentered: false
	};
}

/**
 * Gets an AlertConfig indicating a successful scheduled job creation
 *
 * @param translateService - provides the translateService for html translation.
 * @param translateKey - The message key that will be used for the translation
 * @returns - Alert config indicating that the delete operation was successful.
 */
export function getScheduledJobSuccessAlertConfig(
	translateService: TranslateService,
	translateKey: string
): AlertConfig {
	return {
		html: translateService.instantSafeHtml({
			translateKey: translateKey
		}),
		type: NotificationType.Success,
		dismissible: true,
		duration: 4000,
		align: 'bottom-left',
		popup: true
	};
}

/**
 * Column Defs for Scheduled Jobs Grid
 */
export const getScheduledJobsGridColumnDefs = (
	translateService: TranslateService,
	cronExpressionService: CronExpressionService
): SlptColDef[] => {
	return [
		{
			headerName: translateService.instant('CONFIG_HUB.TYPE'),
			field: 'jobType',
			sortable: false,
			resizable: false
		},
		{
			headerName: translateService.instant('CONFIG_HUB.NAME_ID'),
			field: 'id',
			sortable: false,
			resizable: false
		},
		{
			headerName: translateService.instant('CONFIG_HUB.CREATED'),
			field: 'created',
			sortable: false,
			resizable: false
		},
		{
			headerName: translateService.instant('CONFIG_HUB.FREQUENCY_EXECUTION_DATE'),
			field: 'cronString',
			cellRenderer: DataGridTruncatedTextTooltipCellComponent,
			valueGetter: params => {
				if (params.data?.cronString) {
					const cronAttributes: CronTimeBasedAttributes = cronExpressionService.parse(
						params.data?.cronString
					);

					const currentTimezone = -new Date().getTimezoneOffset() / 60;
					const hour = Number(cronAttributes.hours) + currentTimezone;

					const displayHours = `${hour < 0 ? hour + 24 : hour}:${String(cronAttributes.minutes).length === 1 ? '0' + String(cronAttributes.minutes) : cronAttributes.minutes}`;

					let frequency: FrequencyOptions;

					if (cronAttributes.dom === '*' && cronAttributes.dow === '*') {
						frequency = FrequencyOptions.DAILY;
					}

					if (cronAttributes.dow !== '*') {
						frequency = FrequencyOptions.WEEKLY;
					}

					if (cronAttributes.dom !== '*') {
						frequency = FrequencyOptions.MONTHLY;
					}

					const timeZoneMap = {
						[FrequencyOptions.DAILY]: translateService.instant({
							translateKey: 'CONFIG_HUB.SCHEDULE_DAILY_TIMEZONE_TEXT_SHORT',
							translateParams: { displayHours: displayHours }
						}),
						[FrequencyOptions.WEEKLY]:
							cronAttributes?.dow !== '*'
								? translateService.instant({
										translateKey: 'CONFIG_HUB.SCHEDULE_WEEKLY_TIMEZONE_TEXT_SHORT',
										translateParams: {
											displayHours: displayHours,
											dow: translateService.instant(
												`${WeeklyTranslationKeyMap[DaysOptions[Number(cronAttributes.dow)]]}`
											)
										}
									})
								: '',
						[FrequencyOptions.MONTHLY]:
							cronAttributes?.dom !== '*'
								? translateService.instant({
										translateKey: 'CONFIG_HUB.SCHEDULE_MONTHLY_TIMEZONE_TEXT_SHORT',
										translateParams: { displayHours: displayHours, dom: cronAttributes.dom }
									})
								: ''
					};
					return timeZoneMap[frequency] ?? '';
				}

				if (params.data?.startTime) {
					return new Date(params.data.startTime).toLocaleString();
				}

				return '';
			},
			sortable: false,
			resizable: false
		}
	];
};
