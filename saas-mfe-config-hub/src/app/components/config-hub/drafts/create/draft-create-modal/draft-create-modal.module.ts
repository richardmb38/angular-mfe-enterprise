/*
 * Copyright (C) 2023 Acme Technologies, Inc.  All rights reserved.
 */
import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';

import { BackdropModule } from '@acme-priv/armada-angular/src/acme/angular/components/backdrop';
import { ButtonModule } from '@acme-priv/armada-angular/src/acme/angular/components/button';
import { FieldModule } from '@acme-priv/armada-angular/src/acme/angular/components/form';
import { ModalModule } from '@acme-priv/armada-angular/src/acme/angular/components/modal';
import { TranslateModule } from '@acme-priv/armada-angular/src/acme/angular/l10n/translation';
import { AutofocusModule } from '@acme-priv/armada-angular/src/acme/angular/util/autofocus';

import { ConfigHubDraftCreateModalComponent } from './draft-create-modal.component';

/**
 * The module exporting the Configuration Hub Create Draft Modal.
 */
@NgModule({
	declarations: [ConfigHubDraftCreateModalComponent],
	imports: [
		ButtonModule,
		CommonModule,
		BackdropModule,
		FieldModule,
		ModalModule,
		ReactiveFormsModule.withConfig({ callSetDisabledState: 'whenDisabledForLegacyCode' }),
		TranslateModule,
		AutofocusModule
	],
	exports: [ConfigHubDraftCreateModalComponent]
})
export class ConfigHubDraftCreateModalModule {}
