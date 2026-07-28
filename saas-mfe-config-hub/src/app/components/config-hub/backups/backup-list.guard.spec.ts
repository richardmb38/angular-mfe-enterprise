/*
 * Copyright (C) 2023 Acme Technologies, Inc.  All rights reserved.
 */
import { TestBed } from '@angular/core/testing';
import { ActivatedRouteSnapshot, Router } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';

import { provideMockStore } from '@ngrx/store/testing';
import { of } from 'rxjs';

import { FeatureFlagService } from '@acme-priv/ui-common/src/acme/angular/util';

import { CONFIG_HUB_URL } from '../config-hub.model';
import { checkConnections } from '../shared/utils';
import { tenantConnectionsInitialState } from '../tenant-connections/store/states';
import { ConfigHubBackupListGuard } from './backup-list.guard';

const utils = { checkConnections };

const activatedRouteMock = {
	paramMap: {
		get: () => 'test-id'
	}
} as unknown as ActivatedRouteSnapshot;

describe('ConfigHubBackupListGuard', () => {
	let guard: ConfigHubBackupListGuard;
	let router: Router;

	beforeEach(async () => {
		await TestBed.configureTestingModule({
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
		guard = TestBed.inject(ConfigHubBackupListGuard);
		router = TestBed.inject(Router);
	});

	it('should be created', () => {
		expect(guard).toBeTruthy();
	});

	describe('canActivate()', () => {
		it('should return false and redirect if FF is disabled', async () => {
			(guard as any).isTenantNavEnabled = false;
			jest.spyOn(router, 'navigate').mockImplementation();

			const result = guard.canActivate(activatedRouteMock);
			expect(router.navigate).toHaveBeenCalledWith([CONFIG_HUB_URL]);
			await result.subscribe(data => {
				expect(data).toBe(false);
			});
		});

		it('should return true if FF is enabled', () => {
			(guard as any).isTenantNavEnabled = true;
			jest.spyOn(router, 'navigate').mockImplementation();
			jest.spyOn(utils, 'checkConnections').mockReturnValue(of(true));

			const result = guard.canActivate(activatedRouteMock);
			expect(router.navigate).not.toHaveBeenCalled();
			result.subscribe(data => {
				expect(data).toBe(true);
			});
		});
	});
});
