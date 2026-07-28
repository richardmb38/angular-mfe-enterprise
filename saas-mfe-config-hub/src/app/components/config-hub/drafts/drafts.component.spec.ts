/*
 * Copyright (C) 2023 Acme Technologies, Inc.  All rights reserved.
 */
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { Router, RouterEvent } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';

import { createSelector } from '@ngrx/store';
import { MockStore, provideMockStore } from '@ngrx/store/testing';
import { ReplaySubject } from 'rxjs';

import { ModalService } from '@acme-priv/armada-angular/src/acme/angular/components/modal';
import { TranslateModule } from '@acme-priv/armada-angular/src/acme/angular/l10n/translation';

import { PathRouteService } from '@acme-priv/ui-common/src/acme/angular/shared';

import { draftsPageActions } from './store/actions';
import { fromDraftsPage } from './store/selectors';

import { ConfigHubApprovalStatus, mockConfigHubDraftJobSummary } from '../shared/models';
import { ConfigHubDraftsComponent } from './drafts.component';
import { DraftsChildRoutes } from './drafts.model';
import { DraftsRoutes } from './drafts.routes';
import { draftsPageInitialState } from './store/states';
import { ConfigHubDeployOverlayService } from './summary/deploy-overlay/deploy-overlay.service';

const mockPath = 'config-hub/drafts/some-id';

const routerMock = {
	routerState: {
		snapshot: {
			url: `${mockPath}/details`
		}
	},
	lastSuccessfulNavigation: {
		extras: {
			state: {
				sourceBackupName: 'any-name'
			}
		}
	},
	navigate: () => {}
};

class MockPathRouteService {
	/**
	 * Mock getSelectedRoute.
	 */
	public getSelectedRoute() {
		return mockConfigHubDraftJobSummary.jobId;
	}
}

