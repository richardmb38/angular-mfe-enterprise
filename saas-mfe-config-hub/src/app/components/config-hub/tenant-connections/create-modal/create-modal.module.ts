/*
 * Copyright (C) 2023 Acme Technologies, Inc.  All rights reserved.
 */
import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';

import { BackdropModule } from '@acme-priv/armada-angular/src/acme/angular/components/backdrop';
import { ButtonModule } from '@acme-priv/armada-angular/src/acme/angular/components/button';
import { FieldModule, SecretFieldModule } from '@acme-priv/armada-angular/src/acme/angular/components/form';
import {
	IconModule,
	IconQuestionCircleModule
} from '@acme-priv/armada-angular/src/acme/angular/components/icons';
import { LoadingMaskModule } from '@acme-priv/armada-angular/src/acme/angular/components/loading-mask';
import { ModalModule } from '@acme-priv/armada-angular/src/acme/angular/components/modal';
import { TooltipModule } from '@acme-priv/armada-angular/src/acme/angular/components/tooltip';
import { TranslateModule } from '@acme-priv/armada-angular/src/acme/angular/l10n/translation';
import { AutofocusModule } from '@acme-priv/armada-angular/src/acme/angular/util/autofocus';

import { CreateTenantConnectionModalComponent } from './create-modal.component';

/**
 * The module exporting the Configuration Hub Create TenantConnection Modal.
 */
@NgModule({
	imports: [
		ButtonModule,
		CommonModule,
		BackdropModule,
		FieldModule,
		SecretFieldModule,
		ModalModule,
		ReactiveFormsModule.withConfig({ callSetDisabledState: 'whenDisabledForLegacyCode' }),
		TranslateModule,
		AutofocusModule,
		LoadingMaskModule,
		TooltipModule,
		IconModule,
		IconQuestionCircleModule
	],
	declarations: [CreateTenantConnectionModalComponent],
	exports: [CreateTenantConnectionModalComponent]
})
export class CreateTenantConnectionModalModule {}
