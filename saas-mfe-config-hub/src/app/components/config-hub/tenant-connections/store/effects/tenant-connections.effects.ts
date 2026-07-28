/*
 * Copyright (C) 2023 Acme Technologies, Inc.  All rights reserved.
 */
import { Injectable } from '@angular/core';

import { Actions, createEffect, ofType } from '@ngrx/effects';
import { Store } from '@ngrx/store';
import { from, of } from 'rxjs';
import { catchError, exhaustMap, filter, map, switchMap, withLatestFrom } from 'rxjs/operators';

import { AppShellWrapperService } from '@acme-priv/ui-common/src/acme/angular/util/app-shell';
import { GlobalService } from '@acme-priv/ui-common/src/acme/angular/util/global';

import { tenantConnectionsApiActions, tenantConnectionsPageActions, tenantConnectionsSidebarActions } from '../actions';
import { fromTenantConnections } from '../selectors';

import { ConfigHubTenantConnectionsService } from '../../../shared/services';

@Injectable()
export class TenantConnectionsEffects {
	/**
	 * When the tenant connections page opens,
	 * determines whether we should attempt to do an initial load of the tenant connections.
	 */
	shouldInitLoadTenantConnections$ = createEffect(() =>
		this.actions$.pipe(
			ofType(
				tenantConnectionsPageActions.tenantConnectionsPageEnter,
				tenantConnectionsSidebarActions.tenantConnectionsSidebarShow
			),
			withLatestFrom(this.store.select(fromTenantConnections.getTenantConnectionsSelectors().selectIsInit)),
			filter(([{}, isInit]) => isInit),
			switchMap(() => of(tenantConnectionsApiActions.tenantConnectionsLoadList()))
		)
	);

	/**
	 * Loads the Tenant connections list
	 */
	loadTenantConnections$ = createEffect(() => {
		return this.actions$.pipe(
			ofType(tenantConnectionsApiActions.tenantConnectionsLoadList),
			exhaustMap(() => {
				return from(this.getCurrentUserId()).pipe(
					switchMap(currentUserId => {
						return this.configHubTenantConnectionsService.listTenantConnections(currentUserId).pipe(
							map(tenantConnections =>
								tenantConnectionsApiActions.tenantConnectionsLoadSuccess({ tenantConnections })
							),
							catchError(errorMessage =>
								of(tenantConnectionsApiActions.TenantConnectionsLoadFailure({ errorMessage }))
							)
						);
					})
				);
			})
		);
	});

	constructor(
		private actions$: Actions,
		private configHubTenantConnectionsService: ConfigHubTenantConnectionsService,
		private store: Store,
		private globalService: GlobalService,
		private appShellWrapperService: AppShellWrapperService
	) {}

	/**
	 * We obtain the external id differently in the MFE environment.
	 * From GlobalService in Non MFE
	 * From UserContext in MFE
	 * This method helps reduce complexity when obtaining the value and using it as a parameter to create new observables
	 */
	async getCurrentUserId(): Promise<string> {
		let currentUser;
		if (this.appShellWrapperService.isMFE()) {
			currentUser = (await this.appShellWrapperService.getUserContextV1()).id;
		} else {
			currentUser = this.globalService.get('userInfo').externalId;
		}
		return currentUser;
	}
}
