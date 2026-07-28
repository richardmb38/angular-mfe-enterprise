/*
 * Copyright (C) 2025 Acme Technologies, Inc.  All rights reserved.
 */
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TranslateModule } from '@acme-priv/armada-angular/src/acme/angular/l10n/translation';

import { ScheduleDeployFormControlKeys, mockScheduleJobResponse } from '../../shared/models';
import { ConfigHubScheduledDeployFormComponent } from './scheduled-deploy-form.component';

describe('ConfigHubScheduledDeployFormComponent', () => {
	let component: ConfigHubScheduledDeployFormComponent;
	let fixture: ComponentFixture<ConfigHubScheduledDeployFormComponent>;

	beforeEach(async () => {
		await TestBed.configureTestingModule({
			imports: [TranslateModule.forTesting(), HttpClientTestingModule],
			declarations: [ConfigHubScheduledDeployFormComponent]
		}).compileComponents();

		fixture = TestBed.createComponent(ConfigHubScheduledDeployFormComponent);
		component = fixture.componentInstance;
		fixture.detectChanges();
	});

	it('should create', () => {
		expect(component).toBeTruthy();
	});

	describe('ngOnInit', () => {
		it('should emit the form', () => {
			const emitSpy = jest.spyOn(component.onFormValueChange, 'emit');

			component.ngOnInit();

			expect(emitSpy).toHaveBeenCalled();
		});
	});

	describe('handleScheduleFormChanges', () => {
		it('should emit the form', () => {
			const emitSpy = jest.spyOn(component.onFormValueChange, 'emit');

			component.handleScheduleFormChanges();

			component.scheduleDeployFormGroup.patchValue({
				[ScheduleDeployFormControlKeys.DATE]: '12/01/25'
			});

			expect(emitSpy).toHaveBeenCalled();
		});
	});

	describe('populateForm', () => {
		it('should populate the form', () => {
			expect(component.scheduleDeployFormGroup.get(ScheduleDeployFormControlKeys.DATE)?.value).toBe('');
			expect(component.scheduleDeployFormGroup.get(ScheduleDeployFormControlKeys.TIME)?.value).toBe('');

			component['populateForm'](mockScheduleJobResponse);

			expect(component.scheduleDeployFormGroup.get(ScheduleDeployFormControlKeys.DATE)?.value).toEqual({
				dates: [new Date('2025-01-28T00:00:00.000Z')]
			});
			expect(component.scheduleDeployFormGroup.get(ScheduleDeployFormControlKeys.TIME)?.value).toBe('6:00 PM');
		});
	});
});
