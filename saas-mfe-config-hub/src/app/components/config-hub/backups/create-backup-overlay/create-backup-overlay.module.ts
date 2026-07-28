/*
 * Copyright (C) 2023 Acme Technologies, Inc.  All rights reserved.
 */
import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';

import { ButtonModule } from '@acme-priv/armada-angular/src/acme/angular/components/button';
import { FieldModule } from '@acme-priv/armada-angular/src/acme/angular/components/form';
import { LoadingMaskModule } from '@acme-priv/armada-angular/src/acme/angular/components/loading-mask';
import { OverlayModule } from '@acme-priv/armada-angular/src/acme/angular/components/overlay';
import { TranslateModule } from '@acme-priv/armada-angular/src/acme/angular/l10n/translation';
import { AutofocusModule } from '@acme-priv/armada-angular/src/acme/angular/util/autofocus';

import { ConfigHubCreateBackupOverlayComponent } from './create-backup-overlay.component';
import { ConfigHubObjectSelectionGridModule } from './object-selection-grid/object-selection-grid.module';

/**
 * The module exporting the Configuration Hub Backup Creation Overlay.
 */
@NgModule({
	imports: [
		CommonModule,
		AutofocusModule,
		ButtonModule,
		FieldModule,
		LoadingMaskModule,
		OverlayModule,
		ReactiveFormsModule.withConfig({ callSetDisabledState: 'whenDisabledForLegacyCode' }),
		TranslateModule,
		ConfigHubObjectSelectionGridModule
	],
	declarations: [ConfigHubCreateBackupOverlayComponent],
	exports: [ConfigHubCreateBackupOverlayComponent]
})
export class ConfigHubCreateBackupOverlayModule {}
