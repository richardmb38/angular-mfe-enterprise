/*
 * Copyright (C) 2023 Acme Technologies, Inc.  All rights reserved.
 */
import { Component, NgModule, importProvidersFrom } from '@angular/core';
import { Router } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';

import { EffectsModule } from '@ngrx/effects';
import { StoreModule } from '@ngrx/store';
import { provideMockStore } from '@ngrx/store/testing';
import { Meta, StoryFn, applicationConfig, moduleMetadata } from '@storybook/angular';
import { ObservableInput, of, switchMap, timer } from 'rxjs';

import { FeatureFlagService } from '@acme-priv/ui-common/src/acme/angular/util';

import { fromDraftsPage } from '../store/selectors';

import {
	ConfigHubDraftJob,
	ConfigHubJobStatus,
	ConfigHubJobType,
	createMockConfigHubJobs,
	mockConfigHubDraftJob,
	mockConfigHubDraftJobSummary
} from '../../shared/models';
import { ConfigHubDraftsApiService } from '../../shared/services';
import { ConfigHubDraftsComponent } from '../drafts.component';
import { ConfigHubDraftsModule } from '../drafts.module';
import { getObjectTypeInitialStates } from '../store/states';
import { ConfigHubDraftSummaryComponent } from '../summary/draft-summary.component';
import { ConfigHubDraftCreateComponent } from './draft-create.component';
import { ConfigHubDraftCreateModule } from './draft-create.module';
import { StorybookCoreModule } from '@acme/storybook/angular';
import { FeatureFlags } from 'app/featureflags.enum';
import { LegacyGlobalServiceAdapter } from 'app/shared/services/globals';

const notStartedDraft = createMockConfigHubJobs(1, ConfigHubJobType.DRAFT, ConfigHubJobStatus.NOT_STARTED)[0];

/**
 * Simulates consecutive API calls needed for creating a draft.
 */
function mockApiDraftCreationProcess(): ObservableInput<ConfigHubDraftJob> {
	return timer(0, 1000).pipe(
		switchMap((_, index): ObservableInput<ConfigHubDraftJob> => {
			let draftStatus: ConfigHubJobStatus;
			switch (index) {
				case 0:
					draftStatus = ConfigHubJobStatus.NOT_STARTED;
					break;
				case 1:
					draftStatus = ConfigHubJobStatus.IN_PROGRESS;
					break;
				default:
					draftStatus = ConfigHubJobStatus.COMPLETE;
			}
			return of({
				...mockConfigHubDraftJob,
				jobId: 'draftJob-id',
				status: draftStatus
			});
		})
	);
}

/**
 * Wrapper component used to populate the router navigation extras.
 */
@Component({
	selector: 'app-config-hub-draft-create-wrapper',
	template: `<app-config-hub-draft-create></app-config-hub-draft-create>`
})
class ConfigHubDraftCreateWrapperComponent {
	constructor(router: Router) {
		router.navigate([''], {
			state: {
				sourceBackupId: 'mock-sourceBackupId',
				sourceBackupName: 'My Awesome Backup'
			}
		});
	}
}

@NgModule({
	declarations: [ConfigHubDraftCreateWrapperComponent],
	imports: [ConfigHubDraftCreateModule]
})
class ConfigHubDraftCreateWrapperModule {}

export default {
	title: 'Configuration Hub/Drafts/Create Draft',
	component: ConfigHubDraftsComponent,
	decorators: [
		applicationConfig({
			providers: [
				importProvidersFrom([
					StorybookCoreModule,
					StoreModule.forRoot([]),
					EffectsModule.forRoot([]),
					RouterTestingModule.withRoutes([
						{
							path: 'create-draft',
							pathMatch: 'full',
							component: ConfigHubDraftCreateWrapperComponent
						},
						{
							path: 'admin/config-hub/drafts/:draftId',
							pathMatch: 'full',
							component: ConfigHubDraftSummaryComponent
						},
						{
							path: '',
							pathMatch: 'prefix',
							redirectTo: 'create-draft'
						}
					])
				]),
				{
					provide: ConfigHubDraftsApiService,
					useValue: {
						createDraftJob: () => of(notStartedDraft),
						watchInProgressJob: () => {
							return mockApiDraftCreationProcess();
						}
					}
				},
				{
					provide: FeatureFlagService,
					useValue: {
						// TODO: Remove in https://acme.atlassian.net/browse/PLTIN-4106
						isEnabled: flag => [FeatureFlags.PLT_UI_ADMIRAL_CONFIG_HUB_DRAFT_DETAILS].includes(flag)
					}
				},
				{
					provide: LegacyGlobalServiceAdapter,
					useValue: {
						get: () => 'acme-dev'
					}
				},
				provideMockStore({
					selectors: [
						{
							selector: fromDraftsPage.selectSummary,
							value: mockConfigHubDraftJobSummary
						},
						{
							selector: fromDraftsPage.selectObjectTypes,
							value: getObjectTypeInitialStates(mockConfigHubDraftJobSummary)
						}
					]
				})
			]
		}),
		moduleMetadata({
			imports: [ConfigHubDraftsModule, ConfigHubDraftCreateWrapperModule]
		})
	]
} as Meta;

/**
 * The main template used for the stories
 */
const Template: StoryFn<ConfigHubDraftCreateComponent> = args => {
	return {
		props: { ...args }
	};
};

export const Default = {
	render: Template
};
