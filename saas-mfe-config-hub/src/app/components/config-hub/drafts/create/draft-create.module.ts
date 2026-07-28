/*
 * Copyright (C) 2023 Acme Technologies, Inc.  All rights reserved.
 */
import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';

import { CardModule } from '@acme-priv/armada-angular/src/acme/angular/components/card';
import { HeaderModule } from '@acme-priv/armada-angular/src/acme/angular/components/card/header';
import { IconModule } from '@acme-priv/armada-angular/src/acme/angular/components/icons';
import { TranslateModule } from '@acme-priv/armada-angular/src/acme/angular/l10n/translation';

import { ConfigHubDraftCreateModalModule } from './draft-create-modal/draft-create-modal.module';
import { ConfigHubDraftCreateComponent } from './draft-create.component';

/**
 * The module exporting the Configuration Hub Draft Creation Page.
 */
@NgModule({
	declarations: [ConfigHubDraftCreateComponent],
	imports: [CommonModule, ConfigHubDraftCreateModalModule, CardModule, HeaderModule, IconModule, TranslateModule],
	exports: [ConfigHubDraftCreateComponent]
})
export class ConfigHubDraftCreateModule {}
