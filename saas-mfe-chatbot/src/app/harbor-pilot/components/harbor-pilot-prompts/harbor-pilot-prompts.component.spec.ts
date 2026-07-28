/*
 * Copyright (C) 2025 Acme Technologies, Inc.  All rights reserved.
 */
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TranslateModule } from '@acme-priv/armada-angular/src/acme/angular/l10n/translation';

import { HarborPilotStore } from '../../harbor-pilot.store';
import { HarborPilotPromptsComponent } from './harbor-pilot-prompts.component';

describe('HarborPilotPromptsComponent', () => {
	let component: HarborPilotPromptsComponent;
	let fixture: ComponentFixture<HarborPilotPromptsComponent>;

	beforeEach(async () => {
		await TestBed.configureTestingModule({
			imports: [HttpClientTestingModule, TranslateModule.forRoot()],
			declarations: [HarborPilotPromptsComponent],
			providers: [HarborPilotStore]
		}).compileComponents();

		fixture = TestBed.createComponent(HarborPilotPromptsComponent);
		component = fixture.componentInstance;
		fixture.detectChanges();
	});

	it('should create', () => {
		expect(component).toBeTruthy();
	});
});
