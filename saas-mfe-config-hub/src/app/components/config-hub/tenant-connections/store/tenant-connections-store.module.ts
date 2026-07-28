/*
 * Copyright (C) 2023 Acme Technologies, Inc. All rights reserved.
 */
import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';

import { EffectsModule } from '@ngrx/effects';
import { StoreModule } from '@ngrx/store';

import { TenantConnectionsEffects } from './effects';
import { TenantConnectionsReducer } from './reducers';

import { TENANT_CONNECTIONS_FEATURE_KEY } from './states';

/**
 * Module encapsulating the Tenant Connections store.
 */
@NgModule({
	imports: [
		CommonModule,
		StoreModule.forFeature(TENANT_CONNECTIONS_FEATURE_KEY, TenantConnectionsReducer),
		EffectsModule.forFeature([TenantConnectionsEffects])
	]
})
export class ConfigHubTenantConnectionsStoreModule {}
