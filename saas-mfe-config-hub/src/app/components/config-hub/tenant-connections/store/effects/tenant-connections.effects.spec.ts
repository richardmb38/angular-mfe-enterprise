/*
 * Copyright (C) 2023 Acme Technologies, Inc.  All rights reserved.
 */
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';

import { EffectsModule } from '@ngrx/effects';
import { provideMockActions } from '@ngrx/effects/testing';
import { provideMockStore } from '@ngrx/store/testing';
import { ReplaySubject, of, throwError } from 'rxjs';

import { GlobalService, MemoizedAtomicStateSelectors } from '@acme-priv/ui-common/src/acme/angular/util';

import { tenantConnectionsApiActions, tenantConnectionsPageActions } from '../actions';
import { fromTenantConnections } from '../selectors';
import { TenantConnectionsEffects } from './tenant-connections.effects';

import { ConfigHubTenantConnection, mockConfigHubTenantConnectionsList } from '../../../shared/models';
import { ConfigHubTenantConnectionsService } from '../../../shared/services';
import { tenantConnectionsInitialState } from '../states';

describe('TenantConnectionsEffects', () => {
	let actions$: ReplaySubject<any>;
	let tenantConnectionsEffects: TenantConnectionsEffects;
	let configHubTenantConnectionsService: ConfigHubTenantConnectionsService;
	let globalService: GlobalService;

	const errorMessage = 'Error!';

	const mockApiListResponse = {
		items: mockConfigHubTenantConnectionsList,
		offset: 0,
		limit: 6,
		count: 12
	};

	beforeEach(() => {
		// Because of the factory selectors, we need to spy on these *before* compilingComponents.
		jest.spyOn(fromTenantConnections, 'getTenantConnectionsSelectors').mockReturnValue({
			selectIsInit: () => true
		} as unknown as MemoizedAtomicStateSelectors<ConfigHubTenantConnection, object>);

		TestBed.configureTestingModule({
			imports: [RouterTestingModule, HttpClientTestingModule, EffectsModule.forRoot([TenantConnectionsEffects])],
			providers: [
				provideMockStore({ initialState: tenantConnectionsInitialState }),
				provideMockActions(() => actions$),
				TenantConnectionsEffects,
				ConfigHubTenantConnectionsService,
				GlobalService
			]
		}).compileComponents();

		tenantConnectionsEffects = TestBed.inject(TenantConnectionsEffects);
		configHubTenantConnectionsService = TestBed.inject(ConfigHubTenantConnectionsService);
		globalService = TestBed.inject(GlobalService);

		actions$ = new ReplaySubject(1);
	});

	describe('shouldInitLoadTenantConnections$', () => {
		it('should dispatch tenantConnectionsLoadList if the tenant list request state is INIT', done => {
			actions$.next(tenantConnectionsPageActions.tenantConnectionsPageEnter());
			tenantConnectionsEffects.shouldInitLoadTenantConnections$.subscribe(action => {
				expect(action).toEqual(tenantConnectionsApiActions.tenantConnectionsLoadList());
				done();
			});
		});
	});

	describe('loadTenantConnections$', () => {
		it('should dispatch tenantConnectionsLoadSuccess upon successful loading of the tenant connections list', done => {
			jest.spyOn(configHubTenantConnectionsService, 'listTenantConnections').mockReturnValue(
				of(mockApiListResponse)
			);
			jest.spyOn(globalService, 'get').mockReturnValue({ uid: 'user', externalId: 'user' });

			actions$.next(tenantConnectionsApiActions.tenantConnectionsLoadList());
			tenantConnectionsEffects.loadTenantConnections$.subscribe(action => {
				mockApiListResponse.items = [mockApiListResponse.items[0]];
				expect(action).toEqual(
					tenantConnectionsApiActions.tenantConnectionsLoadSuccess({ tenantConnections: mockApiListResponse })
				);
				done();
			});
		});

		it('should dispatch TenantConnectionsLoadFailure upon failure loading the tenant connections list', done => {
			jest.spyOn(globalService, 'get').mockReturnValue({ uid: 'user', externalId: 'user' });
			jest.spyOn(configHubTenantConnectionsService, 'listTenantConnections').mockReturnValue(
				throwError(() => errorMessage)
			);

			actions$.next(tenantConnectionsApiActions.tenantConnectionsLoadList());
			tenantConnectionsEffects.loadTenantConnections$.subscribe(action => {
				expect(action).toEqual(
					tenantConnectionsApiActions.TenantConnectionsLoadFailure({
						errorMessage: errorMessage
					})
				);
				done();
			});
		});
	});
});
