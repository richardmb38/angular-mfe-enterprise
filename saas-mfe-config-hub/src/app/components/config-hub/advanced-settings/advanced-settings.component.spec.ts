/*
 * Copyright (C) 2023 Acme Technologies, Inc.  All rights reserved.
 */
import { HttpClientModule } from '@angular/common/http';
import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FeatureFlagService } from '@acme-priv/ui-common/src/acme/angular/util';
import { UserRightsService } from '@acme-priv/ui-common/src/acme/angular/util/user-rights';

import { CONFIG_HUB_URL } from '../config-hub.model';
import { ConfigHubAdvancedSettingsComponent } from './advanced-settings.component';
import { CloudStorageGuard } from './cloud-storage.guard';

describe('AdvancedSettingsComponent', () => {
	let component: ConfigHubAdvancedSettingsComponent;
	let fixture: ComponentFixture<ConfigHubAdvancedSettingsComponent>;
	let guard: CloudStorageGuard;
	let featureFlagService: FeatureFlagService;
	let userRightsService: UserRightsService;

	beforeEach(async () => {
		await TestBed.configureTestingModule({
			declarations: [ConfigHubAdvancedSettingsComponent],
			imports: [HttpClientModule],
			providers: [
				CloudStorageGuard,
				{ provide: FeatureFlagService, useClass: FeatureFlagService },
				{ provide: UserRightsService, useClas: UserRightsService }
			]
		}).compileComponents();
		guard = TestBed.inject(CloudStorageGuard);
		featureFlagService = TestBed.inject(FeatureFlagService);
		userRightsService = TestBed.inject(UserRightsService);
	});

	beforeEach(() => {
		fixture = TestBed.createComponent(ConfigHubAdvancedSettingsComponent);
		component = fixture.componentInstance;
		fixture.detectChanges();
	});

	it('should create', () => {
		expect(component).toBeTruthy();
	});

	it('should return true if user has rights', async () => {
		jest.spyOn(userRightsService, 'hasRight').mockResolvedValue(true);

		const result = await (guard as any).canActivate();

		expect(result).toBe(true);
	});

	it('should return false if user does not have rights', async () => {
		jest.spyOn(featureFlagService, 'isEnabled').mockReturnValue(true);
		jest.spyOn(userRightsService, 'hasRight').mockResolvedValue(false);

		const result = await (guard as any).canActivate();

		expect(result).toBe(false);
	});

	it('should navigate to CONFIG_HUB_URL if user does not have rights and feature flag is enabled', async () => {
		jest.spyOn(featureFlagService, 'isEnabled').mockReturnValue(true);
		jest.spyOn(userRightsService, 'hasRight').mockResolvedValue(false);
		const navigateSpy = jest.spyOn((guard as any).router, 'navigate');

		await (guard as any).canActivate();

		expect(navigateSpy).toHaveBeenCalledWith([CONFIG_HUB_URL]);
	});
});
