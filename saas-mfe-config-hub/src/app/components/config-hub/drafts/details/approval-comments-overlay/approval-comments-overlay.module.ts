/*
 * Copyright (C) 2024 Acme Technologies, Inc.  All rights reserved.
 */
import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';

import { ButtonModule } from '@acme-priv/armada-angular/src/acme/angular/components/button';
import { OverlayModule } from '@acme-priv/armada-angular/src/acme/angular/components/overlay';
import { TranslateModule } from '@acme-priv/armada-angular/src/acme/angular/l10n/translation';

import { ConfigHubApprovalCommentsOverlayComponent } from './approval-comments-overlay.component';

@NgModule({
	declarations: [ConfigHubApprovalCommentsOverlayComponent],
	imports: [CommonModule, TranslateModule, OverlayModule, ButtonModule],
	exports: [ConfigHubApprovalCommentsOverlayComponent]
})
export class ConfigHubApprovalCommentsOverlayModule {}
