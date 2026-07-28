/*
 * Copyright (C) 2023 Acme Technologies, Inc.  All rights reserved.
 */
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { TestBed, fakeAsync, flush, tick } from '@angular/core/testing';
import { ActivatedRouteSnapshot, Router } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';

import { TranslateModule } from '@acme-priv/armada-angular/src/acme/angular/l10n/translation';

import { FeatureFlagService } from '@acme-priv/ui-common/src/acme/angular/util/feature-flag';
import { ROLE, UserInfoService } from '@acme-priv/ui-common/src/acme/angular/util/user-info';
import { UserRightsService } from '@acme-priv/ui-common/src/acme/angular/util/user-rights';

import { ConfigHubGuard } from './config-hub.guard';
import { ConfigHubRoles } from './shared/models/config-hub.model';

describe('ConfigHubGuard', () => {
	let configHubGuard: ConfigHubGuard;
	let router: Router;
	let featureFlagService: FeatureFlagService;
	let userRightsService: UserRightsService;

	const mockActivatedRouteSnapshot = new ActivatedRouteSnapshot();
	mockActivatedRouteSnapshot.data = { legacyRoles: [ROLE.ORG_ADMIN], rights: [ConfigHubRoles.PAGE_READ] };

	beforeEach(() => {
		TestBed.configureTestingModule({
			imports: [RouterTestingModule, TranslateModule.forRoot(), HttpClientTestingModule],
			providers: [FeatureFlagService, UserInfoService, UserRightsService]
		}).compileComponents();

		configHubGuard = TestBed.inject(ConfigHubGuard);
		router = TestBed.inject(Router);
		featureFlagService = TestBed.inject(FeatureFlagService);
		userRightsService = TestBed.inject(UserRightsService);
	});

	describe('canActivate()', () => {
		it('should return false and redirect if FF is disabled', done => {
			jest.spyOn(featureFlagService, 'isEnabled').mockReturnValue(false);
			jest.spyOn(router, 'navigateByUrl').mockImplementation();

			configHubGuard.canActivate(mockActivatedRouteSnapshot).then(result => {
				expect(router.navigateByUrl).toHaveBeenCalled();
				expect(result).toBeFalsy();
				done();
			});
		});

		it('should return true if the custom right exists', fakeAsync(() => {
			jest.spyOn(featureFlagService, 'isEnabled').mockReturnValue(true);
			jest.spyOn(router, 'navigateByUrl').mockImplementation();
			jest.spyOn(userRightsService, 'hasAnyRight').mockReturnValue(new Promise(() => true));
			(configHubGuard as any).isConfigHubLegacyFlagEnabled = false;
			const canActivateAsync = configHubGuard.canActivate(mockActivatedRouteSnapshot);
			tick();
			canActivateAsync.then(result => {
				expect(userRightsService.hasAnyRight).toHaveBeenCalledWith(ConfigHubRoles.PAGE_READ);
				expect(result).toBe(true);
				flush();
			});
		}));
	});
});
