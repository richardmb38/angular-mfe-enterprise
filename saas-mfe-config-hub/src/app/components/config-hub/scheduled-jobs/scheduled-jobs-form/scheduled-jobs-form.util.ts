import { SelectInputItem } from '@acme-priv/armada-angular/src/acme/angular/components/form';

import {
	DaysOptions,
	FrequencyOptions,
	FrequencyTranslationKeyMap,
	WeeklyTranslationKeyMap
} from '../../shared/models';

/** Schedule config  */
export const ScheduleUtilConfig = {
	MONTH_OPTION: 28,
	TIME_REGEX: /(am|pm)/i,
	GLOBAL_REGEX: /\./g,
	AM: 'am',
	PM: 'pm',
	HOURS_0: 0,
	HOURS_1: 1,
	HOURS_2: 2,
	HOURS_3: 3,
	HOURS_4: 4,
	HOURS_6: 6,
	HOURS_8: 8,
	HOURS_12: 12,
	HOURS_24: 24,
	MINUTES_60: 60,
	TIME_SEPARATOR: ':',
	OFFSET_MINUS: '-',
	STRING_SEPARATOR: ',',
	OFFSET_ADD: '+',
	DECIMAL: 10,
	DEFAULT_PADDING: 2,
	DEFAULT_GMT_OFFSET: -6
};

/**
 *  Gets the appropriate list of frequency list
 * @export
 * @return {*}  {SelectInputItem[]}
 */
export function getFrequencyOptions(): SelectInputItem[] {
	const optionsToDisplay: SelectInputItem[] = [
		{
			value: FrequencyOptions.DAILY,
			displayName: FrequencyTranslationKeyMap[FrequencyOptions.DAILY]
		},
		{
			value: FrequencyOptions.WEEKLY,
			displayName: FrequencyTranslationKeyMap[FrequencyOptions.WEEKLY]
		},
		{
			value: FrequencyOptions.MONTHLY,
			displayName: FrequencyTranslationKeyMap[FrequencyOptions.MONTHLY]
		}
	];

	return optionsToDisplay;
}

/**
 * Get Monthly Date options from 1 - 28 in Date field
 * @export
 * @return {*}  {SelectInputItem[]}
 */
export function generateMonthlyDateOptions(): SelectInputItem[] {
	return Array.from({ length: ScheduleUtilConfig.MONTH_OPTION }, (_, i) => i + 1).map(
		value =>
			({
				value: value.toString(),
				displayName: {
					untranslated: value.toString()
				},
				ariaLabel: {
					untranslated: value.toString()
				}
			}) as SelectInputItem
	);
}

/**
 * Get Days options from Sunday to Saturday
 * @export
 * @return {*}  {SelectInputItem[]}
 */
export function generateDaysOptions(): SelectInputItem[] {
	return Object.keys(DaysOptions)
		.filter(key => isNaN(Number(key))) // filter out numeric keys
		.map(
			key =>
				({
					value: DaysOptions[key],
					displayName: WeeklyTranslationKeyMap[key],
					ariaLabel: WeeklyTranslationKeyMap[key]
				}) as SelectInputItem
		);
}

/**
 * Get Hours Options from 1,2,3,4,6,8,12 and 24 hours
 * @export
 * @return {*}  {SelectInputItem[]}
 */
export function generateHoursOptions(): SelectInputItem[] {
	const config = ScheduleUtilConfig;
	const hours = [
		config.HOURS_1,
		config.HOURS_2,
		config.HOURS_3,
		config.HOURS_4,
		config.HOURS_6,
		config.HOURS_8,
		config.HOURS_12,
		config.HOURS_24
	];
	const options = hours.map((hour: number) => ({
		label: hour.toString(),
		value: hour === config.HOURS_24 ? config.HOURS_0 : hour
	}));

	return options.map(
		option =>
			({
				value: option.value.toString(),
				displayName: {
					translateKey: 'CONFIG_HUB.HOURS_MESSAGE',
					translateParams: { count: option.value, label: option.label }
				},
				ariaLabel: {
					translateKey: 'CONFIG_HUB.HOURS_MESSAGE',
					translateParams: { count: option.value, label: option.label }
				}
			}) as SelectInputItem
	);
}

/**
 * Convert time string as Date Time Object to be passed
 * @export
 * @param {string} timeString
 * @param {Date} date
 * @return {*}  {string}
 */
