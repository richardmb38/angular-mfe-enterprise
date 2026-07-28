/*
 * Copyright (C) 2024 Acme Technologies, Inc.  All rights reserved.
 */
import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { importProvidersFrom } from '@angular/core';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { RouterOutlet } from '@angular/router';

import { Meta, StoryFn, applicationConfig, moduleMetadata } from '@storybook/angular';

import { FeatureFlagService } from '@acme-priv/ui-common/src/acme/angular/util';

import { HarborPilotOverlayModule } from './components/harbor-pilot-overlay/harbor-pilot-overlay.module';
import { HarborPilotComponent } from './harbor-pilot.component';
import { StorybookCoreModule } from '@acme/storybook/angular';
import { MarkdownModule } from 'ngx-markdown';

export default {
	title: 'Harbor Pilot',
	component: HarborPilotComponent,
	decorators: [
		applicationConfig({
			providers: [
				importProvidersFrom([
					StorybookCoreModule,
					HttpClientModule,
					NoopAnimationsModule,
					MarkdownModule.forRoot()
				])
			]
		}),
		moduleMetadata({
			imports: [CommonModule, HarborPilotOverlayModule, RouterOutlet]
		})
	],
	providers: [
		{
			provide: FeatureFlagService,
			useValue: {
				isEnabled: () => true
			}
		}
	]
} as Meta;

/**
 * Template for stories
 */
const Template: StoryFn<HarborPilotComponent> = args => ({
	props: { ...args }
});

export const Default = {
	render: Template
};
