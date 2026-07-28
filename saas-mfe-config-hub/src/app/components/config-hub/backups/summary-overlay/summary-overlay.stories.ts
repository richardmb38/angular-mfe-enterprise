/*
 * Copyright (C) 2023 Acme Technologies, Inc.  All rights reserved.
 */
import { CommonModule } from '@angular/common';
import { HTTP_INTERCEPTORS, HttpClientModule } from '@angular/common/http';
import { importProvidersFrom } from '@angular/core';
import { provideAnimations } from '@angular/platform-browser/animations';

import { Meta, StoryFn, applicationConfig, moduleMetadata } from '@storybook/angular';

import { TranslateModule } from '@acme-priv/armada-angular/src/acme/angular/l10n/translation';
import { StoryBookApiInterceptor } from '@acme-priv/armada-angular/src/acme/storybook';

import { UserRightsService } from '@acme-priv/ui-common/src/acme/angular/util/user-rights';

import { ApiUrls } from '../../config-hub.mock';
import { mockConfigHubBackupJobSummary } from '../../shared/models';
import { ConfigHubRoles } from '../../shared/models/config-hub.model';
import { ConfigHubBackupSummaryOverlayComponent } from './summary-overlay.component';
import { ConfigHubBackupSummaryOverlayModule } from './summary-overlay.module';
import { StorybookCoreModule } from '@acme/storybook/angular';

export default {
	title: 'Configuration Hub/Summary Overlay/Stories',
	component: ConfigHubBackupSummaryOverlayComponent,
	decorators: [
		applicationConfig({
			providers: [
				provideAnimations(),
				importProvidersFrom([HttpClientModule, TranslateModule.forRoot()]),
				{
					provide: HTTP_INTERCEPTORS,
					useValue: new StoryBookApiInterceptor([
						{
							method: 'GET',
							url: ApiUrls.backupSummary(mockConfigHubBackupJobSummary.jobId),
							response: mockConfigHubBackupJobSummary
						}
					]),
					multi: true
				},
				{
					provide: UserRightsService,
					useValue: {
						hasRight: value =>
							[ConfigHubRoles.DRAFT_CREATE].includes(value)
								? Promise.resolve(true)
								: Promise.resolve(false)
					}
				}
			]
		}),
		moduleMetadata({
			imports: [StorybookCoreModule, CommonModule, ConfigHubBackupSummaryOverlayModule]
		})
	]
} as Meta;

/**
 * The main template used for all the stories
 */
const Template: StoryFn<ConfigHubBackupSummaryOverlayComponent> = args => {
	return {
		props: {
			...args
		}
	};
};

export const Default = {
	render: Template,
	args: {
		selectedSourceBackup: mockConfigHubBackupJobSummary
	}
};
