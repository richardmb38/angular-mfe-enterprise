/*
 * Copyright (C) 2023 Acme Technologies, Inc.  All rights reserved.
 */
import { DatePipe } from '@angular/common';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { Router } from '@angular/router';

import { TranslateLoader } from '@ngx-translate/core';
import { GridReadyEvent, RowNode, ValueGetterFunc, ValueGetterParams } from 'ag-grid-community';
import { of } from 'rxjs';

import { LoadingMaskModule } from '@acme-priv/armada-angular/src/acme/angular/components/loading-mask';
import { ModalService } from '@acme-priv/armada-angular/src/acme/angular/components/modal';
import { TranslateStaticLoader } from '@acme-priv/armada-angular/src/acme/angular/l10n/translate-static-loader';
import { TranslateModule } from '@acme-priv/armada-angular/src/acme/angular/l10n/translation';

import { ApiListResponse } from '@acme-priv/ui-common/src/acme/angular/api';
import { UserRightsService } from '@acme-priv/ui-common/src/acme/angular/util/user-rights';

import { CONFIG_HUB_URL, ConfigHubChildRoutes } from '../../config-hub.model';
import { ConfigHubDraftJob, mockConfigHubDraftJob } from '../../shared/models';
import { ConfigHubDraftsApiService } from '../../shared/services';
import { ConfigHubDraftsListComponent } from './drafts-list.component';
import * as draftListModel from './drafts-list.model';

const mockGridReadyEvent = {
	api: {
		sizeColumnsToFit: jest.fn()
	}
} as unknown as GridReadyEvent;

