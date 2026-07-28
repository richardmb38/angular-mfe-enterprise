/*
 * Copyright (C) 2023 Acme Technologies, Inc.  All rights reserved.
 */
import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';

import { ButtonModule } from '@acme-priv/armada-angular/src/acme/angular/components/button';
import { DataGridModule } from '@acme-priv/armada-angular/src/acme/angular/components/grid';
import { LoadingMaskModule } from '@acme-priv/armada-angular/src/acme/angular/components/loading-mask';
import { TranslateModule } from '@acme-priv/armada-angular/src/acme/angular/l10n/translation';

import { CreateTenantConnectionModalModule } from './create-modal/create-modal.module';
import { ConfigHubTenantConnectionsStoreModule } from './store/tenant-connections-store.module';
import { ConfigHubTenantConnectionsComponent } from './tenant-connections.component';

/**
 * The module exporting the Configuration Hub Tenant Connections
 */
@NgModule({
	imports: [
		CommonModule,
		TranslateModule,
		ButtonModule,
		DataGridModule,
		CreateTenantConnectionModalModule,
		ConfigHubTenantConnectionsStoreModule,
		LoadingMaskModule
	],
	declarations: [ConfigHubTenantConnectionsComponent],
	exports: [ConfigHubTenantConnectionsComponent]
})
export class ConfigHubTenantConnectionsModule {}
