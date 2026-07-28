/*
 * Copyright (C) 2023 Acme Technologies, Inc.  All rights reserved.
 */
import { ChangeDetectionStrategy, Component, OnDestroy, OnInit } from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';

import { Store } from '@ngrx/store';
import { Subject } from 'rxjs';
import { filter, takeUntil } from 'rxjs/operators';

import { BrandingService } from '@acme-priv/armada-angular/src/acme/angular/util/branding';
import { WindowRef } from '@acme-priv/armada-angular/src/acme/angular/util/window-ref';

import { RoutingService } from '@acme-priv/ui-common/src/acme/angular/navigation/routing';
import { PathRouteService } from '@acme-priv/ui-common/src/acme/angular/shared';
import { FeatureFlagService } from '@acme-priv/ui-common/src/acme/angular/util';
import { UserRightsService } from '@acme-priv/ui-common/src/acme/angular/util/user-rights';

import { tenantConnectionsSidebarActions } from './tenant-connections/store/actions';
import { fromTenantConnections } from './tenant-connections/store/selectors';

import { CONFIG_HUB_URL, ConfigHubChildRouteDetails, ConfigHubChildRoutes } from './config-hub.model';
import { FeatureFlags } from 'app/featureflags.enum';
import { GlobalValue, LegacyGlobalServiceAdapter } from 'app/shared/services/globals';

/**
 * Configuration Hub Page
 *
 * Acts as a container for child components, enabling navigation between them via a side navigation bar.
 */
@Component({
	selector: 'app-config-hub',
	templateUrl: './config-hub.component.html',
	styleUrls: ['./config-hub.component.scss'],
	changeDetection: ChangeDetectionStrategy.OnPush
})
export class ConfigHubComponent implements OnInit, OnDestroy {
	/**
	 * An array of the valid Configuration Hub routes.
	 */
	public configHubPageRoutes: ConfigHubChildRouteDetails[] = Object.values(ConfigHubChildRoutes)
		.filter(route =>
			route.featureFlag ? this.featureFlagService.isEnabled(route.featureFlag) && route.label : route.label
		)
		.map(route =>
			route.children
				? {
						...route,
						children: route.children.filter(child =>
							child.featureFlag
								? this.featureFlagService.isEnabled(child.featureFlag) && child.label
								: child.label
						)
					}
				: route
		);

	/**
	 * Flag that indicated if the tenant connections navigation is enabled or not
	 * TODO: Cleanup in https://acme.atlassian.net/browse/PLTCONFHUB-1026
	 */
	public isTenantConnectionsNavEnabled = this.featureFlagService.isEnabled(
		FeatureFlags.PLT_UI_ADMIRAL_TENANT_CONNECTIONS_NAV
	);

	/**
	 * The child routes
	 */
	readonly configHubChildRoutes = ConfigHubChildRoutes;

	/**
	 * The current tenant.
	 */
	public currentTenant: string;

	/**
	 * The current route.
	 */
	public selectedRoute: string;

	/**
	 * Subject to unsubscribe on destroy.
	 */
	private unsubscribe$ = new Subject<void>();

	/**
	 * The list of tenant connections
	 */
	public tenantConnections$ = this.store.select(fromTenantConnections.getTenantConnectionsSelectors().selectAll);

	/**
	 * Currently selected tenant
	 */
	public selectedTenant$ = this.store.select(fromTenantConnections.selectSelectedTenantConnection);

	/**
	 * Flag to indicate if the list of tenant connections is loading
	 */
	public tenantConnectionsLoading$ = this.store.select(
		fromTenantConnections.getTenantConnectionsSelectors().selectIsLoading
	);

	constructor(
		private featureFlagService: FeatureFlagService,
		private globalService: LegacyGlobalServiceAdapter,
		private pathRouteService: PathRouteService,
		private router: Router,
		private routingService: RoutingService,
		private windowRef: WindowRef,
		private store: Store,
		private userRightsService: UserRightsService,
		public brandingService: BrandingService
	) {}

