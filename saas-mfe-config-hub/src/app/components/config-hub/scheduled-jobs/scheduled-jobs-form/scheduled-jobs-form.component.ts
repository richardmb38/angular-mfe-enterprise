/*
 * Copyright (C) 2025 Acme Technologies, Inc.  All rights reserved.
 */
import { Component, DestroyRef, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { UntypedFormControl, UntypedFormGroup } from '@angular/forms';

import { BehaviorSubject, distinctUntilChanged, filter, withLatestFrom } from 'rxjs';

import { FieldValidators, SelectInputItem } from '@acme-priv/armada-angular/src/acme/angular/components/form';
import { Message, TranslateService } from '@acme-priv/armada-angular/src/acme/angular/l10n/translation';
import {
	CronExpressionService,
	CronTimeBasedAttributes,
	RecurrenceAttributes
} from '@acme-priv/armada-angular/src/acme/angular/util/cron-expression';

import {
	ConfigHubBackupJob,
	DaysOptions,
	FrequencyOptions,
	ScheduledJobsFormControlKeys,
	WeeklyTranslationKeyMap
} from '../../shared/models';
import {
	ScheduleUtilConfig,
	convertToDateTime,
	convertToGmtTimeString,
	generateDaysOptions,
	generateHoursOptions,
	generateMonthlyDateOptions,
	getFrequencyOptions,
	updateRecurrenceTimeBasedOnDaily,
	updateTimeHelpText
} from './scheduled-jobs-form.util';

@Component({
	selector: 'app-config-hub-scheduled-jobs-form',
	templateUrl: './scheduled-jobs-form.component.html',
	styleUrl: './scheduled-jobs-form.component.scss'
})
export class ConfigHubScheduledJobsFormComponent implements OnChanges, OnInit {
	/*
	 * Original Cron Expression to be parsed, to get the values
	 */
	@Input() originalCronExpressions: string[];

	/**
	 * The selected backup or draft job
	 */
	@Input() selectedJob: ConfigHubBackupJob | null;

	/**
	 * GMT offset for Time(GMT- 6), default set to GMT - 6
	 */
	@Input() gmtOffset: number;

	/**
	 * Variable to keep track of showing form errors
	 */
	@Input() submitAttempted$: BehaviorSubject<boolean>;

	/**
	 * Event emitter for when the form changes value
	 */
	@Output() onFormValueChange = new EventEmitter<any>();

	/**
	 * Options for frequency select field
	 */
	public frequencyOptions: SelectInputItem[] = [];

	/**
	 * Options for Date(Recurrence field) select field
	 */
	public dateFieldOptions: SelectInputItem[] = [];

	/**
	 * Options for Day(Recurrence field) select field
	 */
	public dayFieldOptions: SelectInputItem[] = [];

	/**
	 * Options for hours(Recur Every field) select field
	 */
	public recurFieldOptions: SelectInputItem[] = [];

	/**
	 * The keys for the form group
	 */
	public formControlKeys = ScheduledJobsFormControlKeys;

	/**
	 * Latest cron expression value whenever there is change in Scheduled Job form
	 */
	public latestCronExpVals: string;

	/**
	 * Variable to keep track of showing form errors
	 */
	public resetEvent = new EventEmitter<boolean>();

	/**
	 * Form group for creating a new Scheduled Job
	 */
	public scheduledJobFormGroup = new UntypedFormGroup({
		[this.formControlKeys.NAME]: new UntypedFormControl('', [], FieldValidators.required),
		[this.formControlKeys.FREQUENCY]: new UntypedFormControl('', [], FieldValidators.required),
		[this.formControlKeys.TIME]: new UntypedFormControl('', [], FieldValidators.required),
		[this.formControlKeys.DATE]: new UntypedFormControl('', [], FieldValidators.required),
		[this.formControlKeys.DAY]: new UntypedFormControl('', [], FieldValidators.required),
		[this.formControlKeys.RECUR_EVERY]: new UntypedFormControl('', [], FieldValidators.required)
	});

	// Max datetime, based on recurrence value
	public maxTime: Date;

	// Min datetime as current date, set hours to 12am
	public minTime: Date = new Date();

	/** Flat to differentiate btw API loading and user interaction */
	public isDataLoaded = false;

	/** Flat to handle reset functionality */
	public isResetFlag = false;

	/** Time label */
	public timeLabelMessage: Message = 'CONFIG_HUB.START_TIME';

	/** Time label help text  */
	public timeHelpText: Message;

	/** TimeZone label text  */
	public timeZoneText = '';

	/** Variable holding display hours value  */
	private displayHours = '';

	constructor(
		private cronExpressionService: CronExpressionService,
		private translateService: TranslateService,
		private destroyRef: DestroyRef
	) {}

	/**
	 * Initialize
	 */
	ngOnInit() {
		this.minTime.setHours(0, 0, 0, 0);
		this.getOptionsForScheduleForm();
		this.scheduledJobFormGroup
			.get(this.formControlKeys.FREQUENCY)
			.valueChanges.pipe(distinctUntilChanged(), takeUntilDestroyed(this.destroyRef))
			.subscribe((value: string) => {
				this.handleFrequencyChange(value);
			});
		this.updateTimeFieldOptions();
		this.handleScheduleFormChanges();
		this.onFormValueChange.emit({
			form: this.scheduledJobFormGroup,
			cronExpression: this.latestCronExpVals
		});
	}

	/**
	 * Handling Schedule form changes
	 */
	handleScheduleFormChanges() {
		this.scheduledJobFormGroup.valueChanges.pipe(takeUntilDestroyed(this.destroyRef)).subscribe(() => {
			this.latestCronExpVals = this.generateCronExpression();
			this.latestCronExpVals = this.latestCronExpVals.replace('?', '*').concat(' *');
			this.getTimeZoneText();
			this.onFormValueChange.emit({
				form: this.scheduledJobFormGroup,
				cronExpression: this.latestCronExpVals
			});
		});
	}

	/**
	 * Executed each time whenever the value of the input control in the component has been modified
	 */
	ngOnChanges(changes: SimpleChanges) {
		if (changes.gmtOffset?.currentValue && changes.gmtOffset?.currentValue !== changes.gmtOffset?.previousValue) {
			this.gmtOffset = changes.gmtOffset.currentValue;
			this.updateTimeLabelText();
		}
		if (changes.originalCronExpressions?.currentValue && changes.originalCronExpressions?.currentValue.length) {
			this.originalCronExpressions = changes.originalCronExpressions.currentValue;
			// Update the flag to true when data is loaded
			this.isDataLoaded = true;
			this.isResetFlag = false;
			this.parseCronExpression(this.originalCronExpressions[0]);
		}
	}

	/**
	 * Method to reset the form with api saved value
	 * @memberof ConfigHubScheduledJobsFormComponent
	 */
	onScheduleFormReset() {
		this.isDataLoaded = false;
		this.isResetFlag = true;
		this.parseCronExpression(this.originalCronExpressions[0]);
	}

	/**
	 * Handle Frequency Change
	 * @private
	 * @param {string} value
	 * @memberof ConfigHubScheduledJobsFormComponent
	 */
	private handleFrequencyChange(value: string) {
		this.toggleFormFieldsStatus();
		switch (value) {
			case FrequencyOptions.DAILY:
				// Set default value
				if (!this.isDataLoaded) {
					this.scheduledJobFormGroup.get(this.formControlKeys.TIME).setValue(null);
					this.scheduledJobFormGroup.get(this.formControlKeys.RECUR_EVERY).setValue('0');
				}
				break;

			case FrequencyOptions.WEEKLY:
				// Set default value
				this.scheduledJobFormGroup.get(this.formControlKeys.TIME).setValue(null);
				this.scheduledJobFormGroup.get(this.formControlKeys.DAY).setValue(DaysOptions.Sunday);
				// Updating max time, whenever there is change in frequency
				this.updateMaxTime(ScheduleUtilConfig.HOURS_24 - 1);
				this.updateLabelForTimeHelpText();
				break;

			case FrequencyOptions.MONTHLY:
				// Set default value
				this.scheduledJobFormGroup.get(this.formControlKeys.TIME).setValue(null);
				this.scheduledJobFormGroup.get(this.formControlKeys.DATE).setValue('1');
				// Updating max time, whenever there is change in frequency
				this.updateMaxTime(ScheduleUtilConfig.HOURS_24 - 1);
				this.updateLabelForTimeHelpText();
				break;

			default:
				this.scheduledJobFormGroup.get(this.formControlKeys.TIME).setValue('');
				this.scheduledJobFormGroup.get(this.formControlKeys.DATE).setValue('');
				this.scheduledJobFormGroup.get(this.formControlKeys.FREQUENCY).setValue('');
				break;
		}
	}

	/**
	 * Handling form fields enable/disable
	 * @private
	 * @memberof ConfigHubScheduledJobsFormComponent
	 */
	private toggleFormFieldsStatus() {
		const frequency = this.scheduledJobFormGroup.get(this.formControlKeys.FREQUENCY).value;
		switch (frequency) {
			case FrequencyOptions.DAILY:
				this.scheduledJobFormGroup.get(this.formControlKeys.DATE).disable();
				this.scheduledJobFormGroup.get(this.formControlKeys.DAY).disable();
				this.scheduledJobFormGroup.get(this.formControlKeys.RECUR_EVERY).disable();
				break;

			case FrequencyOptions.WEEKLY:
				this.scheduledJobFormGroup.get(this.formControlKeys.DATE).disable();
				this.scheduledJobFormGroup.get(this.formControlKeys.RECUR_EVERY).disable();
				this.scheduledJobFormGroup.get(this.formControlKeys.DAY).enable();
				break;

			case FrequencyOptions.MONTHLY:
				this.scheduledJobFormGroup.get(this.formControlKeys.DAY).disable();
				this.scheduledJobFormGroup.get(this.formControlKeys.RECUR_EVERY).disable();
				this.scheduledJobFormGroup.get(this.formControlKeys.DATE).enable();
				break;

			default:
				this.scheduledJobFormGroup.get(this.formControlKeys.DAY).disable();
				this.scheduledJobFormGroup.get(this.formControlKeys.RECUR_EVERY).disable();
				this.scheduledJobFormGroup.get(this.formControlKeys.DATE).enable();
				break;
		}
	}

	/**
	 * Generate a cron expression from the form values selected
	 */
	private generateCronExpression(): string {
		const frequency = this.scheduledJobFormGroup.get(this.formControlKeys.FREQUENCY).value;
		const recurrence = this.scheduledJobFormGroup.get(this.formControlKeys.RECUR_EVERY).value;
		const time = this.scheduledJobFormGroup.get(this.formControlKeys.TIME).value;
		if (time) {
			let cronExp: CronTimeBasedAttributes = {
				seconds: '0',
				minutes: '0',
				hours: '0',
				dom: '*',
				month: '*',
				dow: '*',
				year: undefined
			};

			const recur = frequency === FrequencyOptions.DAILY ? recurrence : ScheduleUtilConfig.HOURS_24;
			const hours = convertToGmtTimeString(time, this.gmtOffset, frequency);
			const recurString = this.cronExpressionService.serializeRecur(Number(hours), Number(recur));
			switch (frequency) {
				case FrequencyOptions.DAILY:
					// values in recurString are already local time
					this.displayHours = this.cronExpressionService.getDisplayableHours(
						recurString,
						ScheduleUtilConfig.HOURS_0
					);

					cronExp = {
						...cronExp,
						hours: updateRecurrenceTimeBasedOnDaily(recurString, this.gmtOffset)
					};
					break;

				case FrequencyOptions.WEEKLY:
					const day = this.scheduledJobFormGroup.get(this.formControlKeys.DAY).value;
					cronExp = {
						...cronExp,
						dom: '*',
						dow: day,
						hours
					};
					this.displayHours = this.cronExpressionService.getDisplayableHours(recurString, this.gmtOffset);
					break;

				case FrequencyOptions.MONTHLY:
					const date = this.scheduledJobFormGroup.get(this.formControlKeys.DATE).value;
					cronExp = {
						...cronExp,
						dom: date,
						hours
					};
					this.displayHours = this.cronExpressionService.getDisplayableHours(recurString, this.gmtOffset);
					break;
			}
			return this.cronExpressionService.serialize(cronExp);
		} else {
			return '';
		}
	}

	/**
	 * Parse Cron Expression getting from Scheduled Job
	 * @param value
	 */
	private parseCronExpression(value: string) {
		if (value) {
			const vals: CronTimeBasedAttributes = this.cronExpressionService.parse(value);
			if (vals.dom !== '*') {
				this.populateBasedOnFrequencyAsMonthly(vals);
			} else if (vals.dow !== '*') {
				this.populateBasedOnFrequencyAsWeekly(vals);
			} else {
				this.populateBasedOnFrequencyAsDaily(vals);
			}
		}
	}

	/**
	 * Helper function to call all the options methods
	 */
	private getOptionsForScheduleForm() {
		this.frequencyOptions = getFrequencyOptions();
		this.dateFieldOptions = generateMonthlyDateOptions();
		this.dayFieldOptions = generateDaysOptions();
		this.recurFieldOptions = generateHoursOptions();
	}

	/**
	 * Update Form Value based on when frequency selected is Monthly
	 * @private
	 * @param {CronTimeBasedAttributes} vals
	 * @memberof ConfigHubScheduledJobsFormComponent
	 */
	private populateBasedOnFrequencyAsMonthly(vals: CronTimeBasedAttributes) {
		const timeToUpdate = this.cronExpressionService.getDisplayableHours(vals?.hours?.toString(), this.gmtOffset);
		this.scheduledJobFormGroup.patchValue({
			[this.formControlKeys.FREQUENCY]: FrequencyOptions.MONTHLY,
			[this.formControlKeys.DATE]: vals?.dom,
			[this.formControlKeys.TIME]: timeToUpdate?.toLocaleUpperCase()?.replaceAll('.', '')
		});
	}

	/**
	 * Update Form Value based on when frequency selected is Weekly
	 * @private
	 * @param {CronTimeBasedAttributes} [vals]
	 * @memberof ConfigHubScheduledJobsFormComponent
	 */
	private populateBasedOnFrequencyAsWeekly(vals?: CronTimeBasedAttributes) {
		const timeToUpdate = this.cronExpressionService.getDisplayableHours(vals?.hours?.toString(), this.gmtOffset);
		this.scheduledJobFormGroup.patchValue({
			[this.formControlKeys.FREQUENCY]: FrequencyOptions.WEEKLY,
			[this.formControlKeys.DAY]: Number(vals?.dow),
			[this.formControlKeys.TIME]: timeToUpdate?.toLocaleUpperCase()?.replaceAll('.', '')
		});
	}

	/**
	 *
	 * Update Form value based on when frequency selected is Daily
	 * @private
	 * @param {CronTimeBasedAttributes} [vals]
	 * @memberof ConfigHubScheduledJobsFormComponent
	 */
	private populateBasedOnFrequencyAsDaily(vals?: CronTimeBasedAttributes) {
		const parseRecurTime: RecurrenceAttributes = this.cronExpressionService.parseRecur(vals?.hours?.toString());
		const timeToUpdate = this.cronExpressionService.getDisplayableHours(
			parseRecurTime?.start?.toString(),
			this.gmtOffset
		);
		this.scheduledJobFormGroup.patchValue({
			[this.formControlKeys.FREQUENCY]: FrequencyOptions.DAILY,
			[this.formControlKeys.TIME]: timeToUpdate?.toLocaleUpperCase()?.replaceAll('.', ''),
			[this.formControlKeys.RECUR_EVERY]: parseRecurTime?.recur.toString()
		});
	}

	/**
	 * Reset to default value
	 */
	public resetScheduleForm() {
		this.scheduledJobFormGroup.reset({
			[this.formControlKeys.NAME]: '',
			[this.formControlKeys.FREQUENCY]: '',
			[this.formControlKeys.TIME]: '',
			[this.formControlKeys.DATE]: '',
			[this.formControlKeys.RECUR_EVERY]: '',
			[this.formControlKeys.DAY]: ''
		});
	}

	/**
	 * Update Time Options when recurrence option is changed
	 * @private
	 * @memberof ConfigHubScheduledJobsFormComponent
	 */
	private updateTimeFieldOptions() {
		const frequency$ = this.scheduledJobFormGroup.get(this.formControlKeys.FREQUENCY).valueChanges;
		const recur$ = this.scheduledJobFormGroup.get(this.formControlKeys.RECUR_EVERY).valueChanges;
		recur$
			.pipe(
				// to ignore repeated or same values from recur
				distinctUntilChanged(),
				// to get latest value from frequency
				withLatestFrom(frequency$),
				// filter out entries i.e freq = Daily and time is empty
				filter(([recur, freq]) => freq === FrequencyOptions.DAILY && recur !== ''),
				takeUntilDestroyed(this.destroyRef)
			)
			.subscribe(([recur]) => {
				this.possibleTimeEntriesBasedOnRecurrence(recur);
			});
	}

	/**
	 * Possible Time Entries to be shown based on recurrence selected
	 * @private
	 * @param {string} recurValue
	 * @memberof ConfigHubScheduledJobsFormComponent
	 */
	private possibleTimeEntriesBasedOnRecurrence(recurValue: string) {
		const recurrence = parseInt(recurValue, 10);
		const endTime = 24 - recurrence >= 0 ? 24 - recurrence - 1 : 0;
		// update max time based on recurrence value, return as date format
		this.updateMaxTime(endTime);
		this.updateLabelForTimeHelpText(recurrence);
		if (!this.isDataLoaded && !this.isResetFlag) {
			// when user is updating the form
			this.scheduledJobFormGroup.get(this.formControlKeys.TIME).setValue(null);
		} else {
			this.isDataLoaded = false;
			this.isResetFlag = false;
		}
	}

	/**
	 * Get Time zone text based on form values
	 */
	private getTimeZoneText() {
		const formValues = this.scheduledJobFormGroup?.value;
		const dayOfWeek = formValues?.day;
		const dayOfMonth = formValues?.date;
		if (this.latestCronExpVals?.length) {
			const timeZoneMap = {
				[FrequencyOptions.DAILY]: this.translateService.instant({
					translateKey: 'CONFIG_HUB.SCHEDULE_DAILY_TIMEZONE_TEXT',
					translateParams: { displayHours: this.displayHours }
				}),
				[FrequencyOptions.WEEKLY]: DaysOptions[dayOfWeek]
					? this.translateService.instant({
							translateKey: 'CONFIG_HUB.SCHEDULE_WEEKLY_TIMEZONE_TEXT',
							translateParams: {
								displayHours: this.displayHours,
								dow: this.translateService.instant(`${WeeklyTranslationKeyMap[DaysOptions[dayOfWeek]]}`)
							}
						})
					: '',
				[FrequencyOptions.MONTHLY]: dayOfMonth
					? this.translateService.instant({
							translateKey: 'CONFIG_HUB.SCHEDULE_MONTHLY_TIMEZONE_TEXT',
							translateParams: { displayHours: this.displayHours, dom: dayOfMonth }
						})
					: ''
			};
			this.timeZoneText = timeZoneMap[formValues?.frequency] ?? '';
		} else {
			this.timeZoneText = '';
		}
	}

	/**
	 * Update Max Time, based on frequency selected
	 * For Monthly-Weekly, it should be 12 am - 11 pm.
	 * For Daily it should be updated based on recurrence
	 */
	private updateMaxTime(displayHours: number) {
		const time = this.cronExpressionService.getDisplayableHours(displayHours.toString(), 0);
		this.maxTime = new Date(convertToDateTime(time, new Date()));
	}

	/**
	 * Update Label for the Time Field
	 */
	private updateTimeLabelText() {
		this.timeLabelMessage = {
			translateKey: 'CONFIG_HUB.START_TIME_GMT_OFFSET',
			translateParams: { gmtOffset: updateTimeHelpText(this.gmtOffset) }
		};
	}

	/**
	 * Update Time Help Text
	 * @param {number} [recurrence]
	 */
	private updateLabelForTimeHelpText(recurrence = 0) {
		this.timeHelpText =
			recurrence === ScheduleUtilConfig.HOURS_0
				? ''
				: this.translateService.instantSafeHtml({
						translateKey: 'CONFIG_HUB.THE_AVAILABLE_TIMES_DEPEND_ON_FREQUENCY'
					});
	}
}
