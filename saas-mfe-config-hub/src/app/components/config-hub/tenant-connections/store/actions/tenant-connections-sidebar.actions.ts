/*
 * Copyright (C) 2023 Acme Technologies, Inc.  All rights reserved.
 */
import { createAction, props } from '@ngrx/store';

const actor = '[ConfigHub - Tenant Connections Sidebar]';

export const tenantConnectionsSidebarShow = createAction(`${actor} Show Sidebar`);

export const tenantConnectionsSidebarSelect = createAction(
	`${actor} Select Tenant Connection`,
	props<{ tenantConnectionId: string | null }>()
);

export const tenantConnectionsSidebarLeave = createAction(`${actor} Leave Sidebar`);
