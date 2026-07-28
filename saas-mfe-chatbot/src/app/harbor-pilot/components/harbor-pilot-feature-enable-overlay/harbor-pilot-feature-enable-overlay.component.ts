import { Component } from '@angular/core';

import { HarborPilotStore } from 'app/harbor-pilot/harbor-pilot.store';
import { OrgConfiguration } from 'app/harbor-pilot/shared/models/org-configuration.model';
import { HarborPilotService } from 'app/harbor-pilot/shared/services/harbor-pilot.service';

@Component({
	selector: 'app-harbor-pilot-feature-enable-overlay',
	templateUrl: './harbor-pilot-feature-enable-overlay.component.html',
	styleUrl: './harbor-pilot-feature-enable-overlay.component.scss'
})
export class HarborPilotFeatureEnableOverlayComponent {
	constructor(
		private harborPilotService: HarborPilotService,
		private harborPilotStore: HarborPilotStore
	) {}

	/**
	 * Handles the user action when they click on the "Enable and Continue" button.
	 */
	onEnableAndContinue(): void {
		this.harborPilotService
			.updateHarborPilotOnSystemSettings(true)
			.subscribe((orgConfiguration: OrgConfiguration) => {
				this.harborPilotStore.setFeatureEnabledOnSystemSettings(orgConfiguration.harborPilotEnabled);
			});
	}

	/**
	 * Handles the user action when they click on the "Cancel" button.
	 */
	onCancel(): void {
		this.harborPilotStore.setOpen(false);
	}
}
