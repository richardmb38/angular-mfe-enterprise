/*
 * Copyright (C) 2023 Acme Technologies, Inc.  All rights reserved.
 */
import { TestBed } from '@angular/core/testing';
import { ActivatedRouteSnapshot, Router } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';

import { provideMockStore } from '@ngrx/store/testing';

import { FeatureFlagService } from '@acme-priv/ui-common/src/acme/angular/util';

import { CONFIG_HUB_URL } from '../config-hub.model';
import { tenantConnectionsInitialState } from '../tenant-connections/store/states';
import { ConfigHubBackupDetailsGuard } from './backup-details.guard';

const activatedRouteMock = {
	paramMap: {
		get: () => 'test-id'
	}
} as unknown as ActivatedRouteSnapshot;

describe('ConfigHubBackupDetailsGuard', () => {
	let guard: ConfigHubBackupDetailsGuard;
	let router: Router;

	beforeEach(() => {
		TestBed.configureTestingModule({
			imports: [RouterTestingModule],
			providers: [
				FeatureFlagService,
				{
					provide: ActivatedRouteSnapshot,
					useValue: activatedRouteMock
				},
				provideMockStore({
					initialState: tenantConnectionsInitialState
				})
			]
		});
		guard = TestBed.inject(ConfigHubBackupDetailsGuard);
		router = TestBed.inject(Router);
	});

	it('should be created', () => {
		expect(guard).toBeTruthy();
	});

	describe('canActivate()', () => {
		it('should return false and redirect if FF is disabled', done => {
			(guard as any).isBackupDetailsEnabled = false;
			jest.spyOn(router, 'navigate').mockImplementation();
			const result = guard.canActivate();

			expect(router.navigate).toHaveBeenCalledWith([CONFIG_HUB_URL]);

			result.subscribe(data => {
				expect(data).toBe(false);
				done();
			});
		});

		it('should return true if FF is enabled', done => {
			(guard as any).isBackupDetailsEnabled = true;
			const result = guard.canActivate();

			result.subscribe(data => {
				expect(data).toBe(true);
				done();
			});
		});
	});
});
