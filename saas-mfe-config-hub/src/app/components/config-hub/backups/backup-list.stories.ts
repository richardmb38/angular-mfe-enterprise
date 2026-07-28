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

import { StoryBookApiInterceptor } from '@acme-priv/armada-angular/src/acme/storybook';

import { UserRightsService } from '@acme-priv/ui-common/src/acme/angular/util/user-rights';

import { ApiUrls } from '../config-hub.mock';
import { ConfigHubModule } from '../config-hub.module';
import { ConfigHubRoutes } from '../config-hub.routes';
import {
	BACKUPS_LIMIT_VIOLATION_CODE,
	ConfigHubJobType,
	MAX_MANUAL_BACKUPS_ALLOWED,
	createMockConfigHubJobs,
	mockConfigHubBackupJobSummary
} from '../shared/models';
import { ConfigHubRoles } from '../shared/models/config-hub.model';
import { ConfigHubBackupListComponent } from './backup-list.component';
import { StorybookCoreModule } from '@acme/storybook/angular';
import { LegacyGlobalServiceAdapter } from 'app/shared/services/globals';

export default {
	title: 'Configuration Hub/Backup List/Stories',
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
					RouterTestingModule.withRoutes([...ConfigHubRoutes[0].children])
				]),
				{
					provide: UserRightsService,
					useValue: {
						hasRight: value =>
							[
								ConfigHubRoles.BACKUP_CREATE,
								ConfigHubRoles.BACKUP_DELETE,
								ConfigHubRoles.DRAFT_CREATE
							].includes(value)
								? Promise.resolve(true)
								: Promise.resolve(false)
					}
				}
			]
		}),
		moduleMetadata({
			imports: [ConfigHubModule],
			providers: [
				DatePipe,
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
 * The main template used for all the stories
 */
const Template: StoryFn<ConfigHubBackupListComponent> = args => {
	return {
		props: { ...args },
		template: `<app-config-hub ${argsToTemplate(args)}></app-config-hub>`
	};
};

export const Default = {
	render: Template,
	parameters: {
		controls: { disable: true },
		actions: { disable: true }
	},
	decorators: [
		applicationConfig({
			providers: [
				{
					provide: HTTP_INTERCEPTORS,
					useValue: new StoryBookApiInterceptor([
						{
							method: 'GET',
							url: ApiUrls.completedBackups,
							response: createMockConfigHubJobs(3, ConfigHubJobType.BACKUP)
						},
						{
							method: 'GET',
							url: ApiUrls.inProgressBackups,
							response: []
						},
						{
							method: 'GET',
							url: 'beta/sp-config/backups/.+/summary',
							response: mockConfigHubBackupJobSummary
						}
					]),
					multi: true
				}
			]
		})
	]
};

export const WithMaxBackupsError = {
	render: Template,
	decorators: [
		applicationConfig({
			providers: [
				{
					provide: HTTP_INTERCEPTORS,
					useValue: new StoryBookApiInterceptor([
						{
							method: 'GET',
							url: ApiUrls.completedBackups,
							response: createMockConfigHubJobs(MAX_MANUAL_BACKUPS_ALLOWED, ConfigHubJobType.BACKUP)
						},
						{
							method: 'GET',
							url: ApiUrls.inProgressBackups,
							response: []
						},
						{
							method: 'POST',
							url: ApiUrls.backups,
							status: 400,
							statusText: 'Error creating backup',
							response: {
								detailCode: BACKUPS_LIMIT_VIOLATION_CODE
							}
						}
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
							url: ApiUrls.completedBackups,
							response: []
						},
						{
							method: 'GET',
							url: ApiUrls.inProgressBackups,
							response: []
						}
					]),
					multi: true
				}
			]
		})
	]
};
