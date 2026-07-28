/*
 * Copyright (C) 2023 Acme Technologies, Inc.  All rights reserved.
 */
import { DatePipe } from '@angular/common';
import { HTTP_INTERCEPTORS } from '@angular/common/http';
import { importProvidersFrom } from '@angular/core';
import { provideAnimations } from '@angular/platform-browser/animations';
import { provideRouter } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';

import { EffectsModule } from '@ngrx/effects';
import { StoreModule } from '@ngrx/store';
import { Meta, StoryFn, applicationConfig, argsToTemplate, moduleMetadata } from '@storybook/angular';

import { ApiRequestMock, StoryBookApiInterceptor } from '@acme-priv/armada-angular/src/acme/storybook';

import { FeatureFlagService } from '@acme-priv/ui-common/src/acme/angular/util';

import { ApiUrls } from '../../config-hub.mock';
import { ConfigHubChildRoutes } from '../../config-hub.model';
import { ConfigHubModule } from '../../config-hub.module';
import { ConfigHubRoutes } from '../../config-hub.routes';
import { ConfigHubJobType, createMockConfigHubJobs } from '../../shared/models';
import { ConfigHubDraftsListComponent } from './drafts-list.component';
import { StorybookCoreModule } from '@acme/storybook/angular';
import { FeatureFlags } from 'app/featureflags.enum';

const backupsListEmptyResponses: ApiRequestMock[] = [
	{
		method: 'GET',
		url: ApiUrls.completedBackups,
		response: []
	},
	{
		method: 'GET',
		url: ApiUrls.inProgressBackups,
		response: []
	}
];

export default {
	title: 'Configuration Hub/Drafts/Drafts List',
	decorators: [
		applicationConfig({
			providers: [
				DatePipe,
				provideRouter([]),
				provideAnimations(),
				importProvidersFrom([
					StorybookCoreModule,
					StoreModule.forRoot({}),
					EffectsModule.forRoot([]),
					RouterTestingModule.withRoutes([
						{
							...ConfigHubRoutes[0].children[0],
							children: [
								// Override to redirect to drafts route by default
								{
									path: '',
									redirectTo: ConfigHubChildRoutes.DRAFTS.route,
									pathMatch: 'full'
								},
								...ConfigHubRoutes[0].children[0].children
							]
						}
					])
				])
			]
		}),
		moduleMetadata({
			imports: [ConfigHubModule],
			providers: [
				DatePipe,
				{
					provide: FeatureFlagService,
					useValue: {
						isEnabled: value => [FeatureFlags.PLT_UI_ADMIRAL_CONFIG_HUB_DRAFT_DETAILS].includes(value)
					}
				}
			]
		})
	]
} as Meta;

/**
 * The main template used for all the stories
 */
const Template: StoryFn<ConfigHubDraftsListComponent> = args => {
	return {
		props: { ...args },
		template: `<app-config-hub ${argsToTemplate(args)}></app-config-hub>`
	};
};

export const Default = {
	render: Template,

	decorators: [
		applicationConfig({
			providers: [
				{
					provide: HTTP_INTERCEPTORS,
					useValue: new StoryBookApiInterceptor([
						{
							method: 'GET',
							url: ApiUrls.completedDrafts,
							response: createMockConfigHubJobs(5, ConfigHubJobType.DRAFT)
						},
						...backupsListEmptyResponses
					]),
					multi: true
				}
			]
		})
	]
};

export const WithNoDataModel = {
	render: Template,

	decorators: [
		applicationConfig({
			providers: [
				{
					provide: HTTP_INTERCEPTORS,
					useValue: new StoryBookApiInterceptor([
						{
							method: 'GET',
							url: ApiUrls.completedDrafts,
							response: []
						},
						...backupsListEmptyResponses
					]),
					multi: true
				}
			]
		})
	]
};
