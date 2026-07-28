/*
 * Copyright (C) 2023 Acme Technologies, Inc.  All rights reserved.
 */
import { Injectable } from '@angular/core';

import { BehaviorSubject } from 'rxjs';

/**
 * The Config Hub Deploy Overlay Service
 *
 * Provides utilities for the Config Hub Deploy Overlay.
 */
@Injectable({ providedIn: 'root' })
export class ConfigHubDeployOverlayService {
	/**
	 * Whether or not the deploy overlay is open.
	 */
	public isOverlayOpen$: BehaviorSubject<boolean> = new BehaviorSubject(false);

	constructor() {}

	/**
	 * Opens the deploy overlay.
	 */
	public handleOpen(): void {
		this.isOverlayOpen$.next(true);
	}

	/**
	 * Closes the deploy overlay.
	 */
	public handleDismiss(): void {
		this.isOverlayOpen$.next(false);
	}
}