export function convertToDateTime(timeString: string, date: Date): string {
	// Get current date
	const currentDate = date;

	timeString = timeString.replace(ScheduleUtilConfig.GLOBAL_REGEX, '').toLowerCase();

	// Parse hours, minutes, and period(AM/PM) from timeString
	const [time, period] = timeString.split(ScheduleUtilConfig.TIME_REGEX);
	let [hours] = time.split(ScheduleUtilConfig.TIME_SEPARATOR).map(Number);
	const [, minutes] = time.split(ScheduleUtilConfig.TIME_SEPARATOR).map(Number);

	// Adjust hours based on the period
	if (period === ScheduleUtilConfig.PM && hours !== ScheduleUtilConfig.HOURS_12) {
		hours += ScheduleUtilConfig.HOURS_12;
	} else if (period === ScheduleUtilConfig.AM && hours === ScheduleUtilConfig.HOURS_12) {
		hours = ScheduleUtilConfig.HOURS_0;
	}

	// Set hours and minutes for currentDate
	currentDate.setHours(hours, minutes || ScheduleUtilConfig.HOURS_0);

	// Reset seconds and milliseconds
	currentDate.setSeconds(ScheduleUtilConfig.HOURS_0, ScheduleUtilConfig.HOURS_0);
	return currentDate.toISOString();
}

/**
 * Convert given time string into GMT timestring to be used in cron expression
 * @export
 * @param {string} timeString
 * @param {number} gmtOffset
 * @param {string} [frequency]
 * @return {*}  {string}
 */
export function convertToGmtTimeString(timeString: string, gmtOffset: number, frequency?: string): string {
	timeString = timeString.replace(ScheduleUtilConfig.GLOBAL_REGEX, '').toLowerCase();
	// Parse hours, minutes, and period(AM/PM) from timeString
	const [time, period] = timeString.split(ScheduleUtilConfig.TIME_REGEX);
	let hours = parseInt(time, ScheduleUtilConfig.DECIMAL);

	// Adjust hours based on the period
	if (period === ScheduleUtilConfig.PM && hours !== ScheduleUtilConfig.HOURS_12) {
		hours += ScheduleUtilConfig.HOURS_12;
	} else if (period === ScheduleUtilConfig.AM && hours === ScheduleUtilConfig.HOURS_12) {
		hours = ScheduleUtilConfig.HOURS_0;
	}

	// Handling for Weekly and Monthly only
	if (frequency !== FrequencyOptions.DAILY) {
		hours -= gmtOffset;
		if (hours < ScheduleUtilConfig.HOURS_0) {
			// to represent the previous day
			hours += ScheduleUtilConfig.HOURS_24;
		} else if (hours > ScheduleUtilConfig.HOURS_24 - ScheduleUtilConfig.HOURS_1) {
			// to represent the following day
			hours -= ScheduleUtilConfig.HOURS_24;
		}
	}

	return hours.toString();
}

/**
 * Helper function to get GMToffset Time helpText
 * @export
 * @param {number} offset
 * @return {*}  {string}
 */
export function updateTimeHelpText(offset: number): string {
	let gmtValue = '';
	const offsetSymbol =
		offset < ScheduleUtilConfig.HOURS_0 ? ScheduleUtilConfig.OFFSET_MINUS : ScheduleUtilConfig.OFFSET_ADD;
	offset = Math.abs(offset);

	const hour = Math.floor(offset);
	const minute = Math.round((offset - hour) * ScheduleUtilConfig.MINUTES_60);

	// pad with 0 if hour or minute is less than 10, to get HH:MM format
	const paddedHour = hour?.toString();
	const paddedMinute = minute
		?.toString()
		?.padStart(ScheduleUtilConfig.DEFAULT_PADDING, ScheduleUtilConfig.HOURS_0?.toString());
	gmtValue = `${offsetSymbol} ${paddedHour}:${paddedMinute}`;
	return !!offset ? gmtValue : '';
}

/**
 * Update Recurrence Time based on frequency as DAILY
 * @export
 * @param {string} recurString
 * @return {*}  {string}
 */
export function updateRecurrenceTimeBasedOnDaily(recurString: string, gmtOffset: number): string {
	// adjust values so that they're in GMT/UTC time zone
	let hourExp = '';
	let nextVal: number;
	const har = recurString.split(ScheduleUtilConfig.STRING_SEPARATOR);
	har.forEach((item: string, idx: number) => {
		if (idx > ScheduleUtilConfig.HOURS_0) {
			hourExp += ScheduleUtilConfig.STRING_SEPARATOR;
		}
		nextVal = parseInt(item, ScheduleUtilConfig.DECIMAL) - gmtOffset;
		if (nextVal > ScheduleUtilConfig.HOURS_24 - ScheduleUtilConfig.HOURS_1) {
			nextVal -= ScheduleUtilConfig.HOURS_24;
		} else if (nextVal < ScheduleUtilConfig.HOURS_0) {
			nextVal += ScheduleUtilConfig.HOURS_24;
		}
		hourExp += nextVal;
	});

	return hourExp;
}
