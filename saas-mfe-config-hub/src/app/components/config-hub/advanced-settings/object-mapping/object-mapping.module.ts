/*
 * Copyright (C) 2023 Acme Technologies, Inc.  All rights reserved.
 */
import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';

import { ButtonModule } from '@acme-priv/armada-angular/src/acme/angular/components/button';
import { SelectInputModule } from '@acme-priv/armada-angular/src/acme/angular/components/form';
import { LoadingMaskModule } from '@acme-priv/armada-angular/src/acme/angular/components/loading-mask';
import { TranslateModule } from '@acme-priv/armada-angular/src/acme/angular/l10n/translation';

import { ConfigHubObjectMappingOverlayModule } from '../object-mapping-create-overlay/object-mapping-create-overlay.module';
import { ConfigHubObjectMappingGridModule } from '../object-mapping-grid/object-mapping-grid.module';
import { ConfigHubObjectMappingComponent } from './object-mapping.component';

/**
 * Exports the Configuration Hub Object Mapping Component
 */
@NgModule({
	declarations: [ConfigHubObjectMappingComponent],
	imports: [
		CommonModule,
		TranslateModule,
		ButtonModule,
		SelectInputModule,
		ConfigHubObjectMappingGridModule,
		ConfigHubObjectMappingOverlayModule,
		LoadingMaskModule
	],
	exports: [ConfigHubObjectMappingComponent]
})
export class ConfigHubObjectMappingModule {}
