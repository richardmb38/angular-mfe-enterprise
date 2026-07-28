/*
 * Copyright (C) 2023 Acme Technologies, Inc.  All rights reserved.
 */
import { fromTenantConnections } from './tenant-connections.selectors';

import { mockConfigHubTenantConnectionsList } from '../../../shared/models';
import { TenantConnectionsState, tenantConnectionsAtomicAdapter, tenantConnectionsInitialState } from '../states';

describe('fromTenantConnections', () => {
	const aTenantConnectionId = 'tenant-connection-id';
	const state: TenantConnectionsState = {
		...tenantConnectionsInitialState,
		tenantConnections: tenantConnectionsAtomicAdapter.addMany(mockConfigHubTenantConnectionsList, {
			...tenantConnectionsInitialState.tenantConnections
		}),
		selectedSidebarConnection: aTenantConnectionId
	};

	describe('selectSelectedTenantConnection', () => {
		it('should return the selected tenant connection', () => {
			expect(fromTenantConnections.selectSelectedTenantConnection.projector(state)).toEqual(
				state.selectedSidebarConnection
			);
		});
	});
});
