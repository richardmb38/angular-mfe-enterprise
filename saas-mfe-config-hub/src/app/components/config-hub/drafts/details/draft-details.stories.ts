import { importProvidersFrom } from '@angular/core';

import { EffectsModule } from '@ngrx/effects';
import { StoreModule } from '@ngrx/store';
import { Meta, StoryFn, applicationConfig, moduleMetadata } from '@storybook/angular';

import { DraftsReducer } from '../store/reducers';

import { mockObjectDetailsDraftsPageState } from '../../shared/models/summary-state.mock';
import { DRAFTS_PAGE_FEATURE_KEY } from '../store/states';
import { ConfigHubDraftDetailsComponent } from './draft-details.component';
import { ConfigHubDraftDetailsModule } from './draft-details.module';
import { StorybookCoreModule } from '@acme/storybook/angular';
import { LegacyGlobalServiceAdapter } from 'app/shared/services/globals';

export default {
	title: 'Configuration Hub/Drafts/Object Details',
	component: ConfigHubDraftDetailsComponent,
	decorators: [
		applicationConfig({
			providers: [
				importProvidersFrom([
					StorybookCoreModule,
					StoreModule.forRoot([]),
					EffectsModule.forRoot([]),
					StoreModule.forFeature(DRAFTS_PAGE_FEATURE_KEY, DraftsReducer, {
						initialState: mockObjectDetailsDraftsPageState
					})
				])
			]
		}),
		moduleMetadata({
			imports: [ConfigHubDraftDetailsModule],
			providers: [
				{
					provide: LegacyGlobalServiceAdapter,
					useValue: {
						get: () => 'acme-dev'
					}
				}
			]
		})
	]
} as Meta;

/**
 * The main template used for the stories
 */
const Template: StoryFn<ConfigHubDraftDetailsComponent> = args => {
	return {
		props: { ...args }
	};
};

export const Default = {
	render: Template
};
