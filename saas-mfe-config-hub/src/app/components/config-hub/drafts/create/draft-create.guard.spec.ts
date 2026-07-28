/*
 * Copyright (C) 2023 Acme Technologies, Inc.  All rights reserved.
 */
import { TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';

import { TranslateModule } from '@acme-priv/armada-angular/src/acme/angular/l10n/translation';

import { ConfigHubDraftCreateGuard } from './draft-create.guard';

describe('ConfigHubDraftCreateGuard', () => {
	let configHubDraftCreateGuard: ConfigHubDraftCreateGuard;
	let router: Router;

	beforeEach(() => {
		TestBed.configureTestingModule({
			imports: [RouterTestingModule, TranslateModule.forRoot()]
		}).compileComponents();

		configHubDraftCreateGuard = TestBed.inject(ConfigHubDraftCreateGuard);
		router = TestBed.inject(Router);
	});

	describe('canActivate()', () => {
		it('should return false and redirect if router state is not available', () => {
			jest.spyOn(router, 'getCurrentNavigation').mockReturnValue({
				extras: {
					state: null
				}
			} as any);
			jest.spyOn(router, 'navigate').mockImplementation();

			const result = configHubDraftCreateGuard.canActivate();
			expect(router.navigate).toHaveBeenCalled();
			expect(result).toBeFalsy();
		});

		it('should return true if router state is available', () => {
			jest.spyOn(router, 'getCurrentNavigation').mockReturnValue({
				extras: {
					state: {
						sourceBackupId: 'any-id'
					}
				}
			} as any);
			jest.spyOn(router, 'navigate').mockImplementation();

			const result = configHubDraftCreateGuard.canActivate();
			expect(router.navigate).not.toHaveBeenCalled();
			expect(result).toBeTruthy();
		});
	});
});
