/*
 * Copyright (C) 2025 Acme Technologies, Inc.  All rights reserved.
 */
import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TranslateModule } from '@acme-priv/armada-angular/src/acme/angular/l10n/translation';

import { HarborPilotPromptsOverlayComponent } from './harbor-pilot-prompts-overlay.component';

describe('HarborPilotPromptsOverlayComponent', () => {
	let component: HarborPilotPromptsOverlayComponent;
	let fixture: ComponentFixture<HarborPilotPromptsOverlayComponent>;

	beforeEach(async () => {
		await TestBed.configureTestingModule({
			imports: [TranslateModule.forRoot()],
			declarations: [HarborPilotPromptsOverlayComponent]
		}).compileComponents();

		fixture = TestBed.createComponent(HarborPilotPromptsOverlayComponent);
		component = fixture.componentInstance;
		fixture.detectChanges();
	});

	it('should create', () => {
		expect(component).toBeTruthy();
	});
});
