/*
 * Copyright (C) 2025 Acme Technologies, Inc.  All rights reserved.
 */
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { SimpleChanges } from '@angular/core';
import { ComponentFixture, TestBed, fakeAsync } from '@angular/core/testing';

import { SelectInputItem } from '@acme-priv/armada-angular/src/acme/angular/components/form';
import {
	TranslateModule,
	TranslateService
} from '@acme-priv/armada-angular/src/acme/angular/l10n/translation';

import { FrequencyOptions, FrequencyTranslationKeyMap } from '../../shared/models';
import { ConfigHubScheduledJobsFormComponent } from './scheduled-jobs-form.component';
import * as formUtils from './scheduled-jobs-form.util';

describe('ScheduledJobsFormComponent', () => {
	let component: ConfigHubScheduledJobsFormComponent;
	let fixture: ComponentFixture<ConfigHubScheduledJobsFormComponent>;
	let translateService: TranslateService;

	beforeEach(async () => {
		await TestBed.configureTestingModule({
			imports: [TranslateModule.forTesting(), HttpClientTestingModule],
			declarations: [ConfigHubScheduledJobsFormComponent]
		}).compileComponents();

		fixture = TestBed.createComponent(ConfigHubScheduledJobsFormComponent);
		translateService = TestBed.inject(TranslateService);
		component = fixture.componentInstance;
		component.gmtOffset = formUtils.ScheduleUtilConfig.DEFAULT_GMT_OFFSET;
		fixture.detectChanges();
	});

	it('should create', () => {
		expect(component).toBeTruthy();
	});

	describe('ngOnInit', () => {
		it('should generate frequency options', () => {
			component.frequencyOptions = [];
			component.ngOnInit();
			const options: SelectInputItem[] = [
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
			expect(component.frequencyOptions).toEqual(options);
		});

		it('should call handleFrequencyChange, and frequency is set to WEEKLY', () => {
			const handleFrequencyChangeSpy = jest.spyOn(component as any, 'handleFrequencyChange');
			component.ngOnInit();
			const formGroup = component.scheduledJobFormGroup;
			formGroup.markAsDirty();
			formGroup.patchValue({ frequency: FrequencyOptions.WEEKLY });
			expect(handleFrequencyChangeSpy).toHaveBeenCalled();
			expect(component.scheduledJobFormGroup.get('date')?.disabled).toBe(true);
			expect(component.scheduledJobFormGroup.get('recurEvery')?.disabled).toBe(true);
			expect(component.scheduledJobFormGroup.get('day')?.disabled).toBe(false);
			expect(component.scheduledJobFormGroup.get('day')?.value).toBe(1);
			expect(component.scheduledJobFormGroup.get('time')?.value).toBe(null);
		});

		it('should call handleFrequencyChange, and frequency is set to MONTHLY', () => {
			const handleFrequencyChangeSpy = jest.spyOn(component as any, 'handleFrequencyChange');
			component.ngOnInit();
			const formGroup = component.scheduledJobFormGroup;
			formGroup.markAsDirty();
			formGroup.patchValue({ frequency: FrequencyOptions.MONTHLY });

			expect(handleFrequencyChangeSpy).toHaveBeenCalled();
			expect(component.scheduledJobFormGroup.get('recurEvery')?.disabled).toBe(true);
			expect(component.scheduledJobFormGroup.get('day')?.disabled).toBe(true);
			expect(component.scheduledJobFormGroup.get('date')?.disabled).toBe(false);
			expect(component.scheduledJobFormGroup.get('time')?.value).toBe(null);
		});

		it('should call handleFrequencyChange, and frequency is set to DAILY', () => {
			const handleFrequencyChangeSpy = jest.spyOn(component as any, 'handleFrequencyChange');
			const formGroup = component.scheduledJobFormGroup;
			formGroup.markAsDirty();
			formGroup.patchValue({ frequency: FrequencyOptions.DAILY });

			expect(handleFrequencyChangeSpy).toHaveBeenCalled();
			expect(component.scheduledJobFormGroup.get('date')?.disabled).toBe(true);
			expect(component.scheduledJobFormGroup.get('day')?.disabled).toBe(true);
			expect(component.scheduledJobFormGroup.get('recurEvery')?.disabled).toBe(true);
			expect(component.scheduledJobFormGroup.get('recurEvery')?.value).toBe('0');
			expect(component.scheduledJobFormGroup.get('time')?.value).toBe(null);
		});
		it('should call handleFrequencyChange, handling default case, and frequency is set to empty', () => {
			const handleFrequencyChangeSpy = jest.spyOn(component as any, 'handleFrequencyChange');
			component.ngOnInit();
			const formGroup = component.scheduledJobFormGroup;
			formGroup.markAsDirty();
			formGroup.patchValue({ frequency: '' });

			expect(handleFrequencyChangeSpy).toHaveBeenCalled();
			expect(component.scheduledJobFormGroup.get('date')?.disabled).toBe(false);
			expect(component.scheduledJobFormGroup.get('day')?.disabled).toBe(true);
			expect(component.scheduledJobFormGroup.get('recurEvery')?.disabled).toBe(true);
			expect(component.scheduledJobFormGroup.get('recurEvery')?.value).toBe('');
			expect(component.scheduledJobFormGroup.get('time')?.value).toBe('');
		});
		it('should emit the form value and cron expression', () => {
			const emitSpy = jest.spyOn(component.onFormValueChange, 'emit');
			component.ngOnInit();

			expect(emitSpy).toHaveBeenCalled();
		});
	});

	describe('ngOnChanges', () => {
		it('it should call the parseCronExpression and populateBasedOnFrequencyAsMonthly method if the current value is present', () => {
			const parseCronExpressionSpy = jest.spyOn(component as any, 'parseCronExpression');
			const populateBasedOnFrequencyAsMonthlySpy = jest.spyOn(
				component as any,
				'populateBasedOnFrequencyAsMonthly'
			);
			const testChanges: SimpleChanges = {
				originalCronExpressions: {
					currentValue: ['0 0 10 5 * *'],
					previousValue: [],
					firstChange: false,
					isFirstChange: () => false
				}
			};
			const value = { dom: '5', dow: '*', hours: '10', minutes: '0', month: '*', seconds: '0', year: undefined };

			component.ngOnChanges(testChanges);
			expect(parseCronExpressionSpy).toHaveBeenCalledWith('0 0 10 5 * *');
			expect(populateBasedOnFrequencyAsMonthlySpy).toHaveBeenCalledWith(value);
			expect(component.isDataLoaded).toBeTruthy();
		});

		it('it should not call populateBasedOnFrequencyAsMonthly method if the current value is not present', () => {
			const populateBasedOnFrequencyAsMonthlySpy = jest.spyOn(
				component as any,
				'populateBasedOnFrequencyAsMonthly'
			);
			const testChanges: SimpleChanges = {
				originalCronExpressions: {
					currentValue: ['0 0 * * * *'],
					previousValue: [],
					firstChange: true,
					isFirstChange: () => true
				}
			};

			const vals = { seconds: '0', minutes: '0', hours: '*', dom: '*', month: '*', dow: '*', year: undefined };
			component.ngOnChanges(testChanges);
			expect(populateBasedOnFrequencyAsMonthlySpy).not.toHaveBeenCalledWith(vals);
			expect(component.isDataLoaded).toBeFalsy();
		});

		it('it should call the parseCronExpression and populateBasedOnFrequencyAsWeekly method if the current value is present with dow value', () => {
			const parseCronExpressionSpy = jest.spyOn(component as any, 'parseCronExpression');
			const populateBasedOnFrequencyAsWeeklySpy = jest.spyOn(
				component as any,
				'populateBasedOnFrequencyAsWeekly'
			);
			const testChanges: SimpleChanges = {
				originalCronExpressions: {
					currentValue: ['0 0 12 * * 7'],
					previousValue: [],
					firstChange: false,
					isFirstChange: () => false
				}
			};
			const value = { seconds: '0', minutes: '0', hours: '12', dom: '*', month: '*', dow: '7', year: undefined };

			component.ngOnChanges(testChanges);
			expect(parseCronExpressionSpy).toHaveBeenCalledWith('0 0 12 * * 7');
			expect(populateBasedOnFrequencyAsWeeklySpy).toHaveBeenCalledWith(value);
			expect(component.isDataLoaded).toBeTruthy();
		});

		it('it should call the parseCronExpression and populateBasedOnFrequencyAsDaily method if the current value is present with hours value only', () => {
			const parseCronExpressionSpy = jest.spyOn(component as any, 'parseCronExpression');
			const populateBasedOnFrequencyAsDailySpy = jest.spyOn(component as any, 'populateBasedOnFrequencyAsDaily');
			const testChanges: SimpleChanges = {
				originalCronExpressions: {
					currentValue: ['0 0 6 * * *'],
					previousValue: [],
					firstChange: false,
					isFirstChange: () => false
				}
			};
			const value = {
				seconds: '0',
				minutes: '0',
				hours: '6',
				dom: '*',
				month: '*',
				dow: '*'
			};

			component.ngOnChanges(testChanges);
			expect(parseCronExpressionSpy).toHaveBeenCalledWith('0 0 6 * * *');
			expect(populateBasedOnFrequencyAsDailySpy).toHaveBeenCalledWith(value);
			expect(component.isDataLoaded).toBeFalsy();
		});
	});

	describe('populateBasedOnFrequencyAsMonthly', () => {
		it('should call populateBasedOnFrequencyAsMonthly, when frequency selected as Monthly', () => {
			const value = { dom: '5', dow: '*', hours: '10', minutes: '0', month: '*', seconds: '0', year: undefined };
			(component as any).populateBasedOnFrequencyAsMonthly(value);
			expect(component.scheduledJobFormGroup.get(component.formControlKeys.FREQUENCY)?.value).toBe('MONTHLY');
			expect(component.scheduledJobFormGroup.get(component.formControlKeys.TIME)?.value).toBe('4:00 AM');
			expect(component.scheduledJobFormGroup.get(component.formControlKeys.DATE)?.value).toBe('5');
		});
	});

	describe('populateBasedOnFrequencyAsWeekly', () => {
		it('should call populateBasedOnFrequencyAsWeekly, when frequency selected as Weekly', () => {
			const value = { seconds: '0', minutes: '0', hours: '12', dom: '*', month: '*', dow: '7', year: undefined };
			(component as any).populateBasedOnFrequencyAsWeekly(value);
			expect(component.scheduledJobFormGroup.get(component.formControlKeys.FREQUENCY)?.value).toBe('WEEKLY');
			expect(component.scheduledJobFormGroup.get(component.formControlKeys.TIME)?.value).toBe('6:00 AM');
			expect(component.scheduledJobFormGroup.get(component.formControlKeys.DAY)?.value).toBe(7);
		});
	});

	describe('populateBasedOnFrequencyAsDaily', () => {
		it('should call populateBasedOnFrequencyAsDaily, when frequency selected as Daily', () => {
			const value = {
				seconds: '0',
				minutes: '0',
				hours: '6',
				dom: '*',
				month: '*',
				dow: '*'
			};
			(component as any).populateBasedOnFrequencyAsDaily(value);
			expect(component.scheduledJobFormGroup.get(component.formControlKeys.FREQUENCY)?.value).toBe('DAILY');
			expect(component.scheduledJobFormGroup.get(component.formControlKeys.TIME)?.value).toBe('12:00 AM');
			expect(component.scheduledJobFormGroup.get(component.formControlKeys.RECUR_EVERY)?.value).toBe('0');
		});
	});

	describe('possibleTimeEntriesBasedOnRecurrence', () => {
		it('should call possibleTimeEntriesBasedOnRecurrence, on intial phase, when api is loaded for the first time', () => {
			jest.spyOn(formUtils, 'convertToDateTime').mockReturnValue(
				new Date('2024-05-30T22:00:00.000Z').toISOString()
			);
			(component as any).possibleTimeEntriesBasedOnRecurrence('6');

			component.isDataLoaded = false;
			expect(component.maxTime).toEqual(new Date('2024-05-30T22:00:00.000Z'));
			expect(component.scheduledJobFormGroup.get('TIME')).toBeNull();
			expect(component.isDataLoaded).toBeFalsy();
		});

		it('should call possibleTimeEntriesBasedOnRecurrence, with a recur value and when user is interacting ', () => {
			jest.spyOn(formUtils, 'convertToDateTime').mockReturnValue(
				new Date('2024-05-30T22:00:00.000Z').toISOString()
			);
			component.isDataLoaded = true;
			(component as any).possibleTimeEntriesBasedOnRecurrence('6');
			expect(component.maxTime).toEqual(new Date('2024-05-30T22:00:00.000Z'));
			expect(component.isDataLoaded).toBeFalsy();
		});
	});

	describe('updateTimeFieldOptions', () => {
		it('should call possibleTimeEntriesBasedOnRecurrence based on recur value and frequency passed as DAILY ', () => {
			const formGroup = component.scheduledJobFormGroup;
			formGroup.markAsDirty();
			formGroup.patchValue({ frequency: FrequencyOptions.DAILY, recurEvery: '0', time: '12 a.m.' });
			const possibleTimeEntriesBasedOnRecurrenceSpy = jest.spyOn(
				component as any,
				'possibleTimeEntriesBasedOnRecurrence'
			);
			(component as any).updateTimeFieldOptions();
			formGroup.patchValue({ frequency: FrequencyOptions.DAILY, recurEvery: '6', time: '12 a.m.' });

			expect(possibleTimeEntriesBasedOnRecurrenceSpy).toHaveBeenCalledWith('6');
		});
	});

	describe('getOptionsForScheduleForm', () => {
		it('should call getOptionsForScheduleForm ', () => {
			component.frequencyOptions = [];
			component.dateFieldOptions = [];
			component.dayFieldOptions = [];
			component.recurFieldOptions = [];

			(component as any).getOptionsForScheduleForm();

			expect(component.frequencyOptions).toEqual([
				{
					displayName: 'CONFIG_HUB.DAILY',
					value: 'DAILY'
				},
				{
					displayName: 'CONFIG_HUB.WEEKLY',
					value: 'WEEKLY'
				},
				{
					displayName: 'CONFIG_HUB.MONTHLY',
					value: 'MONTHLY'
				}
			]);

			expect(component.dateFieldOptions[0]).toEqual({
				ariaLabel: { untranslated: '1' },
				displayName: { untranslated: '1' },
				value: '1'
			});

			expect(component.dayFieldOptions[0]).toEqual({
				ariaLabel: 'CONFIG_HUB.SUNDAY',
				displayName: 'CONFIG_HUB.SUNDAY',
				value: 1
			});

			expect(component.recurFieldOptions[0]).toEqual({
				ariaLabel: { translateKey: 'CONFIG_HUB.HOURS_MESSAGE', translateParams: { count: 1, label: '1' } },
				displayName: { translateKey: 'CONFIG_HUB.HOURS_MESSAGE', translateParams: { count: 1, label: '1' } },
				value: '1'
			});
		});
	});

	describe('handleScheduleFormChanges', () => {
		it('should call handleScheduleFormChanges, generate latest cron expression and emit values', fakeAsync(() => {
			const formGroup = component.scheduledJobFormGroup;
			const emitSpy = jest.spyOn(component.onFormValueChange, 'emit');
			formGroup.markAsDirty();
			formGroup.patchValue({ frequency: FrequencyOptions.MONTHLY, date: '2', time: '12 a.m.' });

			component.handleScheduleFormChanges();

			formGroup.patchValue({ frequency: FrequencyOptions.WEEKLY, day: 6, time: '4:00 AM' });
			expect(component.latestCronExpVals).toBe('0 0 10 * * 6 *');
			expect(emitSpy).toHaveBeenCalled();
		}));
	});

	describe('generateCronExpression', () => {
		it('should return cron expression when frequecny is MONTHLY ', () => {
			const formGroup = component.scheduledJobFormGroup;
			formGroup.markAsDirty();
			formGroup.patchValue({ frequency: FrequencyOptions.MONTHLY, date: '2', time: '12 a.m.' });
			const cronExpr = (component as any).generateCronExpression();
			expect(cronExpr).toBe('0 0 6 2 * *');
		});

		it('should return cron expression when frequecny is WEEKLY ', () => {
			const formGroup = component.scheduledJobFormGroup;
			formGroup.markAsDirty();
			formGroup.patchValue({ frequency: FrequencyOptions.WEEKLY, day: 1, time: '12 a.m.' });
			const cronExpr = (component as any).generateCronExpression();
			expect(cronExpr).toBe('0 0 6 * * 1');
		});

		it('should return cron expression when frequecny is DAILY ', () => {
			const formGroup = component.scheduledJobFormGroup;
			formGroup.markAsDirty();
			formGroup.patchValue({ frequency: FrequencyOptions.DAILY, recurEvery: '4', time: '12 a.m.' });
			const cronExpr = (component as any).generateCronExpression();
			expect(cronExpr).toBe('0 0 6,10,14,18,22,2 * * *');
		});

		it('should return cron expression as Empty when time is empty ', () => {
			const formGroup = component.scheduledJobFormGroup;
			formGroup.markAsDirty();
			formGroup.patchValue({ frequency: FrequencyOptions.DAILY, recurEvery: '4', time: '' });
			const cronExpr = (component as any).generateCronExpression();
			expect(cronExpr).toBe('');
		});
	});

	describe('onScheduleFormReset', () => {
		it('should call onScheduleFormReset, should reset the form to previous saved value', () => {
			const formGroup = component.scheduledJobFormGroup;
			component.originalCronExpressions = ['0 0 6 2 * *'];

			const parseCronExpressionSpy = jest.spyOn(component as any, 'parseCronExpression');
			formGroup.patchValue({ frequency: FrequencyOptions.WEEKLY, day: 6, time: '3 a.m.' });
			expect(component.latestCronExpVals).toBe('0 0 9 * * 6 *');

			component.onScheduleFormReset();
			expect(component.isDataLoaded).toBeFalsy();
			expect(component.isResetFlag).toBeTruthy();
			expect(component.originalCronExpressions).toStrictEqual(['0 0 6 2 * *']);
			expect(component.latestCronExpVals).toBe('0 0 6 2 * * *');
			expect(parseCronExpressionSpy).toHaveBeenCalledWith(component.originalCronExpressions[0]);
		});
	});

	describe('resetScheduleForm', () => {
		it('should call resetScheduleForm, should reset the form to empty the form', () => {
			const formGroup = component.scheduledJobFormGroup;
			formGroup.markAsDirty();
			formGroup.patchValue({ frequency: FrequencyOptions.DAILY, recurEvery: '4', time: '' });

			component.resetScheduleForm();

			expect(component.scheduledJobFormGroup.get(component.formControlKeys.FREQUENCY)?.value).toBe('');
			expect(component.scheduledJobFormGroup.get(component.formControlKeys.TIME)?.value).toBe('');
			expect(component.scheduledJobFormGroup.get(component.formControlKeys.RECUR_EVERY)?.value).toBe('');
			expect(component.scheduledJobFormGroup?.valid).toBeFalsy();
		});
	});

	describe('getTimeZoneText', () => {
		it('should call getTimeZoneText, when frequency is selected as MONTHLY', () => {
			const formGroup = component.scheduledJobFormGroup;
			formGroup.markAsDirty();
			formGroup.patchValue({ frequency: FrequencyOptions.MONTHLY, date: '2', time: '12 a.m.' });
			component.latestCronExpVals = ' 0 0 6 2 * *';
			expect(component.timeZoneText).toBe(`CONFIG_HUB.SCHEDULE_MONTHLY_TIMEZONE_TEXT`);
		});

		it('should call getTimeZoneText, when frequency is selected as WEEKLY', () => {
			const formGroup = component.scheduledJobFormGroup;
			formGroup.markAsDirty();
			formGroup.patchValue({ frequency: FrequencyOptions.WEEKLY, day: 2, time: '12 a.m.' });
			component.latestCronExpVals = ' 0 0 6 2 * *';
			expect(component.timeZoneText).toBe(`CONFIG_HUB.SCHEDULE_WEEKLY_TIMEZONE_TEXT`);
		});

		it('should call getTimeZoneText, when frequency is selected as DAILY', () => {
			const formGroup = component.scheduledJobFormGroup;
			formGroup.markAsDirty();
			formGroup.patchValue({ frequency: FrequencyOptions.DAILY, recurEvery: 4, time: '12 a.m.' });
			component.latestCronExpVals = ' 0 0 6 2 * *';
			expect(component.timeZoneText).toBe(`CONFIG_HUB.SCHEDULE_DAILY_TIMEZONE_TEXT`);
		});
	});

	describe('updateTimeLabelText', () => {
		it('should call updateTimeLabelText', () => {
			expect(component.timeLabelMessage).toBe(`CONFIG_HUB.START_TIME`);
			(component as any).updateTimeLabelText();
			expect(component.timeLabelMessage).toEqual({
				translateKey: 'CONFIG_HUB.START_TIME_GMT_OFFSET',
				translateParams: {
					gmtOffset: '- 6:00'
				}
			});
		});
	});

	describe('updateLabelForTimeHelpText', () => {
		it('should call updateLabelForTimeHelpText, when recurrence is 0', () => {
			(component as any).updateLabelForTimeHelpText();
			expect(component.timeHelpText).toBe('');
		});

		it('should call updateLabelForTimeHelpText, when recurrence is other than 0', () => {
			(component as any).updateLabelForTimeHelpText(3);
			expect(component.timeHelpText).toEqual(
				translateService.instantSafeHtml({
					translateKey: 'CONFIG_HUB.THE_AVAILABLE_TIMES_DEPEND_ON_FREQUENCY'
				})
			);
		});
	});
});
