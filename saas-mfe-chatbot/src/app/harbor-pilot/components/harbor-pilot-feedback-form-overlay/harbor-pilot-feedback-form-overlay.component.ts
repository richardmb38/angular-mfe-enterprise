/*
 * Copyright (C) 2024 Acme Technologies, Inc.  All rights reserved.
 */
import { Component, EventEmitter, Output } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';

import {
	QuickFilterBase,
	QuickFilterOptions
} from '@acme-priv/armada-angular/src/acme/angular/components/quick-filter';
import { TranslateService } from '@acme-priv/armada-angular/src/acme/angular/l10n/translation';

import { HarborPilotMessageFeedback, MessageSentimentType } from 'app/harbor-pilot/shared/models/messages.model';

@Component({
	selector: 'app-harbor-pilot-feedback-form-overlay',
	templateUrl: './harbor-pilot-feedback-form-overlay.component.html',
	styleUrls: ['./harbor-pilot-feedback-form-overlay.component.scss']
})
export class HarborPilotFeedbackFormOverlayComponent {
	@Output() submit: EventEmitter<HarborPilotMessageFeedback> = new EventEmitter();

	@Output() cancel: EventEmitter<boolean> = new EventEmitter();

	/**
	 * Form group for the dimension basic configuration step
	 */
	public form: FormGroup;

	/**
	 * Quick select options to for feedback comments.
	 *
	 * @type {QuickFilterOptions[]}
	 * @memberof HarborPilotFeedbackFormOverlayComponent
	 */
	public readonly QUICK_FEEDBACK_OPTIONS: QuickFilterOptions[] = [
		{
			id: 'not-expected',
			label: 'CHATBOT.NOT_WHAT_I_EXPECTED'
		},
		{
			id: 'not-accurate',
			label: 'CHATBOT.NOT_ACCURATE'
		},
		{
			id: 'too-slow',
			label: 'CHATBOT.TOOK_TOO_LONG'
		}
	];

	private readonly QUICK_FEEDBACK_OPTIONS_MAP = {
		'not-expected': 'CHATBOT.NOT_WHAT_I_EXPECTED',
		'not-accurate': 'CHATBOT.NOT_ACCURATE',
		'too-slow': 'CHATBOT.TOOK_TOO_LONG'
	};

	constructor(
		private fb: FormBuilder,
		private translateService: TranslateService
	) {
		this.form = this.fb.group(
			{
				comments: '',
				quick: ''
			},
			{
				validators: formGroup => {
					const group = formGroup as unknown as FormGroup;
					return group.controls.comments.value || group.controls.quick.value ? null : { invalid: true };
				}
			}
		);
	}

	/**
	 * Handle's form submit.
	 */
	handleOnSubmit() {
		if (this.form.invalid) {
			return;
		}

		this.submit.emit({
			sentiment: MessageSentimentType.DOWN,
			comment: `${this.form.controls.quick.value} ${this.form.controls.comments.value}`.trimStart()
		});
	}

	/**
	 * Handle's quick feedback option selected.
	 */
	handleOnQuickOptionSelected(filters: QuickFilterBase[]) {
		const selected = filters.reduce((result, filter) => {
			if (filter.selected) {
				const value = this.QUICK_FEEDBACK_OPTIONS_MAP[filter.id];
				result.push(this.translateService.instant(value));
			}
			return result;
		}, []);
		this.form.controls.quick.setValue(selected.length ? selected.join(' ') : '');
	}
}
