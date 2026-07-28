/*
 * Copyright (C) 2025 Acme Technologies, Inc.  All rights reserved.
 */
import { APP_BASE_HREF } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { NgModule } from '@angular/core';

import { TranslateModule } from '@acme-priv/armada-angular/src/acme/angular/l10n/translation';
import { StoryBookSharedModule } from '@acme-priv/armada-angular/src/acme/storybook';

@NgModule({
	imports: [StoryBookSharedModule, HttpClientModule, TranslateModule],
	providers: [
		{
			provide: APP_BASE_HREF,
			useValue: window.location.pathname.substring(0, window.location.pathname.lastIndexOf('/'))
		}
	],
	exports: [StoryBookSharedModule]
})
export class StorybookCoreModule {}
