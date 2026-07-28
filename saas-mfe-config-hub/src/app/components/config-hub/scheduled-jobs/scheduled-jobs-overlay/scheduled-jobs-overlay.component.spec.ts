/*
 * Copyright (C) 2025 Acme Technologies, Inc.  All rights reserved.
 */
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { FormControl, FormGroup } from '@angular/forms';

import { of, throwError } from 'rxjs';

import { AlertsToasterService } from '@acme-priv/armada-angular/src/acme/angular/components/alert';
import { TranslateModule } from '@acme-priv/armada-angular/src/acme/angular/l10n/translation';

import {
	ConfigHubJobType,
	ConfigHubScheduledJobPayload,
	ScheduledJobsFormControlKeys,
	mockConfigHubBackupJobPartial,
	mockScheduleJobResponse
} from '../../shared/models';
import { ConfigHubScheduledJobsApiService } from '../../shared/services/scheduled-jobs/scheduled-jobs.api.service';
import { ConfigHubScheduledJobsOverlayComponent } from './scheduled-jobs-overlay.component';

const mockForm = new FormGroup({
	[ScheduledJobsFormControlKeys.DATE]: new FormControl(''),
	[ScheduledJobsFormControlKeys.DAY]: new FormControl(''),
	[ScheduledJobsFormControlKeys.FREQUENCY]: new FormControl(''),
	[ScheduledJobsFormControlKeys.NAME]: new FormControl(''),
	[ScheduledJobsFormControlKeys.RECUR_EVERY]: new FormControl(''),
	[ScheduledJobsFormControlKeys.TIME]: new FormControl('')
});

const mockCronExpression = '0 0 0 * * * *';

