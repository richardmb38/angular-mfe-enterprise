/*
 * Copyright (C) 2023 Acme Technologies, Inc.  All rights reserved.
 */
import { createAction } from '@ngrx/store';

const actor = '[ConfigHub - Tenant Connections Page]';

export const tenantConnectionsPageLeave = createAction(`${actor} Page Leave`);

export const tenantConnectionsPageEnter = createAction(`${actor} Page Enter`);
