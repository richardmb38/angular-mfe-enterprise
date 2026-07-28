import { HttpClientModule } from '@angular/common/http';
import { importProvidersFrom } from '@angular/core';
import { provideAnimations } from '@angular/platform-browser/animations';
import { RouterTestingModule } from '@angular/router/testing';

import { EffectsModule } from '@ngrx/effects';
import { StoreModule } from '@ngrx/store';
import { Meta, StoryFn, applicationConfig, moduleMetadata } from '@storybook/angular';

import { FeatureFlagService } from '@acme-priv/ui-common/src/acme/angular/util';

import { DraftsReducer } from '../store/reducers';

import { mockDraftSummaryDraftsPageState } from '../../shared/models/summary-state.mock';
import { ConfigHubDraftDetailsComponent } from '../details/draft-details.component';
import { ConfigHubDraftDetailsModule } from '../details/draft-details.module';
import { DRAFTS_PAGE_FEATURE_KEY } from '../store/states';
import { ConfigHubDraftSummaryComponent } from './draft-summary.component';
import { ConfigHubDraftSummaryModule } from './draft-summary.module';
import { StorybookCoreModule } from '@acme/storybook/angular';
import { FeatureFlags } from 'app/featureflags.enum';
import { LegacyGlobalServiceAdapter } from 'app/shared/services/globals';

export default {
	title: 'Configuration Hub/Drafts/Draft Summary',
	component: ConfigHubDraftSummaryComponent,
	decorators: [
		applicationConfig({
			providers: [
				provideAnimations(),
				importProvidersFrom([
					HttpClientModule,
					EffectsModule.forRoot([]),
					RouterTestingModule.withRoutes([
						{
							path: 'details',
							pathMatch: 'full',
							component: ConfigHubDraftDetailsComponent
						}
					]),
					StoreModule.forRoot({
						[DRAFTS_PAGE_FEATURE_KEY]: (_, action) => DraftsReducer(mockDraftSummaryDraftsPageState, action)
					})
				]),
				{
					provide: LegacyGlobalServiceAdapter,
					useValue: {
						get: () => 'acme-dev'
					}
				},
				{
					provide: FeatureFlagService,
					// TODO: Remove in https://acme.atlassian.net/browse/PLTIN-4106
					useValue: {
						isEnabled: value => [FeatureFlags.PLT_UI_ADMIRAL_CONFIG_HUB_DRAFT_DETAILS].includes(value)
					}
				}
			]
		}),
		moduleMetadata({
			imports: [StorybookCoreModule, ConfigHubDraftSummaryModule, ConfigHubDraftDetailsModule]
		})
	]
} as Meta;

/**
 * The main template used for the stories
 */
const Template: StoryFn<ConfigHubDraftSummaryComponent> = args => {
	return {
		props: { ...args }
	};
};

export const Default = {
	render: Template
};
