/*
 * Copyright (C) 2024 Acme Technologies, Inc.  All rights reserved.
 */
import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TranslateModule } from '@acme-priv/armada-angular/src/acme/angular/l10n/translation';

import { MessageSentimentType } from '../../shared/models/messages.model';
import { HarborPilotFeedbackFormOverlayComponent } from './harbor-pilot-feedback-form-overlay.component';

describe('HarborPilotFeedbackFormOverlayComponent', () => {
	let component: HarborPilotFeedbackFormOverlayComponent;
	let fixture: ComponentFixture<HarborPilotFeedbackFormOverlayComponent>;

	beforeEach(async () => {
		await TestBed.configureTestingModule({
			imports: [TranslateModule.forRoot()],
			declarations: [HarborPilotFeedbackFormOverlayComponent]
		}).compileComponents();

		fixture = TestBed.createComponent(HarborPilotFeedbackFormOverlayComponent);
		component = fixture.componentInstance;
		fixture.detectChanges();
	});

	it('should create', () => {
		expect(component).toBeTruthy();
	});

	describe('handleOnSubmit', () => {
		it('should not emit submit event with a form invalid state', () => {
			jest.spyOn(component.submit, 'emit');
			component.handleOnSubmit();
			expect(component.submit.emit).not.toHaveBeenCalled();
		});

		it('should emit submit with a valid form', () => {
			jest.spyOn(component.submit, 'emit');

			component.form.controls.comments.setValue('dummy feedback message');
			component.handleOnSubmit();
			expect(component.submit.emit).toHaveBeenCalledWith({
				sentiment: MessageSentimentType.DOWN,
				comment: 'dummy feedback message'
			});
		});
	});

	describe('handleOnQuickOptionSelected', () => {
		it('should parse quick option selected values to the form quick field', () => {
			jest.spyOn(component.form.controls.quick, 'setValue');

			component.handleOnQuickOptionSelected([
				{
					id: 'not-accurate',
					selected: true
				}
			]);
			expect(component.form.controls.quick.setValue).toHaveBeenCalledWith('CHATBOT.NOT_ACCURATE');
		});
	});
});
