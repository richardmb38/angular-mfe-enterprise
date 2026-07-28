/*
 * Copyright (C) 2024 Acme Technologies, Inc.  All rights reserved.
 */
import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TranslateModule } from '@acme-priv/armada-angular/src/acme/angular/l10n/translation';

import { HarborPilotIconButtonComponent } from './harbor-pilot-icon-button.component';

describe('HarborPilotLogoComponent', () => {
	let component: HarborPilotIconButtonComponent;
	let fixture: ComponentFixture<HarborPilotIconButtonComponent>;

	beforeEach(async () => {
		await TestBed.configureTestingModule({
			imports: [HarborPilotIconButtonComponent, TranslateModule.forRoot()]
		}).compileComponents();

		fixture = TestBed.createComponent(HarborPilotIconButtonComponent);
		component = fixture.componentInstance;
		fixture.detectChanges();
	});

	it('should create', () => {
		expect(component).toBeTruthy();
	});
});
