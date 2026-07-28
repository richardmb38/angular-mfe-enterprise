/*
 * Copyright (C) 2023 Acme Technologies, Inc.  All rights reserved.
 */
import { createReducer, on } from '@ngrx/store';

import { RequestState } from '@acme-priv/ui-common/src/acme/angular/util';

import { tenantConnectionsApiActions, tenantConnectionsSidebarActions } from '../actions';

import { TenantConnectionsState, tenantConnectionsAtomicAdapter, tenantConnectionsInitialState } from '../states';

export const TenantConnectionsReducer = createReducer(
	tenantConnectionsInitialState,

	on(tenantConnectionsSidebarActions.tenantConnectionsSidebarLeave, () => ({ ...tenantConnectionsInitialState })),

	/**
	 * Tenant Connections List
	 */
	on(
		tenantConnectionsApiActions.tenantConnectionsLoadList,
		(state): TenantConnectionsState => ({
			...state,
			tenantConnections: {
				...state.tenantConnections,
				requestState: RequestState.LOADING
			}
		})
	),

	on(
		tenantConnectionsApiActions.tenantConnectionsLoadSuccess,
		(state, { tenantConnections }): TenantConnectionsState => ({
			...state,
			tenantConnections: tenantConnectionsAtomicAdapter.addMany(tenantConnections.items, {
				...state.tenantConnections,
				requestState: RequestState.RESOLVED
			})
		})
	),

	on(
		tenantConnectionsApiActions.TenantConnectionsLoadFailure,
		(state, { errorMessage }): TenantConnectionsState => ({
			...state,
			tenantConnections: {
				...state.tenantConnections,
				requestState: { errorMsg: errorMessage }
			}
		})
	),

	/**
	 * Sidebar Actions
	 */

	on(
		tenantConnectionsSidebarActions.tenantConnectionsSidebarSelect,
		(state, { tenantConnectionId }): TenantConnectionsState => ({
			...state,
			selectedSidebarConnection: tenantConnectionId
		})
	),

	on(
		tenantConnectionsSidebarActions.tenantConnectionsSidebarLeave,
		(state): TenantConnectionsState => ({
			...state,
			selectedSidebarConnection: null
		})
	),

	/**
	 * Tenant Connection Delettion list
	 */
	on(
		tenantConnectionsApiActions.tenantConnectionsDelete,
		(state): TenantConnectionsState => ({
			...state,
			tenantConnections: {
				...state.tenantConnections,
				requestState: RequestState.LOADING
			}
		})
	),

	on(
		tenantConnectionsApiActions.tenantConnectionDeleteSuccess,
		(state, { tenantConnection }): TenantConnectionsState => ({
			...state,
			tenantConnections: tenantConnectionsAtomicAdapter.removeOne(tenantConnection, {
				...state.tenantConnections,
				equestState: RequestState.RESOLVED
			})
		})
	),

	on(
		tenantConnectionsApiActions.tenantConnectionDeleteFailure,
		(state, { errorMessage }): TenantConnectionsState => ({
			...state,
			tenantConnections: {
				...state.tenantConnections,
				requestState: { errorMsg: errorMessage }
			}
		})
	)
);
