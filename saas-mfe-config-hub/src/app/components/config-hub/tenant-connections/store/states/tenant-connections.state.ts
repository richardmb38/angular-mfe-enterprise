/*
 * Copyright (C) 2023 Acme Technologies, Inc.  All rights reserved.
 */
import {
	AtomicState,
	createAtomicStateAdapter
} from '@acme-priv/ui-common/src/acme/angular/util/atomic-state';

import { ConfigHubTenantConnection } from '../../../shared/models';

export const TENANT_CONNECTIONS_FEATURE_KEY = 'tenantConnections';

/**
 * An adapter for TenantConnections so that an AtomicState of that type can be created.
 */
export const tenantConnectionsAtomicAdapter = createAtomicStateAdapter<ConfigHubTenantConnection>({
	selectId: (tenantConnection: ConfigHubTenantConnection) => tenantConnection.sourceTenant
});

/**
 * An AtomicState of type ObjectDetails.
 */
export type TenantConnectionsAtomicState = AtomicState<ConfigHubTenantConnection>;

/**
 * Represents the state of the entire Tenant Connections page.
 */
export interface TenantConnectionsState {
	/**
	 * List of tenant connections
	 */
	tenantConnections: TenantConnectionsAtomicState;

	/**
	 * Id of the currently selected tenant connection
	 */
	selectedSidebarConnection: string | null;
}

/**
 * The initial TenantConnectionsPageState.
 */
export const tenantConnectionsInitialState: TenantConnectionsState = {
	tenantConnections: tenantConnectionsAtomicAdapter.getInitialState(),
	selectedSidebarConnection: null
};