	/**
	 * Initialization of the component.
	 */
	ngOnInit(): void {
		this.currentTenant = this.globalService.get<string>(GlobalValue.OrgScriptName);

		// TODO: Cleanup in https://acme.atlassian.net/browse/PLTCONFHUB-1026
		if (this.featureFlagService.isEnabled(FeatureFlags.PLT_UI_ADMIRAL_TENANT_CONNECTIONS_NAV)) {
			this.configHubPageRoutes = this.configHubPageRoutes.filter(route => route.route !== 'backups');
			this.store.dispatch(tenantConnectionsSidebarActions.tenantConnectionsSidebarShow());
		}

		this.filterRoutes([...this.configHubPageRoutes]).then(routes => {
			this.configHubPageRoutes = routes;
		});

		this.initRouteSubscription();
		this.updateItemSelectedNavigationBar();
	}

	/**
	 * Clean up when the instance is destroyed.
	 */
	ngOnDestroy(): void {
		this.unsubscribe$.next();
		this.unsubscribe$.complete();
		if (this.isTenantConnectionsNavEnabled) {
			this.store.dispatch(tenantConnectionsSidebarActions.tenantConnectionsSidebarLeave());
		}
	}

	/**
	 * Sets the selected tenant in the store and navigates to its list of backups
	 */
	public setSelectedTenant(tenantConnectionId?: string): void {
		if (tenantConnectionId) {
			this.router.navigate([CONFIG_HUB_URL, ConfigHubChildRoutes.BACKUPS.route, tenantConnectionId]);
		} else {
			this.router.navigate([CONFIG_HUB_URL, ConfigHubChildRoutes.BACKUPS.route]);
		}
	}

	/**
	 * Navigates the user to the App Switcher.
	 */
	public handleDismiss(): void {
		this.windowRef.nativeWindow.location.href = this.routingService.IDN_APP_SWITCHER_PATH;
	}

	/**
	 * Subscribe to router events so that we can update the side navbar on navigation.
	 */
	private initRouteSubscription(): void {
		this.router.events
			.pipe(
				takeUntil(this.unsubscribe$),
				filter(event => event instanceof NavigationEnd)
			)
			.subscribe(() => {
				this.updateItemSelectedNavigationBar();
			});
	}

	/**
	 * Update the side navbar so that the current route appears selected.
	 */
	private updateItemSelectedNavigationBar(): void {
		this.selectedRoute = this.pathRouteService.getSelectedRoute();

		this.configHubPageRoutes.forEach(item => {
			if (!item.children) {
				item.selected = item.route === this.selectedRoute;
			} else {
				item.selected =
					item.route === this.selectedRoute ||
					item.children.some(child => child.route === this.selectedRoute);
			}
		});
	}

	/**
	 * Determines if a route should be shown or not
	 */
	private async shouldShowRoute(route: ConfigHubChildRouteDetails): Promise<boolean> {
		if (route.permission) {
			return this.userRightsService.hasRight(route.permission);
		}

		return Promise.resolve(true);
	}

	/**
	 * Filter routes by permissions
	 */
	private async filterRoutes(routes: ConfigHubChildRouteDetails[]): Promise<ConfigHubChildRouteDetails[]> {
		const filteredRoutes: ConfigHubChildRouteDetails[] = [];

		await Promise.all(
			routes.map(async (route: ConfigHubChildRouteDetails) => {
				let newRoute: ConfigHubChildRouteDetails = route;

				if (route.children) {
					const filteredChildren = await this.filterRoutes(route.children);
					newRoute = {
						...route,
						children: filteredChildren
					};
				}

				const shouldShow = await this.shouldShowRoute(route);

				if (shouldShow) {
					filteredRoutes.push(newRoute);
				}

				return newRoute;
			})
		);

		return filteredRoutes;
	}
}
