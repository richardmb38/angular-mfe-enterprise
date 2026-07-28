/*
 * Copyright (C) 2024 Acme Technologies, Inc.  All rights reserved.
 */
import { Component, ElementRef, Injector, OnInit, Signal, ViewChild, inject, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';

import { provideComponentStore } from '@ngrx/component-store';

import { chatbotIconTriggerButton } from '@acme-priv/ui-common/src/acme/angular/shared';
import { LayerManagerService } from '@acme-priv/ui-common/src/acme/angular/util/app-shell';

import { HarborPilotStore } from './harbor-pilot.store';
import { HarborPilotService } from './shared/services/harbor-pilot.service';

@Component({
	selector: 'app-harbor-pilot',
	templateUrl: './harbor-pilot.component.html',
	styleUrls: ['./harbor-pilot.component.scss'],
	providers: [[provideComponentStore(HarborPilotStore)]]
})
export class HarborPilotComponent implements OnInit {
	/**
	 * Dynamic container used to create the HarborPilotIconButtonComponent.
	 */
	@ViewChild('buttonReference', { read: ElementRef }) buttonReference!: ElementRef;

	/**
	 * Whether all required feature flags and user rights to mount the trigger evaluate's to true.
	 */
	isEnabled = signal(false);

	/**
	 * Flag to keep track of if the feature enable overlay is shown.
	 */
	isTermsDisclaimerShown = signal(false);

	/**
	 * Whether the chat overlay is open.
	 */
	isOpen: Signal<boolean> = signal(false);

	/**
	 * Injector instance to inject the required services.
	 */
	private injector = inject(Injector);

	constructor(
		private layerManagerService: LayerManagerService,
		private harborPilotService: HarborPilotService,
		private harborPilotStore: HarborPilotStore
	) {}

	/**
	 * Implements OnInit method.
	 */
	async ngOnInit() {
		// Wait to validate if all required feature flags and licenses are present.
		this.isEnabled.set(await this.harborPilotService.isHarborPilotEnabled());
		// Wait to validate if the feature is enabled on the system settings else show the terms disclaimer.
		this.harborPilotStore.setFeatureEnabledOnSystemSettings(
			await this.harborPilotService.isHarborPilotEnabledOnSystemSettings()
		);

		// Once we have all the necesary validations in place, we can proceed to relocate the trigger.
		if (this.isEnabled()) {
			// Delay this on the callback queue to ensure the trigger element is rendered in the DOM.
			setTimeout(() => {
				this.relocateTriggerButton();
				this.isOpen = toSignal(this.harborPilotStore.selectIsOpen$, { injector: this.injector });
			});
		}
	}

	/**
	 * Method to activate the Harbor Pilot trigger button layer.
	 */
	relocateTriggerButton() {
		this.layerManagerService.onActivate(chatbotIconTriggerButton, async ({ element }) => {
			// Add the navigation item class to the target HTMLElement.
			element.classList.add('slpt-nav-item', 'slpt-nav-item-white');
			// Append the HarborPilotIconButtonComponent HTML to the target HTMLElement.
			element.replaceChildren(this.buttonReference.nativeElement);
			return { result: 'success', success: true };
		});
	}

	/**
	 * Opens the overlay.
	 */
	onTriggerButtonClick(): void {
		this.harborPilotStore.setOpenState(!this.isOpen());
	}

	/**
	 * Closes the overlay.
	 */
	onDismiss(): void {
		this.harborPilotStore.setOpenState(false);
	}
}
