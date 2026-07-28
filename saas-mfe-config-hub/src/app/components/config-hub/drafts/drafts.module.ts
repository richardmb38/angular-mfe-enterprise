/*
 * Copyright (C) 2023 Acme Technologies, Inc.  All rights reserved.
 */
import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';

import { BadgeModule } from '@acme-priv/armada-angular/src/acme/angular/components/badge';
import { ButtonModule } from '@acme-priv/armada-angular/src/acme/angular/components/button';
import { FullWidthHeaderModule } from '@acme-priv/armada-angular/src/acme/angular/components/full-width-header';
import {
	IconArrowLeftModule,
	IconCloseModule,
	IconCommentModule,
	IconModule
} from '@acme-priv/armada-angular/src/acme/angular/components/icons';
import { LoadingMaskModule } from '@acme-priv/armada-angular/src/acme/angular/components/loading-mask';
import { TooltipModule } from '@acme-priv/armada-angular/src/acme/angular/components/tooltip';
import { TranslateModule } from '@acme-priv/armada-angular/src/acme/angular/l10n/translation';
import {
	FullPageWizardTemplateModule,
	LeftSidebarTemplateModule
} from '@acme-priv/armada-angular/src/acme/angular/templates';
import { TruncatedTextToolTipModule } from '@acme-priv/armada-angular/src/acme/angular/util/truncated-text-tooltip';

import { ConfigHubDraftCreateModule } from './create/draft-create.module';
import { ConfigHubApprovalCommentsOverlayModule } from './details/approval-comments-overlay/approval-comments-overlay.module';
import { ConfigHubDraftDetailsModule } from './details/draft-details.module';
import { RequestApprovalOverlayModule } from './details/request-approval-overlay/request-approval-overlay.module';
import { ConfigHubDraftsComponent } from './drafts.component';
import { ConfigHubDraftsListModule } from './list/drafts-list.module';
import { ConfigHubDraftsStoreModule } from './store/drafts-store.module';
import { ConfigHubDraftSummaryModule } from './summary/draft-summary.module';

/**
 * The module exporting the Drafts Page.
 */
@NgModule({
	imports: [
		BadgeModule,
		ButtonModule,
		IconCommentModule,
		CommonModule,
		ConfigHubApprovalCommentsOverlayModule,
		ConfigHubDraftCreateModule,
		ConfigHubDraftDetailsModule,
		ConfigHubDraftSummaryModule,
		ConfigHubDraftsListModule,
		FullPageWizardTemplateModule,
		FullWidthHeaderModule,
		ConfigHubDraftsStoreModule,
		IconModule,
		IconArrowLeftModule,
		IconCloseModule,
		LeftSidebarTemplateModule,
		LoadingMaskModule,
		RouterModule,
		TranslateModule,
		TruncatedTextToolTipModule,
		RequestApprovalOverlayModule,
		TooltipModule
	],
	declarations: [ConfigHubDraftsComponent],
	exports: [ConfigHubDraftsComponent]
})
export class ConfigHubDraftsModule {}
