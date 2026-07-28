/*
 * Copyright (C) 2025 Acme Technologies, Inc.  All rights reserved.
 */
import { Component, OnInit, input, signal } from '@angular/core';

import { Alignment } from '@acme-priv/armada-angular/src/acme/theme/typescript';

import { FeatureFlagService } from '@acme-priv/ui-common/src/acme/angular/util';

import { FeatureFlags } from 'app/feature-flags.enum';
import { HarborPilotStore } from 'app/harbor-pilot/harbor-pilot.store';
import {
	HARBOR_PILOT_PROMPT_CATEGORIES_MAP,
	HarborPilotPromptCategory,
	Tools
} from 'app/harbor-pilot/shared/models/suggestions.model';
import { HarborPilotService } from 'app/harbor-pilot/shared/services/harbor-pilot.service';
import prompts from 'assets/prompts.json';

@Component({
	selector: 'app-harbor-pilot-prompts',
	templateUrl: './harbor-pilot-prompts.component.html',
	styleUrl: './harbor-pilot-prompts.component.scss'
})
export class HarborPilotPromptsComponent implements OnInit {
	// The prompts are loaded from a static JSON file on the assets folder.
	prompts = signal(prompts);

	// Prompt categories mapped to their respective tools.
	categories = signal<Map<string, HarborPilotPromptCategory>>(new Map([...HARBOR_PILOT_PROMPT_CATEGORIES_MAP]));

	// Reference to the alignment enum.
	aligments = Alignment;

	// Whether the chat overlay is expanded or not.
	expanded = input(false);

	constructor(
		private harborPilotStore: HarborPilotStore,
		private harborPilotService: HarborPilotService,
		private featureFlagService: FeatureFlagService
	) {}

	/**
	 *	Implements OnInit method.
	 */
	async ngOnInit() {
		// If this feature flag is enabled, filter the available suggested prompt categories based on their license.
		// @TODO CLEAN UP: MOON_632_HARBOR_PILOT_PRODUCT_FLAGS
		if (this.featureFlagService.isEnabled(FeatureFlags.MOON_632_HARBOR_PILOT_PRODUCT_FLAGS)) {
			const licenses = await this.harborPilotService.getEnabledLicenses();
			this.categories.set(
				new Map(
					[...HARBOR_PILOT_PROMPT_CATEGORIES_MAP].filter(([, category]) => {
						return licenses.includes(category.license);
					})
				)
			);
		}
	}

	/**
	 * Handles the click event on a prompt.
	 * @param {*} prompt
	 */
	onPromptClick(message: string, tool: string) {
		this.harborPilotStore.startConversationFromPrompt({
			message,
			tools: [tool] as Tools[]
		});
	}
}
