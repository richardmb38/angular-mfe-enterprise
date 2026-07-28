import { HttpClientTestingModule } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';

import { of } from 'rxjs';

import { FeatureFlagService, ProductFlagService } from '@acme-priv/ui-common/src/acme/angular/util';
import { UserRightsService } from '@acme-priv/ui-common/src/acme/angular/util/user-rights';

import { HarborPilotService } from './harbor-pilot.service';

describe('HarborPilotService', () => {
	let service: HarborPilotService;
	let featureFlagService: FeatureFlagService;
	let userRightsService: UserRightsService;
	let productFlagService: ProductFlagService;

	beforeEach(() => {
		TestBed.configureTestingModule({
			imports: [HttpClientTestingModule],
			providers: [HarborPilotService]
		}).compileComponents();

		service = TestBed.inject(HarborPilotService);
		featureFlagService = TestBed.inject(FeatureFlagService);
		userRightsService = TestBed.inject(UserRightsService);
		productFlagService = TestBed.inject(ProductFlagService);

		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		jest.spyOn(service as any, 'getOrgConfig').mockReturnValue(of({ harborPilotEnabled: true }));
	});

	it('should be created', () => {
		expect(service).toBeTruthy();
	});

	describe('isHarborPilotEnabled', () => {
		it('should return true if all flag, licenses and configuration evaluations returned true', async () => {
			jest.spyOn(featureFlagService, 'isEnabled').mockReturnValue(true);
			jest.spyOn(userRightsService, 'hasRight').mockResolvedValue(true);
			jest.spyOn(productFlagService, 'isEnabledAsync').mockResolvedValue(true);

			expect(await service.isHarborPilotEnabled()).toBe(true);
		});

		it('should return false if any of the flag, licenses and configuration evaluations returned false', async () => {
			jest.spyOn(featureFlagService, 'isEnabled').mockReturnValue(false);

			expect(await service.isHarborPilotEnabled()).toBe(false);
		});
	});

	describe('isHarborPilotEnabledOnSystemSettings', () => {
		it('should return true if harborPilotEnabled is true', async () => {
			expect(await service.isHarborPilotEnabledOnSystemSettings()).toBe(true);
		});

		it('should return false if harborPilotEnabled is false', async () => {
			// eslint-disable-next-line @typescript-eslint/no-explicit-any
			jest.spyOn(service as any, 'getOrgConfig').mockReturnValue(of({ harborPilotEnabled: false }));

			expect(await service.isHarborPilotEnabledOnSystemSettings()).toBe(false);
		});
	});

	describe('updateHarborPilotOnSystemSettings', () => {
		it('should call patch method with the correct parameters', () => {
			const patchSpy = jest.spyOn(service, 'patch');

			service.updateHarborPilotOnSystemSettings(true).subscribe(() => {
				expect(patchSpy).toHaveBeenCalledWith('', [
					{ op: 'replace', path: '/harborPilotEnabled', value: true }
				]);
			});
		});
	});
});
