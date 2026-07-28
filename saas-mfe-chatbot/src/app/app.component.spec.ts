/*
 * Copyright (C) 2024 Acme Technologies, Inc.  All rights reserved.
 */
import { HttpClientModule } from '@angular/common/http';
import { TestBed } from '@angular/core/testing';

import { TranslateModule } from '@acme-priv/armada-angular/src/acme/angular/l10n/translation';

import { AppComponent } from './app.component';
import { HarborPilotModule } from './harbor-pilot/harbor-pilot.module';

describe('AppComponent', () => {
	beforeEach(async () => {
		await TestBed.configureTestingModule({
			imports: [HarborPilotModule, HttpClientModule, TranslateModule.forRoot()],
			declarations: [AppComponent]
		}).compileComponents();
	});

	it('should create the app', () => {
		const fixture = TestBed.createComponent(AppComponent);
		const app = fixture.componentInstance;
		expect(app).toBeTruthy();
	});
});
