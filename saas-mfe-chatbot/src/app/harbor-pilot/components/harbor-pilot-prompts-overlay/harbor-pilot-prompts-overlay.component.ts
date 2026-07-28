/*
 * Copyright (C) 2025 Acme Technologies, Inc.  All rights reserved.
 */
import { Component, output } from '@angular/core';

@Component({
	selector: 'app-harbor-pilot-prompts-overlay',
	templateUrl: './harbor-pilot-prompts-overlay.component.html',
	styleUrl: './harbor-pilot-prompts-overlay.component.scss'
})
export class HarborPilotPromptsOverlayComponent {
	dismiss = output();
}
