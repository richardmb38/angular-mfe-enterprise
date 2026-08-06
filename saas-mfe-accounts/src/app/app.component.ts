/*
 * Copyright (C) 2024 Acme Technologies, Inc.  All rights reserved.
 */
import { Component, VERSION } from '@angular/core';

@Component({
	selector: 'app-root',
	templateUrl: './app.component.html',
	styleUrls: []
})
export class AppComponent {
	public title = 'accounts management mfe';

	public ngVersion = VERSION;

	constructor() {}
}
