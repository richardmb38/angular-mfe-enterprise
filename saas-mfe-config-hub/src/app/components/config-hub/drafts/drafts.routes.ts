/*
 * Copyright (C) 2023 Acme Technologies, Inc.  All rights reserved.
 */
import { Routes, mapToCanActivate, mapToCanDeactivate } from '@angular/router';

import { ConfigHubChildRoutes } from '../config-hub.model';
import { ConfigHubDraftCreateComponent } from './create/draft-create.component';
import { ConfigHubDraftCreateGuard } from './create/draft-create.guard';
import { ConfigHubDraftDetailsComponent } from './details/draft-details.component';
import { ConfigHubDraftDetailsGuard } from './details/draft-details.guard';
import { ConfigHubDraftsComponent } from './drafts.component';
import { ConfigHubDraftsGuard } from './drafts.guard';
import { DraftsChildRoutes } from './drafts.model';
import { ConfigHubDraftSummaryComponent } from './summary/draft-summary.component';

export const DraftsRoutes: Routes = [
	{
		path: ConfigHubChildRoutes.DRAFTS.route,
		component: ConfigHubDraftsComponent,
		canDeactivate: mapToCanDeactivate([ConfigHubDraftsGuard]),
		children: [
			{
				// Drafts Create Page
				path: DraftsChildRoutes.CREATE.route,
				component: ConfigHubDraftCreateComponent,
				canActivate: mapToCanActivate([ConfigHubDraftCreateGuard])
			},
			{
				// Drafts Edit Page
				path: DraftsChildRoutes.EDIT.route,
				component: ConfigHubDraftSummaryComponent,
				pathMatch: 'full'
			},
			{
				// Drafs Object Details Page
				path: DraftsChildRoutes.DETAILS.route,
				component: ConfigHubDraftDetailsComponent,
				canActivate: mapToCanActivate([ConfigHubDraftDetailsGuard]),
				canDeactivate: mapToCanDeactivate([ConfigHubDraftDetailsGuard])
			},
			{
				path: '**',
				redirectTo: DraftsChildRoutes.LIST.route,
				pathMatch: 'full'
			}
		]
	}
];
