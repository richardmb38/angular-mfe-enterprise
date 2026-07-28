/*
 * Copyright (C) 2025 Acme Technologies, Inc.  All rights reserved.
 */
import { Component, DestroyRef, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { UntypedFormControl, UntypedFormGroup } from '@angular/forms';

import {
	DatepickerSelection,
	FieldValidators
} from '@acme-priv/armada-angular/src/acme/angular/components/form';

import { ConfigHubScheduledJob, ScheduleDeployFormControlKeys } from '../../shared/models';

@Component({
	selector: 'app-scheduled-deploy-form',
	templateUrl: './scheduled-deploy-form.component.html',
	styleUrl: './scheduled-deploy-form.component.scss'
})
export class ConfigHubScheduledDeployFormComponent implements OnInit {
	/**
	 * The keys for the form group
	 */
	public formControlKeys = ScheduleDeployFormControlKeys;

	/**
	 * Form Group for deploy schedule
	 */
	public scheduleDeployFormGroup: UntypedFormGroup = new UntypedFormGroup({
		[this.formControlKeys.DATE]: new UntypedFormControl('', [], [FieldValidators.required]),
		[this.formControlKeys.TIME]: new UntypedFormControl('', [], [FieldValidators.required])
	});

	/**
	 * The selected scheduled job
	 */
	@Input() public set scheduledJob(scheduledJob: ConfigHubScheduledJob) {
		if (scheduledJob) {
			this.populateForm(scheduledJob);
		}
	}

	/**
	 * Event emitter for when the form changes value
	 */
	@Output() onFormValueChange = new EventEmitter<any>();

	/**
	 * Emits an event when the user tries to submit the form.
	 */
	public submitAttempted = new EventEmitter<void>();

	/**
	 * Min date for the date picker
	 */
	public minDate: Date = new Date();

	constructor(private destroyRef: DestroyRef) {}

	/**
	 * Initialize component
	 */
	ngOnInit(): void {
		this.onFormValueChange.emit({
			form: this.scheduleDeployFormGroup
		});
	}

	/**
	 * Populate form field based on the selected scheduled job values
	 */
	private populateForm(scheduledJob: ConfigHubScheduledJob): void {
		const date = new Date(scheduledJob.startTime);

		const dateValue: DatepickerSelection = {
			dates: [date]
		};

		this.scheduleDeployFormGroup.patchValue({
			[this.formControlKeys.DATE]: dateValue,
			[this.formControlKeys.TIME]: date.toLocaleString('en-US', {
				hour: 'numeric',
				minute: 'numeric',
				hour12: true
			})
		});
	}

	/**
	 * Handling Schedule form changes
	 */
	handleScheduleFormChanges(): void {
		this.scheduleDeployFormGroup.valueChanges.pipe(takeUntilDestroyed(this.destroyRef)).subscribe(() => {
			this.onFormValueChange.emit({
				form: this.scheduleDeployFormGroup
			});
		});
	}
}
