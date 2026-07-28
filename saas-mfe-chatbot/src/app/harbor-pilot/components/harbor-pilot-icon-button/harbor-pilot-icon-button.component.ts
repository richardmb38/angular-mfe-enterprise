/*
 * Copyright (C) 2024 Acme Technologies, Inc.  All rights reserved.
 */
import { CommonModule } from '@angular/common';
import { Component, input } from '@angular/core';

import {
	IconLighthouseModule,
	IconModule
} from '@acme-priv/armada-angular/src/acme/angular/components/icons';

import { HarborPilotMessage } from 'app/harbor-pilot/shared/models/messages.model';

@Component({
	standalone: true,
	selector: 'app-harbor-pilot-icon-button',
	templateUrl: './harbor-pilot-icon-button.component.html',
	styleUrl: './harbor-pilot-icon-button.component.scss',
	imports: [CommonModule, IconModule, IconLighthouseModule]
})
export class HarborPilotIconButtonComponent {
	/**
	 * Flag for whether the debugger log should be displayed or not.
	 */
	debugger = input(false);

	/**
	 * Message data to feed the debugger if enabled.
	 */
	message = input<HarborPilotMessage | null>(null);

	/**
	 * The size of the icon button
	 */
	size = input<'small' | 'medium' | 'large'>('small');

	/**
	 * Whether the icon logo should be filled or not.
	 */
	fill = input(true);

	/**
	 * A map of button sizes. The key is the size and the value is an object with the button and icon dimensions.
	 */
	readonly BUTTON_SIZES = new Map([
		[
			'small',
			{
				background: {
					width: '22px',
					height: '30px'
				},
				icon: {
					width: '20',
					height: '16'
				}
			}
		],
		[
			'medium',
			{
				background: {
					width: '27.6px',
					height: '36px'
				},
				icon: {
					width: '24',
					height: '36'
				}
			}
		],
		[
			'large',
			{
				background: {
					width: '140px',
					height: '140px'
				},
				icon: {
					width: '80',
					height: '64'
				}
			}
		]
	]);

	/**
	 * Emits the click event
	 */
	onClick(): void {
		// If Debugger is active console logs the data of the message clicked.
		if (this.debugger()) {
			const debuggerData = `
			-> Session ID: ${this.message()?.sessionId || 'No session ID recorded'}
			-> Request ID: ${this.message()?.requestId || 'No request ID recorded'}
			-> Message Data: ${JSON.stringify(this.message) || 'Empty Data'}
			`;
			// eslint-disable-next-line no-console
			console.log(debuggerData);
		}
	}
}
