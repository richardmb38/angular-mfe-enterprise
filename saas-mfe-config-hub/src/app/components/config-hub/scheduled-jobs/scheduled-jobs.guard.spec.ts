/*
 * Copyright (C) 2023 Acme Technologies, Inc.  All rights reserved.
 */
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';

import { TranslateModule } from '@acme-priv/armada-angular/src/acme/angular/l10n/translation';

import { FeatureFlagService } from '@acme-priv/ui-common/src/acme/angular/util/feature-flag';
import { UserInfoService } from '@acme-priv/ui-common/src/acme/angular/util/user-info';
import { UserRightsService } from '@acme-priv/ui-common/src/acme/angular/util/user-rights';

import { ConfigHubScheduledJobsGuard } from './scheduled-jobs.guard';

describe('ConfigHubScheduledJobsGuard', () => {
	let configHubScheduledJobsGuard: ConfigHubScheduledJobsGuard;
	let router: Router;
	let featureFlagService: FeatureFlagService;
	let userRightsService: UserRightsService;

	beforeEach(() => {
		TestBed.configureTestingModule({
			imports: [RouterTestingModule, TranslateModule.forRoot(), HttpClientTestingModule],
			providers: [FeatureFlagService, UserInfoService, UserRightsService]
		}).compileComponents();

		configHubScheduledJobsGuard = TestBed.inject(ConfigHubScheduledJobsGuard);
		router = TestBed.inject(Router);
		featureFlagService = TestBed.inject(FeatureFlagService);
		userRightsService = TestBed.inject(UserRightsService);
	});

	describe('canActivate()', () => {
		it('should return false and redirect if FF is disabled', done => {
			jest.spyOn(featureFlagService, 'isEnabled').mockReturnValue(false);
			jest.spyOn(userRightsService, 'hasRight').mockResolvedValue(true);
			jest.spyOn(router, 'navigateByUrl').mockImplementation();

			configHubScheduledJobsGuard.canActivate().then(result => {
				expect(router.navigateByUrl).toHaveBeenCalled();
				expect(result).toBeFalsy();
				done();
			});
		});

		it('should return false and redirect if user does not have the correct right', done => {
			jest.spyOn(featureFlagService, 'isEnabled').mockReturnValue(true);
			jest.spyOn(userRightsService, 'hasRight').mockResolvedValue(false);
			jest.spyOn(router, 'navigateByUrl').mockImplementation();

			configHubScheduledJobsGuard.canActivate().then(result => {
				expect(router.navigateByUrl).toHaveBeenCalled();
				expect(result).toBeFalsy();
				done();
			});
		});

		it('should return true and not redirect if FF is enabled ans user has the correct right', done => {
			jest.spyOn(featureFlagService, 'isEnabled').mockReturnValue(true);
			jest.spyOn(userRightsService, 'hasRight').mockResolvedValue(true);
			jest.spyOn(router, 'navigateByUrl').mockImplementation();

			configHubScheduledJobsGuard.canActivate().then(result => {
				expect(router.navigateByUrl).not.toHaveBeenCalled();
				expect(result).toBeTruthy();
				done();
			});
		});
	});
});
