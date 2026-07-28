import { HttpClientTestingModule } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';

import { of } from 'rxjs';

import { TranslateModule } from '@acme-priv/armada-angular/src/acme/angular/l10n/translation';

import { HarborPilotStore } from '../../harbor-pilot.store';
import { HarborPilotService } from '../../shared/services/harbor-pilot.service';
import { HarborPilotFeatureEnableOverlayComponent } from './harbor-pilot-feature-enable-overlay.component';

describe('HarborPilotFeatureEnableOverlayComponent', () => {
	let component: HarborPilotFeatureEnableOverlayComponent;
	let fixture: ComponentFixture<HarborPilotFeatureEnableOverlayComponent>;

	beforeEach(async () => {
		await TestBed.configureTestingModule({
			declarations: [HarborPilotFeatureEnableOverlayComponent],
			imports: [TranslateModule.forRoot(), HttpClientTestingModule],
			providers: [HarborPilotStore]
		}).compileComponents();

		fixture = TestBed.createComponent(HarborPilotFeatureEnableOverlayComponent);
		component = fixture.componentInstance;
		fixture.detectChanges();
	});

	it('should create', () => {
		expect(component).toBeTruthy();
	});

	describe('onEnableAndContinue', () => {
		it('should call updateHarborPilotOnSystemSettings and emit dismiss if harborPilotEnabled is true', () => {
			const harborPilotService = TestBed.inject(HarborPilotService);
			const updateHarborPilotOnSystemSettingsSpy = jest
				.spyOn(harborPilotService, 'updateHarborPilotOnSystemSettings')
				.mockReturnValue(of({ harborPilotEnabled: true }));

			component.onEnableAndContinue();

			expect(updateHarborPilotOnSystemSettingsSpy).toHaveBeenCalled();
		});
	});

	describe('onCancel', () => {
		it('should set isOpen to false', () => {
			const harborPilotStore = TestBed.inject(HarborPilotStore);
			const setOpenSpy = jest.spyOn(harborPilotStore, 'setOpen');

			component.onCancel();

			expect(setOpenSpy).toHaveBeenCalledWith(false);
		});
	});
});