describe('ConfigHubDraftsListComponent', () => {
	let component: ConfigHubDraftsListComponent;
	let fixture: ComponentFixture<ConfigHubDraftsListComponent>;
	let draftsApiService: ConfigHubDraftsApiService;
	let http: HttpTestingController;
	let modalService: ModalService;
	let datePipe: DatePipe;
	let apiPath: string;
	let router: Router;
	let userRightsService: UserRightsService;

	const routerMock = {
		navigate: () => {}
	};

	beforeEach(async () => {
		await TestBed.configureTestingModule({
			declarations: [ConfigHubDraftsListComponent],
			imports: [
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
			schemas: [CUSTOM_ELEMENTS_SCHEMA],
			providers: [
				DatePipe,
				{
					provide: ModalService,
					useValue: { open: () => Promise.resolve() }
				},
				{ provide: Router, useValue: routerMock }
			]
		}).compileComponents();
	});

	beforeEach(() => {
		fixture = TestBed.createComponent(ConfigHubDraftsListComponent);
		component = fixture.componentInstance;
		draftsApiService = TestBed.inject(ConfigHubDraftsApiService);
		http = TestBed.inject(HttpTestingController);
		modalService = TestBed.inject(ModalService);
		datePipe = TestBed.inject(DatePipe);
		router = TestBed.inject(Router);
		userRightsService = TestBed.inject(UserRightsService);
		fixture.detectChanges();

		apiPath = `${draftsApiService.API_VERSION}://${draftsApiService.API_PATH}`;
	});

	it('should create', () => {
		expect(component).toBeTruthy();
	});

	describe('onGridReady', () => {
		it('should set the gridApi', () => {
			expect(component.gridApi).not.toBeDefined();

			component.onGridReady(mockGridReadyEvent);
			expect(component.gridApi).toBeDefined();
		});
	});

	describe('onWindowSizeChangedEvent', () => {
		it('should resize the columns on window size change', () => {
			component.onGridReady(mockGridReadyEvent);
			const sizeColumnsToFitSpy = jest.spyOn((component as any).gridApi.api, 'sizeColumnsToFit');

			component.onWindowSizeChangedEvent();
			expect(sizeColumnsToFitSpy).toHaveBeenCalledTimes(1);
		});
	});

	describe('loadDrafts', () => {
		it('should load drafts', () => {
			jest.spyOn(draftsApiService, 'loadCompletedDraftJobs').mockReturnValue(
				of({
					items: [mockConfigHubDraftJob],
					count: 1
				} as ApiListResponse<ConfigHubDraftJob>)
			);

			(component as any).loadDrafts();
			expect(component.rows).toEqual([mockConfigHubDraftJob]);
			expect(component.totalDrafts).toEqual(1);
			expect(component.loading).toBeFalsy();
		});
	});

	describe('createdTimestamp column', () => {
		describe('valueGetter', () => {
			it('should return the created timestamp in a readable format', () => {
				const createdColValueGetter = component.columnDefs.find(colDef => colDef.colId === 'createdTimestamp')
					?.valueGetter as ValueGetterFunc;
				const mockParams = { data: mockConfigHubDraftJob } as ValueGetterParams;

				expect(createdColValueGetter(mockParams)).toEqual(
					datePipe.transform(mockConfigHubDraftJob.created, 'medium')
				);
			});
		});

		describe('comparator', () => {
			it('should compare timestamps for sorting', () => {
				const timeDiff = 999;
				const timeA = new Date();
				const timeB = new Date(timeA.getTime() + timeDiff);

				const nodeA = { data: { created: timeA.toISOString() } } as RowNode;
				const nodeB = { data: { created: timeB.toISOString() } } as RowNode;

				const completedColComparator = component.columnDefs.find(colDef => colDef.colId === 'createdTimestamp')
					?.comparator as any;

				expect(completedColComparator(null, null, nodeA, nodeB, true)).toEqual(-timeDiff);
			});
		});
	});

	describe('handleDeleteDraft', () => {
		it('should open a modal for confirmation', () => {
			const modalOpenSpy = jest.spyOn(modalService, 'open');
			(component as any).handleDeleteDraft(mockConfigHubDraftJob);
			expect(modalOpenSpy).toHaveBeenCalledWith(
				draftListModel.getDeleteDraftModalConfig(mockConfigHubDraftJob.name as string)
			);
		});

		it('should do nothing if modal is cancelled', fakeAsync(() => {
			const deleteSpy = jest.spyOn(draftsApiService, 'delete');

			const modalSpy = jest.spyOn(modalService, 'open').mockReturnValue(Promise.resolve(false));

			(component as any).handleDeleteDraft(mockConfigHubDraftJob);
			tick();

			expect(modalSpy).toHaveBeenCalled();
			expect(deleteSpy).not.toHaveBeenCalled();
		}));

		it('should call delete backup function on modal confirmation', fakeAsync(() => {
			const deleteSpy = jest.spyOn(draftsApiService, 'delete');
			jest.spyOn(modalService, 'open').mockReturnValue(Promise.resolve(true));
			(component as any).handleDeleteDraft(mockConfigHubDraftJob);
			tick();

			expect(component.loading).toBe(true);
			expect(deleteSpy).toHaveBeenCalledWith(mockConfigHubDraftJob.jobId);
		}));

		it('should filter rows and detect changes on delete success', fakeAsync(() => {
			const deleteSpy = jest.spyOn(draftsApiService, 'delete');
			jest.spyOn(draftsApiService, 'loadCompletedDraftJobs').mockReturnValue(
				of({
					items: [mockConfigHubDraftJob],
					count: 1
				} as ApiListResponse<ConfigHubDraftJob>)
			);
			(component as any).loadDrafts();
			jest.spyOn(modalService, 'open').mockReturnValue(Promise.resolve(true));
			(component as any).handleDeleteDraft(mockConfigHubDraftJob);
			tick();
			expect(deleteSpy).toHaveBeenCalledWith(mockConfigHubDraftJob.jobId);

			const request = http.expectOne({
				url: `${apiPath}/${mockConfigHubDraftJob.jobId}`,
				method: 'DELETE'
			});
			request.flush({});

			expect(component.rows).toEqual([]);
			expect(component.totalDrafts).toEqual(0);
			http.verify();
		}));
	});

	describe('handleViewEditDraft', () => {
		it('should navigate to view/edit draft page', () => {
			jest.spyOn(router, 'navigate').mockImplementation();

			(component as any).handleViewEditDraft(mockConfigHubDraftJob);

			expect(router.navigate).toHaveBeenCalledWith([
				CONFIG_HUB_URL,
				ConfigHubChildRoutes.DRAFTS?.route,
				mockConfigHubDraftJob.jobId
			]);
		});
	});

	describe('getActionsButtons', () => {
		it('should return view action button if role does not exists', done => {
			jest.spyOn(userRightsService, 'hasRight').mockReturnValue(new Promise(resolve => resolve(false)));
			(component as any).getActionsButtons().then(actionsButtons => {
				expect(actionsButtons.length).toEqual(1);
				done();
			});
		});

		it('should return two action buttons if role exists', done => {
			jest.spyOn(userRightsService, 'hasRight').mockReturnValue(new Promise(resolve => resolve(true)));
			(component as any).getActionsButtons().then(actionsButtons => {
				expect(actionsButtons.length).toEqual(2);
				done();
			});
		});
	});
});
