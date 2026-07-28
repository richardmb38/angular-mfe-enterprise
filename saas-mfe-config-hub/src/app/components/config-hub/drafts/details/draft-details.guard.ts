/*
 * Copyright (C) 2023 Acme Technologies, Inc.  All rights reserved.
 */
import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, Router, RouterStateSnapshot } from '@angular/router';

import { Store } from '@ngrx/store';
import { firstValueFrom } from 'rxjs';

import { UnsavedChangesWarningService } from '@acme-priv/armada-angular/src/acme/angular/util/unsaved-changes-warning';

import { fromDraftsPage } from '../store/selectors';

import { ConfigHubDraftDetailsComponent } from './draft-details.component';

/**
 * Guards the draft details page in Configuration Hub
 * to ensure the store has a selectedObjectType and available operation types.
 */
@Injectable({ providedIn: 'root' })
export class ConfigHubDraftDetailsGuard {
	constructor(
		private router: Router,
		private store: Store,
		private unsavedChangesWarningService: UnsavedChangesWarningService
	) {}

	/**
	 *  Decide if a route can be activated.
	 */
	async canActivate(
		_activatedRouteSnapshot: ActivatedRouteSnapshot,
		routerStateSnapshot: RouterStateSnapshot
	): Promise<boolean> {
		const [selectedObjectType, availableOperationTypes] = await Promise.all([
			firstValueFrom(this.store.select(fromDraftsPage.selectSelectedObjectType)),
			firstValueFrom(this.store.select(fromDraftsPage.selectAvailableOperationTypes()))
		]);

		if (selectedObjectType && availableOperationTypes.length > 0) {
			return true;
		}

		// Navigate to parent route
		const urlSegments = routerStateSnapshot.url.split('/');
		urlSegments.pop();
		this.router.navigate(urlSegments);
		return false;
	}

	/**
	 *  Decide if a route can be deactivated.
	 */
	async canDeactivate(): Promise<boolean> {
		return await this.unsavedChangesWarningService.promptToAbandonUnsavedChanges(ConfigHubDraftDetailsComponent);
	}
}
