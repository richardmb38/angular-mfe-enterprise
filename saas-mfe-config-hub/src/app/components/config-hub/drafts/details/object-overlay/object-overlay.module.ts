/*
 * Copyright (C) 2023 Acme Technologies, Inc.  All rights reserved.
 */
import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';

import { ButtonModule } from '@acme-priv/armada-angular/src/acme/angular/components/button';
import { CopyModule } from '@acme-priv/armada-angular/src/acme/angular/components/copy';
import { DiffViewModule } from '@acme-priv/armada-angular/src/acme/angular/components/diff-view';
import { FieldModule, TextAreaInputModule } from '@acme-priv/armada-angular/src/acme/angular/components/form';
import { IconModule, IconWarningModule } from '@acme-priv/armada-angular/src/acme/angular/components/icons';
import { LoadingMaskModule } from '@acme-priv/armada-angular/src/acme/angular/components/loading-mask';
import { OverlayModule } from '@acme-priv/armada-angular/src/acme/angular/components/overlay';
import { TabListModule, TabModule } from '@acme-priv/armada-angular/src/acme/angular/components/tabs';
import { TooltipModule } from '@acme-priv/armada-angular/src/acme/angular/components/tooltip';
import { TranslateModule } from '@acme-priv/armada-angular/src/acme/angular/l10n/translation';
import { TruncatedTextToolTipModule } from '@acme-priv/armada-angular/src/acme/angular/util/truncated-text-tooltip';

import { ConfigHubObjectChangelogGridModule } from '../object-changelog-grid/object-changelog-grid.module';
import { ConfigHubObjectMetadataGridModule } from '../object-metadata-grid/object-metadata-grid.module';
import { ConfigHubObjectOverlayComponent } from './object-overlay.component';

/**
 * The module exporting the Configuration Hub Object Overlay.
 */
@NgModule({
	imports: [
		ButtonModule,
		CommonModule,
		CopyModule,
		FieldModule,
		OverlayModule,
		TextAreaInputModule,
		TooltipModule,
		TranslateModule,
		TruncatedTextToolTipModule,
		IconModule,
		IconWarningModule,
		LoadingMaskModule,
		TabListModule,
		TabModule,
		ConfigHubObjectChangelogGridModule,
		DiffViewModule,
		ConfigHubObjectMetadataGridModule
	],
	declarations: [ConfigHubObjectOverlayComponent],
	exports: [ConfigHubObjectOverlayComponent]
})
export class ConfigHubObjectOverlayModule {}
