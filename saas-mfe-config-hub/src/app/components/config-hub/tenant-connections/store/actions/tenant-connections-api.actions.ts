/*
 * Copyright (C) 2023 Acme Technologies, Inc.  All rights reserved.
 */
import { createAction, props } from '@ngrx/store';

import { ApiListResponse } from '@acme-priv/ui-common/src/acme/angular/api';

import { ConfigHubTenantConnection } from '../../../shared/models';

const actor = '[ConfigHub - Tenant Connections Api]';

/**
 * Load Tenant Connections
 */

export const tenantConnectionsLoadList = createAction(`${actor} Load  Tenant Connections List`);

export const tenantConnectionsLoadSuccess = createAction(
	`${actor} Load Tenant Connections Success`,
	props<{ tenantConnections: ApiListResponse<ConfigHubTenantConnection> }>()
);

export const TenantConnectionsLoadFailure = createAction(
	`${actor} Load Tenant Connections Failure`,
	props<{ errorMessage: string }>()
);

export const tenantConnectionsDelete = createAction(`${actor} Delete  Tenant Connections`);

export const tenantConnectionDeleteSuccess = createAction(
	`${actor} Delete Tenant Connections Success`,
	props<{ tenantConnection: string }>()
);

export const tenantConnectionDeleteFailure = createAction(
	`${actor} Delete Tenant Connections Failure`,
	props<{ errorMessage: string }>()
);
