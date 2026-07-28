/*
 * Copyright (C) 2023 Acme Technologies, Inc.  All rights reserved.
 */
import { TestBed } from '@angular/core/testing';
import { ActivatedRouteSnapshot, Router, RouterStateSnapshot } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';

import { StoreModule, createSelector } from '@ngrx/store';
import { provideMockStore } from '@ngrx/store/testing';

import { TranslateModule } from '@acme-priv/armada-angular/src/acme/angular/l10n/translation';

import { fromDraftsPage } from '../store/selectors';

import { CONFIG_HUB_URL, ConfigHubChildRoutes } from '../../config-hub.model';
import { ObjectOperationType } from '../../shared/models';
import { DraftsChildRoutes } from '../drafts.model';
import { draftsPageInitialState } from '../store/states';
import { ConfigHubDraftDetailsGuard } from './draft-details.guard';

describe('ConfigHubDraftDetailsGuard', () => {
	let configHubDraftDetailsGuard: ConfigHubDraftDetailsGuard;
	let router: Router;

	const selectSelectedObjectTypeSpy = jest.spyOn(fromDraftsPage, 'selectSelectedObjectType');
	const selectAvailableOperationTypesSpy = jest.spyOn(fromDraftsPage, 'selectAvailableOperationTypes');

	const urlSegments = [
		...CONFIG_HUB_URL.split('/'),
		ConfigHubChildRoutes.DRAFTS?.route,
		...DraftsChildRoutes.DETAILS.route.split('/')
	];

	const mockActivatedRouteSnapshot = {} as ActivatedRouteSnapshot;

	const mockRouterStateSnapshot = {
		url: urlSegments.join('/')
	} as RouterStateSnapshot;

	beforeEach(() => {
		selectSelectedObjectTypeSpy.mockReturnValue('ACCESS_PROFILES');
		selectAvailableOperationTypesSpy.mockImplementation(
			() =>
				createSelector(
					() => null,
					() => null,
					() => [ObjectOperationType.ADDED]
				) as any
		);

		TestBed.configureTestingModule({
			imports: [StoreModule.forRoot([]), RouterTestingModule, TranslateModule.forRoot()],
			providers: [
				provideMockStore({
					initialState: draftsPageInitialState
				}),
				{ provide: ActivatedRouteSnapshot, useValue: mockActivatedRouteSnapshot },
				{ provide: RouterStateSnapshot, useValue: mockRouterStateSnapshot }
			]
		}).compileComponents();

		configHubDraftDetailsGuard = TestBed.inject(ConfigHubDraftDetailsGuard);
		router = TestBed.inject(Router);
	});

	describe('canActivate()', () => {
		it('should return true if the store has a selectedObjectType and available operation types', async () => {
			jest.spyOn(router, 'navigate').mockImplementation();

			const result = configHubDraftDetailsGuard.canActivate(mockActivatedRouteSnapshot, mockRouterStateSnapshot);
			expect(router.navigate).not.toHaveBeenCalled();
			expect(result).toBeTruthy();
		});

		it('should return false and redirect the store has no selectedObjectType', async () => {
			selectSelectedObjectTypeSpy.mockReturnValue(null as any);
			jest.spyOn(router, 'navigate').mockImplementation();

			const result = await configHubDraftDetailsGuard.canActivate(
				mockActivatedRouteSnapshot,
				mockRouterStateSnapshot
			);

			expect(router.navigate).toHaveBeenCalledWith(urlSegments.slice(0, -1));
			expect(result).toBeFalsy();
		});

		it('should return false and redirect the store has no available operation types', async () => {
			selectAvailableOperationTypesSpy.mockImplementation(
				() =>
					createSelector(
						() => null,
						() => null,
						() => []
					) as any
			);
			jest.spyOn(router, 'navigate').mockImplementation();
			const result = await configHubDraftDetailsGuard.canActivate(
				mockActivatedRouteSnapshot,
				mockRouterStateSnapshot
			);

			expect(router.navigate).toHaveBeenCalledWith(urlSegments.slice(0, -1));
			expect(result).toBeFalsy();
		});
	});
});
