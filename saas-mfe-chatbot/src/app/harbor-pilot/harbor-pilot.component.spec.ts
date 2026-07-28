/*
 * Copyright (C) 2025 Acme Technologies, Inc.  All rights reserved.
 */

/* eslint-disable @typescript-eslint/no-explicit-any */
import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterModule } from '@angular/router';

import { TranslateModule } from '@acme-priv/armada-angular/src/acme/angular/l10n/translation';

import { LayerManagerService } from '@acme-priv/ui-common/src/acme/angular/util/app-shell';

import { HarborPilotOverlayModule } from './components/harbor-pilot-overlay/harbor-pilot-overlay.module';
import { HarborPilotComponent } from './harbor-pilot.component';
import { HarborPilotService } from './shared/services/harbor-pilot.service';

describe('HarborPilotComponent', () => {
	let component: HarborPilotComponent;
	let fixture: ComponentFixture<HarborPilotComponent>;
	let layerManagerService: LayerManagerService;

	const harborPilotIconButtonElementRefMock = {
		nativeElement: {}
	};

	beforeEach(async () => {
		await TestBed.configureTestingModule({
			imports: [
				CommonModule,
				HttpClientModule,
				HarborPilotOverlayModule,
				TranslateModule.forRoot(),
				RouterModule.forRoot([])
			],
			declarations: [HarborPilotComponent],
			providers: [
				{
					provide: HarborPilotService,
					useValue: {
						isHarborPilotEnabled: jest.fn(() => Promise.resolve(true)),
						isHarborPilotEnabledOnSystemSettings: jest.fn(() => Promise.resolve(false)),
						getOrgConfig: jest.fn(() => {
							return {
								harborPilotEnabled: true
							};
						})
					}
				}
			]
		}).compileComponents();
		fixture = TestBed.createComponent(HarborPilotComponent);
		component = fixture.componentInstance;
		fixture.detectChanges();
		layerManagerService = TestBed.inject(LayerManagerService);
	});

	it('should create', () => {
		expect(component).toBeTruthy();
	});

	describe('ngOnInit', () => {
		it('should set the isEnabled value to true if all flag, licenses and configuration evaluations returned true', async () => {
			await component.ngOnInit();

			expect(component.isEnabled()).toBe(true);
			expect(component.isTermsDisclaimerShown()).toBe(false);
		});

		it('should relocate the trigger button if all flag, licenses and configuration evaluations returned true', async () => {
			jest.useFakeTimers();
			jest.spyOn(component, 'relocateTriggerButton');

			await component.ngOnInit();
			jest.runAllTimers();

			expect(component.relocateTriggerButton).toHaveBeenCalled();
		});
	});

	describe('relocateTriggerButton', () => {
		it('should call layer manager service onActivate', () => {
			const onActivateSpy = jest.spyOn(layerManagerService, 'onActivate').mockImplementation(() => {
				return Promise.resolve();
			});

			component.buttonReference = harborPilotIconButtonElementRefMock as never;
			component.relocateTriggerButton();

			expect(onActivateSpy).toHaveBeenCalled();
		});
	});

	describe('onTriggerButtonClick', () => {
		it('should toggle the isChatOverlayOpen value', () => {
			component.onTriggerButtonClick();
			expect(component.isOpen()).toEqual(false);
		});
	});

	describe('onDismiss', () => {
		it('should set isChatOverlayOpen to false', () => {
			component.onDismiss();
			expect(component.isOpen()).toEqual(false);
		});
	});
});