describe('ScheduledJobsOverlayComponent', () => {
	let component: ConfigHubScheduledJobsOverlayComponent;
	let fixture: ComponentFixture<ConfigHubScheduledJobsOverlayComponent>;
	let configHubScheduledJobsApiService: ConfigHubScheduledJobsApiService;
	let alertsToasterService: AlertsToasterService;

	beforeEach(async () => {
		await TestBed.configureTestingModule({
			declarations: [ConfigHubScheduledJobsOverlayComponent],
			imports: [TranslateModule.forRoot(), HttpClientTestingModule]
		}).compileComponents();

		configHubScheduledJobsApiService = TestBed.inject(ConfigHubScheduledJobsApiService);
		alertsToasterService = TestBed.inject(AlertsToasterService);
		fixture = TestBed.createComponent(ConfigHubScheduledJobsOverlayComponent);
		component = fixture.componentInstance;
		fixture.detectChanges();
	});

	it('should create', () => {
		expect(component).toBeTruthy();
	});

	describe('handleDismiss', () => {
		it('should emit the dismiss output', () => {
			const emitSpy = jest.spyOn(component.onDismiss, 'emit');

			component.handleDismiss();

			expect(emitSpy).toHaveBeenCalled();
		});
	});

	describe('handleFormValueChange', () => {
		it('should assign the values to the form and cron expression if jobType is backup', () => {
			component.selectedItem = mockScheduleJobResponse;

			expect(component.scheduledJobFormGroup).toBeUndefined();
			expect(component.cronExpression).toBeUndefined();

			component.handleFormValueChange({
				form: mockForm,
				cronExpression: mockCronExpression
			});

			expect(component.scheduledJobFormGroup).toBe(mockForm);
			expect(component.cronExpression).toEqual(mockCronExpression);
		});

		it('should assign the values to the form if jobType is deploy', () => {
			component.selectedItem = { mockScheduleJobResponse, jobType: ConfigHubJobType.DEPLOY };

			expect(component.scheduledJobFormGroup).toBeUndefined();
			expect(component.cronExpression).toBeUndefined();

			component.handleFormValueChange({
				form: mockForm,
				cronExpression: mockCronExpression
			});

			expect(component.scheduledJobFormGroup).toBe(mockForm);
			expect(component.cronExpression).toBeUndefined();
		});
	});

	describe('handleSubmit', () => {
		it('should call createScheduledJob api when form is valid', () => {
			const createScheduledJobSpy = jest.spyOn(configHubScheduledJobsApiService, 'createScheduledJob');

			component.isEditMode = false;
			component.scheduledJobFormGroup = mockForm;
			component.scheduledJobFormGroup.get(ScheduledJobsFormControlKeys.NAME)?.setValue('test');

			component.cronExpression = mockCronExpression;

			component.selectedItem = {
				...mockConfigHubBackupJobPartial,
				options: mockConfigHubBackupJobPartial.backupOptions
			};

			const payload: ConfigHubScheduledJobPayload = {
				jobType: ConfigHubJobType.BACKUP,
				cronString: mockCronExpression,
				content: {
					backupOptions: mockConfigHubBackupJobPartial.backupOptions,
					name: 'test'
				}
			};

			component.handleSubmit();

			expect(createScheduledJobSpy).toHaveBeenCalledWith(payload);
		});
	});

	describe('handleSubmit', () => {
		beforeEach(() => {
			component.scheduledJobFormGroup = mockForm;
			component.scheduledJobFormGroup.get(ScheduledJobsFormControlKeys.NAME)?.setValue('test');

			component.cronExpression = mockCronExpression;

			component.selectedItem = {
				...mockConfigHubBackupJobPartial,
				options: mockConfigHubBackupJobPartial.backupOptions
			};
		});

		it('should call createScheduledJob api when form is valid', () => {
			const createScheduledJobSpy = jest.spyOn(configHubScheduledJobsApiService, 'createScheduledJob');

			const payload: ConfigHubScheduledJobPayload = {
				jobType: ConfigHubJobType.BACKUP,
				cronString: mockCronExpression,
				content: {
					backupOptions: mockConfigHubBackupJobPartial.backupOptions,
					name: 'test'
				}
			};
			component.isEditMode = false;
			component.handleSubmit();

			expect(createScheduledJobSpy).toHaveBeenCalledWith(payload);
		});

		it('should call updateScheduledJob api when form is valid', () => {
			const updateScheduledJobSpy = jest.spyOn(configHubScheduledJobsApiService, 'editScheduledJob');

			component.selectedItem = mockScheduleJobResponse;

			const payload: ConfigHubScheduledJobPayload = {
				jobType: ConfigHubJobType.BACKUP,
				cronString: mockCronExpression,
				content: {
					backupOptions: mockConfigHubBackupJobPartial.backupOptions,
					name: 'test'
				}
			};

			component.isEditMode = true;
			component.handleSubmit();

			expect(updateScheduledJobSpy).toHaveBeenCalledWith(payload, mockScheduleJobResponse.id);
		});

		it('should display a success message when scheduled job creation succeeds', fakeAsync(() => {
			jest.spyOn(configHubScheduledJobsApiService, 'createScheduledJob').mockReturnValue(
				of(mockScheduleJobResponse)
			);

			const alertOpenSpy = jest.spyOn(alertsToasterService, 'open');

			component.isEditMode = false;
			component.handleSubmit();

			tick();

			expect(alertOpenSpy).toHaveBeenCalled();
		}));

		it('should display a success message when scheduled job update succeeds', fakeAsync(() => {
			jest.spyOn(configHubScheduledJobsApiService, 'editScheduledJob').mockReturnValue(
				of(mockScheduleJobResponse)
			);

			const alertOpenSpy = jest.spyOn(alertsToasterService, 'open');

			component.selectedItem = mockScheduleJobResponse;
			component.isEditMode = true;
			component.handleSubmit();

			tick();

			expect(alertOpenSpy).toHaveBeenCalled();
		}));

		it('should not display a success message when scheduled job creation fails', fakeAsync(() => {
			jest.spyOn(configHubScheduledJobsApiService, 'createScheduledJob').mockReturnValue(
				throwError(() => 'error')
			);

			const alertOpenSpy = jest.spyOn(alertsToasterService, 'open');

			component.isEditMode = false;
			component.handleSubmit();

			tick();

			expect(alertOpenSpy).not.toHaveBeenCalled();
		}));

		it('should not display a success message when scheduled job update fails', fakeAsync(() => {
			jest.spyOn(configHubScheduledJobsApiService, 'editScheduledJob').mockReturnValue(throwError(() => 'error'));

			const alertOpenSpy = jest.spyOn(alertsToasterService, 'open');

			component.selectedItem = mockScheduleJobResponse;
			component.isEditMode = true;
			component.handleSubmit();

			tick();

			expect(alertOpenSpy).not.toHaveBeenCalled();
		}));
	});

	describe('getScheduledJobType', () => {
		it('should return the jobType or type', () => {
			component.selectedItem = mockScheduleJobResponse;
			expect(component.getScheduledJobType()).toBe(ConfigHubJobType.BACKUP);
		});
	});

	describe('populateForm', () => {
		it('should populate the form', () => {
			component.selectedItem = mockScheduleJobResponse;
			component.scheduledJobFormGroup = mockForm;
			component.scheduledJobFormGroup.get(ScheduledJobsFormControlKeys.NAME)?.setValue(null);

			expect(component.scheduledJobFormGroup.get(ScheduledJobsFormControlKeys.NAME)?.value).toBe(null);
			expect(component.cronExpression).toBe(undefined);

			component.populateForm();

			expect(component.scheduledJobFormGroup.get(ScheduledJobsFormControlKeys.NAME)?.value).toBe(
				mockScheduleJobResponse.content.name
			);
			expect(component.cronExpression).toBe(mockScheduleJobResponse.cronString);
		});
	});
});
