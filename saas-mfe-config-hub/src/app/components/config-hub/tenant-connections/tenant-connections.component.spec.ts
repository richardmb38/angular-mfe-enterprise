/*
 * Copyright (C) 2023 Acme Technologies, Inc.  All rights reserved.
 */
import { DatePipe } from '@angular/common';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';

import { StoreModule } from '@ngrx/store';
import { MockStore, provideMockStore } from '@ngrx/store/testing';
import { GridReadyEvent, RowNode } from 'ag-grid-community';
import { of, throwError } from 'rxjs';

import { AlertService } from '@acme-priv/armada-angular/src/acme/angular/components/alert';
import { ModalService } from '@acme-priv/armada-angular/src/acme/angular/components/modal';
import { TranslateModule } from '@acme-priv/armada-angular/src/acme/angular/l10n/translation';

import { tenantConnectionsApiActions, tenantConnectionsPageActions } from './store/actions';

import { getDeleteConnectionModalConfig, mockConfigHubTenantConnection } from '../shared/models';
import { ConfigHubTenantConnectionsService } from '../shared/services';
import { tenantConnectionsInitialState } from './store/states';
import { ConfigHubTenantConnectionsComponent } from './tenant-connections.component';

const mockGridReadyEvent = {
	api: {
		sizeColumnsToFit: jest.fn()
	}
} as unknown as GridReadyEvent;

