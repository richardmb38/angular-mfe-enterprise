/*
 * Copyright (C) 2024 Acme Technologies, Inc.  All rights reserved.
 */
import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';

import { BackdropModule } from '@acme-priv/armada-angular/src/acme/angular/components/backdrop';
import { ButtonModule } from '@acme-priv/armada-angular/src/acme/angular/components/button';
import { FieldModule } from '@acme-priv/armada-angular/src/acme/angular/components/form';
import { IconWarningModule } from '@acme-priv/armada-angular/src/acme/angular/components/icons';
import { ModalModule } from '@acme-priv/armada-angular/src/acme/angular/components/modal';
import { OverlayModule } from '@acme-priv/armada-angular/src/acme/angular/components/overlay';
import { TranslateModule } from '@acme-priv/armada-angular/src/acme/angular/l10n/translation';
import { AutofocusModule } from '@acme-priv/armada-angular/src/acme/angular/util/autofocus';

import { RequestApprovalOverlayComponent } from './request-approval-overlay.component';

@NgModule({
	declarations: [RequestApprovalOverlayComponent],
	imports: [
		OverlayModule,
		ButtonModule,
		CommonModule,
		BackdropModule,
		FieldModule,
		ModalModule,
		ReactiveFormsModule.withConfig({ callSetDisabledState: 'whenDisabledForLegacyCode' }),
		TranslateModule,
		AutofocusModule,
		IconWarningModule
	],
	exports: [RequestApprovalOverlayComponent]
})
export class RequestApprovalOverlayModule {}
