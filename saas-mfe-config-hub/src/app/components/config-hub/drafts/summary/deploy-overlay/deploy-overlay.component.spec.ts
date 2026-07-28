/*
 * Copyright (C) 2023 Acme Technologies, Inc.  All rights reserved.
 */
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { Router } from '@angular/router';

import { EffectsModule } from '@ngrx/effects';
import { StoreModule } from '@ngrx/store';
import { MockStore, provideMockStore } from '@ngrx/store/testing';
import { TranslateLoader } from '@ngx-translate/core';

import { LoadingMaskModule } from '@acme-priv/armada-angular/src/acme/angular/components/loading-mask';
import { TranslateStaticLoader } from '@acme-priv/armada-angular/src/acme/angular/l10n/translate-static-loader';
import { TranslateModule } from '@acme-priv/armada-angular/src/acme/angular/l10n/translation';
import { UnsavedChangesWarningService } from '@acme-priv/armada-angular/src/acme/angular/util/unsaved-changes-warning';

import { fromDraftsPage } from '../../store/selectors';

import { draftsPageInitialState } from '../../store/states';
import { ConfigHubDeployOverlayComponent } from './deploy-overlay.component';
import { ConfigHubDeployOverlayService } from './deploy-overlay.service';

describe('ConfigHubDeployOverlayComponent', () => {
	let component: ConfigHubDeployOverlayComponent;
	let fixture: ComponentFixture<ConfigHubDeployOverlayComponent>;
	let mockStore: MockStore;
	let configHubDeployOverlayService: ConfigHubDeployOverlayService;

	const routerMock = {
		navigate: () => {}
	};

	jest.spyOn(fromDraftsPage, 'selectDeployIsLoading').mockReturnValue(false);
	jest.spyOn(fromDraftsPage, 'selectDeployIsComplete').mockReturnValue(false);

	beforeEach(async () => {
		await TestBed.configureTestingModule({
			declarations: [ConfigHubDeployOverlayComponent],
			imports: [
				StoreModule.forRoot([]),
				EffectsModule.forRoot([]),
				TranslateModule.forRoot({
					loader: {
						provide: TranslateLoader,
						useClass: TranslateStaticLoader
					}
				}),
				HttpClientTestingModule,
				NoopAnimationsModule,
				LoadingMaskModule
			],
			providers: [
				provideMockStore({
					initialState: draftsPageInitialState
				}),
				UnsavedChangesWarningService,
				{ provide: Router, useValue: routerMock }
			],
			schemas: [CUSTOM_ELEMENTS_SCHEMA]
		}).compileComponents();

		configHubDeployOverlayService = TestBed.inject(ConfigHubDeployOverlayService);
		mockStore = TestBed.inject(MockStore);
		fixture = TestBed.createComponent(ConfigHubDeployOverlayComponent);
		component = fixture.componentInstance;
		fixture.detectChanges();
	});

	it('should create', () => {
		expect(component).toBeTruthy();
	});

	describe('ngOnDestroy', () => {
		it('should complete unsubscribe$ subject', () => {
			const nextSpy = jest.spyOn((component as any).unsubscribe$, 'next');
			const completeSpy = jest.spyOn((component as any).unsubscribe$, 'complete');

			component.ngOnDestroy();
			expect(nextSpy).toHaveBeenCalled();
			expect(completeSpy).toHaveBeenCalled();
		});
	});

	describe('handleDismiss', () => {
		it('should close the overlay if the deploy is not in progress or complete', fakeAsync(() => {
			const handleDismissSpy = jest.spyOn(configHubDeployOverlayService, 'handleDismiss');

			component.handleDismiss();
			tick();
			expect(handleDismissSpy).toHaveBeenCalled();
		}));

		it('should not close the overlay if the deploy is in progress', fakeAsync(() => {
			jest.spyOn(fromDraftsPage, 'selectDeployIsLoading').mockReturnValueOnce(true);

			const handleDismissSpy = jest.spyOn(configHubDeployOverlayService, 'handleDismiss');

			component.handleDismiss();
			tick();
			expect(handleDismissSpy).not.toHaveBeenCalled();
		}));

		it('should navigate to the main Config Hub page if the deploy is complete', fakeAsync(() => {
			jest.spyOn(fromDraftsPage, 'selectDeployIsComplete').mockReturnValueOnce(true);

			const navigateSpy = jest.spyOn(routerMock, 'navigate');

			component.handleDismiss();
			tick();
			expect(navigateSpy).toHaveBeenCalled();
		}));
	});

	describe('handleDeploy', () => {
		it('should dispatch the deployDraft action', () => {
			const dispatchSpy = jest.spyOn(mockStore, 'dispatch');

			component.handleDeploy();

			expect(dispatchSpy).toHaveBeenCalled();
		});
	});
});