describe('TenantConnectionsComponent', () => {
	let component: ConfigHubTenantConnectionsComponent;
	let fixture: ComponentFixture<ConfigHubTenantConnectionsComponent>;
	let tenantConnectionsService: ConfigHubTenantConnectionsService;
	let alertService: AlertService;
	let modalService: ModalService;
	let mockStore: MockStore;
	beforeEach(async () => {
		await TestBed.configureTestingModule({
			declarations: [ConfigHubTenantConnectionsComponent],
			imports: [
				StoreModule.forRoot([]),
				TranslateModule.forRoot(),
				HttpClientTestingModule,
				NoopAnimationsModule
			],
			providers: [
				provideMockStore({
					initialState: tenantConnectionsInitialState
				}),
				DatePipe
			]
		}).compileComponents();

		fixture = TestBed.createComponent(ConfigHubTenantConnectionsComponent);
		component = fixture.componentInstance;
		mockStore = TestBed.inject(MockStore);
		tenantConnectionsService = TestBed.inject(ConfigHubTenantConnectionsService);
		alertService = TestBed.inject(AlertService);
		modalService = TestBed.inject(ModalService);
		component = fixture.componentInstance;
		fixture.detectChanges();
	});

	it('should create', () => {
		expect(component).toBeTruthy();
	});
	describe('ngOnInit', () => {
		it('should dispatch the summaryPageOpen action', () => {
			const dispatchSpy = jest.spyOn(mockStore, 'dispatch');
			const initializeOptionsSpy = jest.spyOn(component as any, 'initializeGridOptions');

			component.ngOnInit();
			expect(dispatchSpy).toHaveBeenCalledWith(tenantConnectionsPageActions.tenantConnectionsPageEnter());
			expect(initializeOptionsSpy).toHaveBeenCalled();
		});
	});

	describe('initializeGridOptions', () => {
		it('should not display delete column if user does not have permission', fakeAsync(() => {
			component.canUserDeleteConnection$ = Promise.resolve(false);
			(component as any).initializeGridOptions();
			tick();
			expect(component.columnDefs.length).toBe(3);
		}));

		it('should display delete column if user has permission', fakeAsync(() => {
			component.canUserDeleteConnection$ = Promise.resolve(true);
			(component as any).initializeGridOptions();
			tick();
			expect(component.columnDefs.length).toBe(4);
		}));
	});

	describe('handleCreateTenantConnectionClicked', () => {
		it('Should open the create tenant connection modal', () => {
			component.isCreateTenantConnectionModalOpen = false;
			component.handleCreateTenantConnectionClicked();
			expect(component.isCreateTenantConnectionModalOpen).toBe(true);
		});
	});
	describe('handleCreateTenantConnectionDismiss', () => {
		it(`Should close the create tenant connection modal`, () => {
			component.isCreateTenantConnectionModalOpen = true;
			component.handleCreateTenantConnectionModalDismiss();
			expect(component.isCreateTenantConnectionModalOpen).toBe(false);
		});
	});

	describe('onGridReady', () => {
		it('should set the gridApi', () => {
			expect(component.gridApi).not.toBeDefined();

			component.onGridReady(mockGridReadyEvent);
			expect(component.gridApi).toBeDefined();
		});
	});

	describe('completedTimestamp column', () => {
		describe('comparator', () => {
			it('should compare timestamps for sorting', () => {
				const timeDiff = 999;
				const timeA = new Date();
				const timeB = new Date(timeA.getTime() + timeDiff);

				const nodeA = { data: { created: timeA.toISOString() } } as RowNode;
				const nodeB = { data: { created: timeB.toISOString() } } as RowNode;

				component.ngOnInit();

				const createdColComparator = component.columnDefs.find(colDef => colDef.field === 'created')
					?.comparator as any;

				expect(createdColComparator(null, null, nodeA, nodeB, true)).toEqual(-timeDiff);
			});
		});
	});

	describe('handleDeleteTenantConnection', () => {
		it('should open confirmation modal', () => {
			const modalOpenSpy = jest.spyOn(modalService, 'open');
			component.handleDeleteTenantConnection(mockConfigHubTenantConnection);
			expect(modalOpenSpy).toHaveBeenCalledWith(
				getDeleteConnectionModalConfig(mockConfigHubTenantConnection.sourceTenant)
			);
		});

		it('should do nothing if modal is cancelled', fakeAsync(() => {
			const deleteSpy = jest.spyOn(tenantConnectionsService, 'deleteTenantConnection');
			const modalSpy = jest.spyOn(modalService, 'open').mockReturnValue(Promise.resolve(false));
			component.handleDeleteTenantConnection(mockConfigHubTenantConnection);
			tick();

			expect(modalSpy).toHaveBeenCalled();
			expect(deleteSpy).not.toHaveBeenCalled();
		}));

		it('should call deleteTenantConnection function on modal confirmation', fakeAsync(() => {
			const deleteSpy = jest.spyOn(tenantConnectionsService, 'deleteTenantConnection');
			jest.spyOn(modalService, 'open').mockReturnValue(Promise.resolve(true));
			component.handleDeleteTenantConnection(mockConfigHubTenantConnection);
			tick();

			expect(component.loading).toBe(true);
			expect(deleteSpy).toHaveBeenCalledWith(mockConfigHubTenantConnection.sourceTenant);
		}));

		it('should dispatch tenant connection delete action and show success alert', fakeAsync(() => {
			jest.spyOn(tenantConnectionsService, 'deleteTenantConnection').mockReturnValue(of({}));
			jest.spyOn(modalService, 'open').mockReturnValue(Promise.resolve(true));

			const dispatchSpy = jest.spyOn(mockStore, 'dispatch');
			const alertOpenSpy = jest.spyOn(alertService, 'open');

			component.handleDeleteTenantConnection(mockConfigHubTenantConnection);
			tick();

			expect(alertOpenSpy).toHaveBeenCalled();
			expect(dispatchSpy).toHaveBeenCalledWith(
				tenantConnectionsApiActions.tenantConnectionDeleteSuccess({
					tenantConnection: mockConfigHubTenantConnection.sourceTenant
				})
			);

			expect(component.loading).toBeFalsy();
		}));

		it('should dispatch tenant connection delete error action on failure', fakeAsync(() => {
			jest.spyOn(tenantConnectionsService, 'deleteTenantConnection').mockReturnValue(throwError(() => 'error'));
			jest.spyOn(modalService, 'open').mockReturnValue(Promise.resolve(true));

			const dispatchSpy = jest.spyOn(mockStore, 'dispatch');
			const alertOpenSpy = jest.spyOn(alertService, 'open');

			component.handleDeleteTenantConnection(mockConfigHubTenantConnection);
			tick();

			expect(alertOpenSpy).not.toHaveBeenCalled();
			expect(dispatchSpy).toHaveBeenCalledWith(
				tenantConnectionsApiActions.tenantConnectionDeleteFailure({ errorMessage: 'error' })
			);

			expect(component.loading).toBeFalsy();
		}));
	});
});
