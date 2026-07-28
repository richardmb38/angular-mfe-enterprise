/*
 * Copyright (C) 2023 Acme Technologies, Inc.  All rights reserved.
 */
import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';

import { ButtonModule } from '@acme-priv/armada-angular/src/acme/angular/components/button';
import { CardModule } from '@acme-priv/armada-angular/src/acme/angular/components/card';
import { FullWidthHeaderModule } from '@acme-priv/armada-angular/src/acme/angular/components/full-width-header';
import {
	IconArrowLeftAltModule,
	IconArrowLeftModule,
	IconArrowRightModule,
	IconClockModule,
	IconCloseModule,
	IconEditModule,
	IconModule
} from '@acme-priv/armada-angular/src/acme/angular/components/icons';
import { ListGroupModule, ListItemModule } from '@acme-priv/armada-angular/src/acme/angular/components/list';
import { LoadingMaskModule } from '@acme-priv/armada-angular/src/acme/angular/components/loading-mask';
import { TranslateModule } from '@acme-priv/armada-angular/src/acme/angular/l10n/translation';
import { FullPageWizardTemplateModule } from '@acme-priv/armada-angular/src/acme/angular/templates';
import { TruncatedTextToolTipModule } from '@acme-priv/armada-angular/src/acme/angular/util/truncated-text-tooltip';

import { ConfigHubBackupDetailsGridModule } from '../backup-details-grid/backup-details-grid.module';
import { ConfigHubBackupDetailsComponent } from './backup-details.component';

/**
 * The module exporting BackupNameCellComponent.
 */
@NgModule({
	imports: [
		ButtonModule,
		CommonModule,
		TranslateModule,
		TruncatedTextToolTipModule,
		FullPageWizardTemplateModule,
		FullWidthHeaderModule,
		IconModule,
		IconClockModule,
		IconCloseModule,
		IconEditModule,
		IconArrowLeftAltModule,
		IconArrowLeftModule,
		IconArrowRightModule,
		ListGroupModule,
		ListItemModule,
		LoadingMaskModule,
		CardModule,
		ConfigHubBackupDetailsGridModule
	],
	declarations: [ConfigHubBackupDetailsComponent],
	exports: [ConfigHubBackupDetailsComponent]
})
export class BackupDetailsModule {}