describe('ConfigHubDraftsComponent', () => {
	let fixture: ComponentFixture<ConfigHubDraftsComponent>;
	let component: ConfigHubDraftsComponent;
	let configHubDeployOverlayService: ConfigHubDeployOverlayService;
	let modalService: ModalService;
	let pathRouteService: PathRouteService;
	let router: Router;
	let mockStore: MockStore;

	const routerEventSubject = new ReplaySubject<RouterEvent>(1);

	jest.spyOn(fromDraftsPage, 'selectDraftId').mockReturnValue(mockConfigHubDraftJobSummary.jobId);

	jest.spyOn(fromDraftsPage, 'selectIsDraftDirty').mockImplementation(
		() =>
			createSelector(
				() => null,
				() => null,
				() => true
			) as any
	);

	jest.spyOn(fromDraftsPage, 'selectIsDraftDeployable').mockImplementation(
		() =>
			createSelector(
				() => null,
				() => null,
				() => null,
				() => true
			) as any
	);

	beforeEach(async () => {
		await TestBed.configureTestingModule({
			declarations: [ConfigHubDraftsComponent],
			imports: [RouterTestingModule.withRoutes(DraftsRoutes), TranslateModule.forRoot(), HttpClientTestingModule],
			providers: [
				ConfigHubDeployOverlayService,
				{ provide: PathRouteService, useClass: MockPathRouteService },
				{
					provide: Router,
					useValue: routerMock
				},
				provideMockStore({
					initialState: draftsPageInitialState
				})
			]
		}).compileComponents();

		mockStore = TestBed.inject(MockStore);
		fixture = TestBed.createComponent(ConfigHubDraftsComponent);
		component = fixture.componentInstance;
		configHubDeployOverlayService = TestBed.inject(ConfigHubDeployOverlayService);
		modalService = TestBed.inject(ModalService);
		pathRouteService = TestBed.inject(PathRouteService);
		router = TestBed.inject(Router);
		(router as any).events = routerEventSubject.asObservable();
		fixture.detectChanges();
	});

	it('should create', () => {
		expect(component).toBeTruthy();
	});

	describe('ngOnDestroy', () => {
		it('should dispatch the draftsPageLeave action', () => {
			const dispatchSpy = jest.spyOn(mockStore, 'dispatch');

			component.ngOnDestroy();

			expect(dispatchSpy).toHaveBeenCalledWith(draftsPageActions.draftsPageLeave());
		});

		it('should complete unsubscribe$ subject', () => {
			const nextSpy = jest.spyOn((component as any).unsubscribe$, 'next');
			const completeSpy = jest.spyOn((component as any).unsubscribe$, 'complete');
			component.ngOnDestroy();
			expect(nextSpy).toHaveBeenCalled();
			expect(completeSpy).toHaveBeenCalled();
		});
	});

	describe('handleDismiss', () => {
		it('should navigate the user to the previous page', () => {
			const navigateSpy = jest.spyOn(router, 'navigate');
			component.handleDismiss();
			expect(navigateSpy).toHaveBeenCalled();
		});
	});

	describe('handleSave', () => {
		it('should dispatch the saveAllDraftChanges action', fakeAsync(() => {
			const dispatchSpy = jest.spyOn(mockStore, 'dispatch');
			component.handleSave();
			tick();
			expect(dispatchSpy).toHaveBeenCalledWith(draftsPageActions.saveAllDraftChanges());
		}));
	});

	describe('handleBackToSummary', () => {
		it('should navigate the user to the draft summary page', () => {
			const navigateSpy = jest.spyOn(router, 'navigate');
			component.handleBackToSummary();
			expect(navigateSpy).toHaveBeenCalledWith(mockPath.split('/'));
		});
	});

	describe('handleDeploy', () => {
		it('should call handleOpen on the ConfigHubDeployOverlayService', fakeAsync(() => {
			const handleOpenSpy = jest.spyOn(configHubDeployOverlayService, 'handleOpen');

			component.handleDeploy();
			tick();

			expect(handleOpenSpy).toHaveBeenCalled();
		}));
	});

	describe('handleDiscardChanges', () => {
		it('should dispatch the discardAllDraftChanges action', fakeAsync(() => {
			const dispatchSpy = jest.spyOn(mockStore, 'dispatch');

			component.handleDiscardChanges();
			tick();

			expect(dispatchSpy).toHaveBeenCalledWith(draftsPageActions.discardAllDraftChanges());
		}));
	});

	describe('updateHeaderText', () => {
		it('should set showHeaderControls to true when path === draftId', fakeAsync(() => {
			jest.spyOn(pathRouteService, 'getSelectedRoute').mockReturnValue(mockConfigHubDraftJobSummary.jobId);
			(component as any).updateHeaderText();
			tick();
			expect(component.showHeaderControls).toEqual(true);
		}));

		it("should set showBackToSummary to true when path === 'details'", fakeAsync(() => {
			jest.spyOn(pathRouteService, 'getSelectedRoute').mockReturnValue(
				DraftsChildRoutes.DETAILS.route.split('/')[1]
			);
			(component as any).updateHeaderText();
			tick();
			expect(component.showBackToSummary).toEqual(true);
		}));
	});

	describe('getCancelRequestLabel', () => {
		it('should return Cancel Request when approval status is pending', () => {
			component.currentApprovalStatus = ConfigHubApprovalStatus.PENDING_FOR_APPROVAL;

			expect(component.getCancelRequestLabel()).toBe('CONFIG_HUB.CANCEL_REQUEST');
		});

		it('should return Edit and Resubmit when approval status is approved', () => {
			component.currentApprovalStatus = ConfigHubApprovalStatus.APPROVED;

			expect(component.getCancelRequestLabel()).toBe('CONFIG_HUB.EDIT_AND_RESUBMIT');
		});

		it('should return Edit and Resubmit when approval status is denied', () => {
			component.currentApprovalStatus = ConfigHubApprovalStatus.DENIED;

			expect(component.getCancelRequestLabel()).toBe('CONFIG_HUB.EDIT_AND_RESUBMIT');
		});
	});

	describe('handleCancelRequest', () => {
		it('should call handleApprovalStatusChange when confirmed', fakeAsync(() => {
			jest.spyOn(modalService, 'open').mockResolvedValue(true);
			const handleApprovalStatusChangeSpy = jest.spyOn(component, 'handleApprovalStatusChange');

			component.handleCancelRequest();

			tick();

			expect(handleApprovalStatusChangeSpy).toHaveBeenCalledWith(null);
		}));

		it('should not call handleApprovalStatusChange when canceled', fakeAsync(() => {
			jest.spyOn(modalService, 'open').mockResolvedValue(false);
			const handleApprovalStatusChangeSpy = jest.spyOn(component, 'handleApprovalStatusChange');

			component.handleCancelRequest();

			tick();

			expect(handleApprovalStatusChangeSpy).not.toHaveBeenCalled();
		}));
	});

	describe('isLastRequester', () => {
		it('should return false if current user and last requester id are different', () => {
			(component as any).isConfigHubDraftApprovalEnabled = true;
			component.isApprovalsFeatureEnabled = true;

			component.currentUserId = '123';
			component.lastRequesterId = '456';

			expect(component.isLastRequester()).toBeFalsy();
		});

		it('should return true if current user and last requester id are equal', () => {
			(component as any).isConfigHubDraftApprovalEnabled = true;
			component.isApprovalsFeatureEnabled = true;

			component.currentUserId = '123';
			component.lastRequesterId = '123';

			expect(component.isLastRequester()).toBeTruthy();
		});
	});

	describe('isSameUser', () => {
		it('should return false if current user and last user id are different', () => {
			component.currentUserId = '123';
			component.lastUserId = '456';

			expect(component.isSameUser()).toBeFalsy();
		});

		it('should return true if current user and last user id are equal', () => {
			component.currentUserId = '123';
			component.lastUserId = '123';

			expect(component.isSameUser()).toBeTruthy();
		});
	});

	describe('shouldShowCancelRequestButton', () => {
		beforeEach(() => {
			(component as any).isConfigHubDraftApprovalEnabled = true;
			component.isApprovalsFeatureEnabled = true;
		});

		it('should return true if approval status is DENIED', () => {
			component.currentApprovalStatus = ConfigHubApprovalStatus.DENIED;

			expect(component.shouldShowCancelRequestButton()).toBeTruthy();
		});

		it('should return false if approval status is null (used to be default)', () => {
			component.currentApprovalStatus = null;

			expect(component.shouldShowCancelRequestButton()).toBeFalsy();
		});

		it('should return true if approval status is PENDING', () => {
			component.currentApprovalStatus = ConfigHubApprovalStatus.PENDING_FOR_APPROVAL;

			expect(component.shouldShowCancelRequestButton()).toBeTruthy();
		});

		it('should return false if approval status APPROVED', () => {
			component.currentApprovalStatus = ConfigHubApprovalStatus.APPROVED;

			expect(component.shouldShowCancelRequestButton()).toBeTruthy();
		});
	});
});
