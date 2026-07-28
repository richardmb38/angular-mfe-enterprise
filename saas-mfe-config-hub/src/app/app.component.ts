/*
 * Copyright (C) 2024 Acme Technologies, Inc.  All rights reserved.
 */
import { Component } from '@angular/core';

import { UI_CONFIG_HUB_LOADING_MASK_ID } from './shared/models/app-loading-mask.model';

@Component({
	selector: 'app-config-hub-root',
	templateUrl: './app.component.html',
	styleUrls: []
})
export class AppComponent {
	public loadingMaskId = UI_CONFIG_HUB_LOADING_MASK_ID;

	constructor() {}
}
