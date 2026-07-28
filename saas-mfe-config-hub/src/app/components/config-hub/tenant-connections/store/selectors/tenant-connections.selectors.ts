/*
 * Copyright (C) 2023 Acme Technologies, Inc.  All rights reserved.
 */
import { createFeatureSelector, createSelector } from '@ngrx/store';

import { TENANT_CONNECTIONS_FEATURE_KEY, TenantConnectionsState, tenantConnectionsAtomicAdapter } from '../states';

const selectTenantConnectionsState = createFeatureSelector<TenantConnectionsState>(TENANT_CONNECTIONS_FEATURE_KEY);

/**
 * Tenant Connections
 */

export const selectTenantConnectionsCompleteState = createSelector(
	selectTenantConnectionsState,
	(state: TenantConnectionsState) => state[TENANT_CONNECTIONS_FEATURE_KEY]
);

/**
 * Retrieves all selectors for the TenantConnectionsState
 * @returns {AtomicStateSelectors} - All selectors for an TenantConnectionsState.
 */
const getTenantConnectionsSelectors = () =>
	tenantConnectionsAtomicAdapter.getSelectors(selectTenantConnectionsCompleteState);

const selectSelectedTenantConnection = createSelector(
	selectTenantConnectionsState,
	state => state?.selectedSidebarConnection
);

export const fromTenantConnections = {
	getTenantConnectionsSelectors,
	selectSelectedTenantConnection
};
