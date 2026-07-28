/*
 * Copyright (C) 2023 Acme Technologies, Inc.  All rights reserved.
 */
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NavigationEnd, Router, RouterEvent } from '@angular/router';

import { MockStore, provideMockStore } from '@ngrx/store/testing';
import { ReplaySubject } from 'rxjs';

import { TranslateModule } from '@acme-priv/armada-angular/src/acme/angular/l10n/translation';

import { RoutingService } from '@acme-priv/ui-common/src/acme/angular/navigation/routing';
import { PathRouteService } from '@acme-priv/ui-common/src/acme/angular/shared';
import { FeatureFlagService } from '@acme-priv/ui-common/src/acme/angular/util';

import { tenantConnectionsSidebarActions } from './tenant-connections/store/actions';

import { ConfigHubComponent } from './config-hub.component';
import { CONFIG_HUB_URL, ConfigHubChildRoutes } from './config-hub.model';
import { tenantConnectionsInitialState } from './tenant-connections/store/states';

class MockPathRouteService {
	/**
	 * Mock getSelectedRoute.
	 */
	public getSelectedRoute() {
		return '';
	}
}

describe('ConfigHubComponent', () => {
	let fixture: ComponentFixture<ConfigHubComponent>;
	let component: ConfigHubComponent;
	let pathRouteService: PathRouteService;
	let mockStore: MockStore;
	let router: Router;
	let featureFlagService: FeatureFlagService;

	const routerEventSubject = new ReplaySubject<RouterEvent>(1);
	const routerMock = {
		events: routerEventSubject.asObservable(),
		navigate: jest.fn()
	};

	beforeEach(async () => {
		await TestBed.configureTestingModule({
			declarations: [ConfigHubComponent],
			imports: [TranslateModule.forRoot(), HttpClientTestingModule],
			providers: [
				{ provide: PathRouteService, useClass: MockPathRouteService },
				{ provide: Router, useValue: routerMock },
				provideMockStore({
					initialState: tenantConnectionsInitialState
				}),
				RoutingService
			]
		}).compileComponents();

		fixture = TestBed.createComponent(ConfigHubComponent);
		component = fixture.componentInstance;
		pathRouteService = TestBed.inject(PathRouteService);
		mockStore = TestBed.inject(MockStore);
		router = TestBed.inject(Router);
		fixture.detectChanges();
		featureFlagService = TestBed.inject(FeatureFlagService);
	});

	it('should create', () => {
		expect(component).toBeTruthy();
	});

	describe('ngOnInit', () => {
		it('should dispatch the tenantConnectionsSidebarShow action when feature flag is enabled', () => {
			const ffSpy = jest.spyOn(featureFlagService, 'isEnabled').mockReturnValue(true);
			const dispatchSpy = jest.spyOn(mockStore, 'dispatch');
			component.ngOnInit();
			expect(ffSpy).toHaveBeenCalled();
			expect(dispatchSpy).toHaveBeenCalledWith(tenantConnectionsSidebarActions.tenantConnectionsSidebarShow());
		});

		it('should not dispatch the tenantConnectionsSidebarShow action when feature flag is disabled', () => {
			const ffSpy = jest.spyOn(featureFlagService, 'isEnabled').mockReturnValue(false);
			const dispatchSpy = jest.spyOn(mockStore, 'dispatch');
			component.ngOnInit();
			expect(ffSpy).toHaveBeenCalled();
			expect(dispatchSpy).not.toHaveBeenCalled();
		});
	});

	describe('ngOnDestroy', () => {
		it('should complete unsubscribe$ subject', () => {
			const nextSpy = jest.spyOn((component as any).unsubscribe$, 'next');
			const completeSpy = jest.spyOn((component as any).unsubscribe$, 'complete');
			component.ngOnDestroy();
			expect(nextSpy).toHaveBeenCalled();
			expect(completeSpy).toHaveBeenCalled();
		});

		it('should dispatch the tenantConnectionsSidebarLeave action', () => {
			const dispatchSpy = jest.spyOn(mockStore, 'dispatch');
			component.isTenantConnectionsNavEnabled = true;
			component.ngOnDestroy();
			expect(dispatchSpy).toHaveBeenCalledWith(tenantConnectionsSidebarActions.tenantConnectionsSidebarLeave());
		});
	});

	describe('setSelectedTenant', () => {
		it('should navigate to backups page with selected tenant', () => {
			const routerSpy = jest.spyOn(router, 'navigate');
			component.isTenantConnectionsNavEnabled = true;
			component.setSelectedTenant('tenantName');
			expect(routerSpy).toHaveBeenCalledWith([CONFIG_HUB_URL, ConfigHubChildRoutes.BACKUPS?.route, 'tenantName']);
		});

		it('should navigate to backups page', () => {
			const routerSpy = jest.spyOn(router, 'navigate');
			component.isTenantConnectionsNavEnabled = true;
			component.setSelectedTenant();
			expect(routerSpy).toHaveBeenCalledWith([CONFIG_HUB_URL, ConfigHubChildRoutes.BACKUPS?.route]);
		});
	});

	describe('updateItemSelectedNavigationBar', () => {
		it('should be called on NavigationEnd events', done => {
			const updateItemSelectedNavigationBarSpy = jest.spyOn(component as any, 'updateItemSelectedNavigationBar');
			jest.spyOn(pathRouteService, 'getSelectedRoute').mockReturnValue(
				ConfigHubChildRoutes.BACKUPS?.route as string
			);

			routerEventSubject.subscribe(() => {
				expect(updateItemSelectedNavigationBarSpy).toHaveBeenCalled();
				done();
			});
			routerEventSubject.next(new NavigationEnd(1, '', ''));
		});

		it('should update the side navbar so that the current route appears selected', () => {
			const updateItemSelectedNavigationBarSpy = jest.spyOn(component as any, 'updateItemSelectedNavigationBar');
			jest.spyOn(pathRouteService, 'getSelectedRoute').mockReturnValue(
				ConfigHubChildRoutes.BACKUPS?.route as string
			);

			const backupRoute = component.configHubPageRoutes.find(
				routeDetails => routeDetails.route === ConfigHubChildRoutes.BACKUPS?.route
			);

			component.ngOnInit();
			expect(updateItemSelectedNavigationBarSpy).toHaveBeenCalled();
			expect(backupRoute?.selected).toEqual(true);
		});
	});
});
