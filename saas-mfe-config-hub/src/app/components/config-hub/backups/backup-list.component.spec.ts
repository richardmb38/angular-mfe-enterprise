/*
 * Copyright (C) 2023 Acme Technologies, Inc.  All rights reserved.
 */
import { DatePipe } from '@angular/common';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { ActivatedRoute, Router } from '@angular/router';

import { provideMockStore } from '@ngrx/store/testing';
import { TranslateLoader } from '@ngx-translate/core';
import { GridReadyEvent, RowNode, ValueGetterFunc, ValueGetterParams } from 'ag-grid-community';
import { of } from 'rxjs';
import { take } from 'rxjs/operators';

import { AlertsToasterService } from '@acme-priv/armada-angular/src/acme/angular/components/alert';
import { LoadingMaskModule } from '@acme-priv/armada-angular/src/acme/angular/components/loading-mask';
import { ModalService } from '@acme-priv/armada-angular/src/acme/angular/components/modal';
import { TranslateStaticLoader } from '@acme-priv/armada-angular/src/acme/angular/l10n/translate-static-loader';
import { TranslateModule } from '@acme-priv/armada-angular/src/acme/angular/l10n/translation';

import { ApiListResponse } from '@acme-priv/ui-common/src/acme/angular/api/api-service';

import {
	ConfigHubBackupJob,
	ConfigHubJobStatus,
	IncludedNames,
	JOB_STATUS_POLL_PERIOD,
	MAX_MANUAL_BACKUPS_ALLOWED,
	mockAutomatedConfigHubBackupJob,
	mockConfigHubBackupJob,
	mockConfigHubBackupTotalObjectLimit
} from '../shared/models';
import { ConfigHubBackupsApiService, ConfigHubTenantConnectionsService } from '../shared/services';
import { tenantConnectionsInitialState } from '../tenant-connections/store/states';
import { ConfigHubBackupListComponent } from './backup-list.component';
import * as backupListModel from './backup-list.model';

const mockGridReadyEvent = {
	api: {
		sizeColumnsToFit: jest.fn()
	}
} as unknown as GridReadyEvent;

const mockCellClickedArgs = { column: { getColId: () => 'backupName' }, data: mockConfigHubBackupJob };

describe('ConfigHubBackupListComponent', () => {
	let component: ConfigHubBackupListComponent;
	let fixture: ComponentFixture<ConfigHubBackupListComponent>;
	let alertService: AlertsToasterService;
	let backupsApiService: ConfigHubBackupsApiService;
	let tenantConnectionsService: ConfigHubTenantConnectionsService;
	let http: HttpTestingController;
	let datePipe: DatePipe;
	let modalService: ModalService;
	let apiPath: string;

	const routerMock = {
		navigate: () => {}
	};

	const activatedRouteMock = {
		paramMap: {
			get: () => 'test-id'
		}
	};

	beforeEach(async () => {
		await TestBed.configureTestingModule({
			declarations: [ConfigHubBackupListComponent],
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
				{ provide: Router, useValue: routerMock },
				{
					provide: ActivatedRoute,
					useValue: activatedRouteMock
				},
				provideMockStore({
					initialState: tenantConnectionsInitialState
				})
			]
		}).compileComponents();

		fixture = TestBed.createComponent(ConfigHubBackupListComponent);
		component = fixture.componentInstance;
		alertService = TestBed.inject(AlertsToasterService);
		backupsApiService = TestBed.inject(ConfigHubBackupsApiService);
		tenantConnectionsService = TestBed.inject(ConfigHubTenantConnectionsService);
		datePipe = TestBed.inject(DatePipe);
		http = TestBed.inject(HttpTestingController);
		modalService = TestBed.inject(ModalService);
		fixture.detectChanges();

		apiPath = `${backupsApiService.API_VERSION}://${backupsApiService.API_PATH}`;
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

	describe('handleCreateBackupClicked', () => {
		it('should open the Create Backup Modal', () => {
			component.isBackupInProgress = false;
			component.totalManualBackups = MAX_MANUAL_BACKUPS_ALLOWED - 1;
			component.handleCreateBackupClicked();
			expect(component.showCreateBackupOverlay).toBe(true);
		});

		it('should not open the Create Backup Modal if a backup is in progress', () => {
			component.isBackupInProgress = true;
			component.handleCreateBackupClicked();
			expect(component.showCreateBackupOverlay).toBe(false);
		});

		it('should open the Create Backup Modal if max backup number is reached', () => {
			component.totalManualBackups = MAX_MANUAL_BACKUPS_ALLOWED;
			component.handleCreateBackupClicked();
			expect(component.showCreateBackupOverlay).toBe(false);
		});
	});

	describe('destroyExistingAlerts', () => {
		it('should call destroy method', () => {
			const alertSpy = jest.spyOn(alertService, 'destroy');
			(component as any).destroyExistingAlerts();

			Object.keys(ConfigHubJobStatus).forEach(status => {
				expect(alertSpy).toHaveBeenCalledWith(status);
			});
		});
	});

	describe('handleSummaryOverlayClose', () => {
		it('should set the selected backup to be null', () => {
			(component as any).handleCellClicked(mockCellClickedArgs);

			expect(component.selectedBackup).toEqual(mockConfigHubBackupJob);
			component.handleSummaryOverlayClose();
			expect(component.selectedBackup).toEqual(null);
		});
	});

	describe('handleBackupOverlayClose', () => {
		it('should close the partial backup overlay', () => {
			component.showCreateBackupOverlay = true;
			component.handleBackupOverlayClose({
				selectedObjectTypes: ['anObjectType'],
				backupName: 'any name',
				isPartialBackup: false
			});
			expect(component.showCreateBackupOverlay).toBe(false);
		});

		it('should not create a backup if name is not defined', () => {
			const createPartialBackupJobSpy = jest.spyOn(backupsApiService, 'createPartialBackupJob');
			const createBackupJobSpy = jest.spyOn(backupsApiService, 'createBackupJob');
			component.handleBackupOverlayClose({
				selectedObjectTypes: ['anObjectType'],
				backupName: undefined,
				isPartialBackup: false
			});
			expect(createPartialBackupJobSpy).not.toHaveBeenCalled();
			expect(createBackupJobSpy).not.toHaveBeenCalled();
		});

		it('should not create a backup if no object types are selected ', () => {
			const createPartialBackupJobSpy = jest.spyOn(backupsApiService, 'createPartialBackupJob');
			const createBackupJobSpy = jest.spyOn(backupsApiService, 'createBackupJob');
			component.handleBackupOverlayClose({
				selectedObjectTypes: [],
				backupName: 'name',
				isPartialBackup: false
			});
			expect(createPartialBackupJobSpy).not.toHaveBeenCalled();
			expect(createBackupJobSpy).not.toHaveBeenCalled();
		});

		it('should create a full backup if isPartialBackup is false', () => {
			const createPartialBackupJobSpy = jest.spyOn(backupsApiService, 'createPartialBackupJob');
			const createBackupJobSpy = jest.spyOn(backupsApiService, 'createBackupJob');
			component.handleBackupOverlayClose({
				selectedObjectTypes: ['SOURCE', 'AUTH_ORG'],
				backupName: 'name',
				isPartialBackup: false
			});
			expect(createPartialBackupJobSpy).not.toHaveBeenCalled();
			expect(createBackupJobSpy).toHaveBeenCalled();
		});

		it('should create a partial backup if isPartialBackup is true', () => {
			const createPartialBackupJobSpy = jest.spyOn(backupsApiService, 'createPartialBackupJob');
			const createBackupJobSpy = jest.spyOn(backupsApiService, 'createBackupJob');
			component.handleBackupOverlayClose({
				selectedObjectTypes: ['SOURCE', 'AUTH_ORG'],
				options: new Map<string, IncludedNames>(),
				backupName: 'name',
				isPartialBackup: true
			});
			expect(createPartialBackupJobSpy).toHaveBeenCalled();
			expect(createBackupJobSpy).not.toHaveBeenCalled();
		});
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

	describe('handleBackupJobStatusChanges', () => {
		it('should call toggleIsBackupInProgress', () => {
			const toggleIsBackupInProgressSpy = jest.spyOn(component as any, 'setBackupInProgress');

			(component as any).handleBackupJobStatusChanges(mockConfigHubBackupJob);
			expect(toggleIsBackupInProgressSpy).toHaveBeenCalledWith(false);
		});

		it('should call loadBackups if the given job status is considered done', () => {
			const loadBackupsSpy = jest.spyOn(component as any, 'loadBackups');

			(component as any).handleBackupJobStatusChanges({
				...mockConfigHubBackupJob,
				status: ConfigHubJobStatus.COMPLETE
			});
			expect(loadBackupsSpy).toHaveBeenCalled();
		});
	});

	describe('handleCellClicked', () => {
		it('should update the selected backup id', () => {
			(component as any).handleCellClicked(mockCellClickedArgs);
			expect(component.selectedBackup).toEqual(mockConfigHubBackupJob);
		});
	});

	describe('checkForInProgressJobs', () => {
		it('should load in progress jobs, and watch their status', () => {
			const loadInProgressBackupJobSpy = jest.spyOn(backupsApiService, 'loadInProgressBackupJob');
			const watchBackupJobSpy = jest.spyOn(component as any, 'watchBackupJob');

			(component as any).checkForInProgressJobs();
			expect(loadInProgressBackupJobSpy).toHaveBeenCalledTimes(1);
			expect(watchBackupJobSpy).toHaveBeenCalledTimes(1);
		});
	});

	describe('loadBackups', () => {
		it('should load backups', () => {
			jest.spyOn(backupsApiService, 'loadCompletedBackupJobs').mockReturnValue(
				of({
					items: [mockConfigHubBackupJob, mockAutomatedConfigHubBackupJob],
					count: 2
				} as ApiListResponse<ConfigHubBackupJob>)
			);

			(component as any).loadBackups();
			expect(component.rows).toEqual([mockConfigHubBackupJob, mockAutomatedConfigHubBackupJob]);
			expect(component.totalBackups).toEqual(2);
			expect(component.totalManualBackups).toEqual(1);
			expect(component.loading).toBeFalsy();
		});
	});

	describe('loadBackupsFromTenant', () => {
		it('should load backups from the selected tenant', () => {
			jest.spyOn(tenantConnectionsService, 'listTenantConnectionsBackups').mockReturnValue(
				of([mockConfigHubBackupJob, mockAutomatedConfigHubBackupJob])
			);

			(component as any).loadBackupsFromTenant('tenant');
			expect(component.rows).toEqual([mockConfigHubBackupJob, mockAutomatedConfigHubBackupJob]);
			expect(component.totalBackups).toEqual(2);
			expect(component.totalManualBackups).toEqual(1);
			expect(component.loading).toBeFalsy();
		});
	});

	describe('setBackupInProgress', () => {
		it('should set isBackupInProgress', () => {
			component.isBackupInProgress = true;

			(component as any).setBackupInProgress(false);
			expect(component.isBackupInProgress).toEqual(false);
		});
	});

	describe('watchBackupJob', () => {
		it('should call watchInProgressJob for a given job', () => {
			const watchInProgressJobSpy = jest.spyOn(backupsApiService, 'watchInProgressJob');

			(component as any).watchBackupJob(of(mockConfigHubBackupJob)).pipe(take(1)).subscribe();
			expect(watchInProgressJobSpy).toHaveBeenCalledWith(mockConfigHubBackupJob.jobId, JOB_STATUS_POLL_PERIOD);
		});

		it('should call handleBackupJobStatusChanges for a given job', () => {
			const handleBackupJobStatusChangesSpy = jest.spyOn(component as any, 'handleBackupJobStatusChanges');
			jest.spyOn(backupsApiService, 'watchInProgressJob').mockReturnValue(of(mockConfigHubBackupJob));

			(component as any).watchBackupJob(of(mockConfigHubBackupJob)).pipe(take(1)).subscribe();
			expect(handleBackupJobStatusChangesSpy).toHaveBeenCalledWith(mockConfigHubBackupJob);
		});
	});

	describe('completedTimestamp column', () => {
		describe('valueGetter', () => {
			it('should return the completed timestamp in a readable format', () => {
				const completedColValueGetter = component.columnDefs.find(
					colDef => colDef.colId === 'completedTimestamp'
				)?.valueGetter as ValueGetterFunc;
				const mockParams = { data: mockConfigHubBackupJob } as ValueGetterParams;

				expect(completedColValueGetter(mockParams)).toEqual(
					datePipe.transform(mockConfigHubBackupJob.completed, 'medium')
				);
			});
		});

		describe('comparator', () => {
			it('should compare timestamps for sorting by date', () => {
				const timeDiff = 999;
				const timeA = new Date();
				const timeB = new Date(timeA.getTime() + timeDiff);

				const nodeA = { data: { completed: timeA.toISOString() } } as RowNode;
				const nodeB = { data: { completed: timeB.toISOString() } } as RowNode;

				const completedColComparator = component.columnDefs.find(
					colDef => colDef.colId === 'completedTimestamp'
				)?.comparator as any;

				expect(completedColComparator(null, null, nodeA, nodeB, true)).toEqual(-timeDiff);
			});

			it('should compare timestamps for sorting by name', () => {
				const nameA = 'Backup A';
				const nameB = 'Backup B';

				const nodeA = { data: { name: nameA } } as RowNode;
				const nodeB = { data: { name: nameB } } as RowNode;

				component.ngOnInit();
				(component as any).initializeGridOptions();

				const nameColComparator = component.columnDefs.find(colDef => colDef.colId === 'name')
					?.comparator as any;

				expect(nameColComparator(null, null, nodeA, nodeB, true)).toEqual(-1);
			});
		});
	});

	describe('handleDeleteBackup', () => {
		it('should open a modal for confirmation', () => {
			const modalOpenSpy = jest.spyOn(modalService, 'open');
			(component as any).handleDeleteBackup(mockConfigHubBackupJob);
			expect(modalOpenSpy).toHaveBeenCalledWith(
				backupListModel.getDeleteBackupModalConfig(mockConfigHubBackupJob.name as string)
			);
		});

		it('should do nothing if modal is cancelled', fakeAsync(() => {
			const deleteSpy = jest.spyOn(backupsApiService, 'delete');

			const modalSpy = jest.spyOn(modalService, 'open').mockReturnValue(Promise.resolve(false));

			(component as any).handleDeleteBackup(mockConfigHubBackupJob);
			tick();

			expect(modalSpy).toHaveBeenCalled();
			expect(deleteSpy).not.toHaveBeenCalled();
		}));

		it('should call delete backup function on modal confirmation', fakeAsync(() => {
			const deleteSpy = jest.spyOn(backupsApiService, 'deleteBackup');
			jest.spyOn(modalService, 'open').mockReturnValue(Promise.resolve(true));
			(component as any).handleDeleteBackup(mockConfigHubBackupJob);
			tick();

			expect(component.loading).toBe(true);
			expect(deleteSpy).toHaveBeenCalledWith(mockConfigHubBackupJob.jobId);
		}));

		it('should filter rows and detect changes on delete success', fakeAsync(() => {
			const deleteSpy = jest.spyOn(backupsApiService, 'deleteBackup');
			jest.spyOn(backupsApiService, 'loadCompletedBackupJobs').mockReturnValue(
				of({
					items: [mockConfigHubBackupJob, mockAutomatedConfigHubBackupJob],
					count: 1
				} as ApiListResponse<ConfigHubBackupJob>)
			);
			(component as any).loadBackups();
			jest.spyOn(modalService, 'open').mockReturnValue(Promise.resolve(true));
			(component as any).handleDeleteBackup(mockConfigHubBackupJob);
			tick();
			expect(deleteSpy).toHaveBeenCalledWith(mockConfigHubBackupJob.jobId);

			const request = http.expectOne({
				url: `${apiPath}/${mockConfigHubBackupJob.jobId}`,
				method: 'DELETE'
			});
			request.flush({});

			expect(component.rows).toEqual([mockAutomatedConfigHubBackupJob]);
			expect(component.totalBackups).toEqual(1);
			expect(component.totalManualBackups).toEqual(0);
			http.verify();
		}));
	});

	describe('getActionButtons', () => {
		it('should return two action buttons if has rights, and tenant is defined', async () => {
			(component as any).isLimitOverrideEnabled = false;

			(component as any).canUserCreateDraft$ = new Promise(resolve => resolve(true));
			(component as any).canUserDeleteBackup$ = new Promise(resolve => resolve(true));

			const buttons = await component['getActionButtons']('TEST_TENANT');

			expect(buttons.length).toBe(2);
		});

		it('should return four action buttons if has rights, and tenant is not defined', async () => {
			(component as any).isLimitOverrideEnabled = false;

			(component as any).canUserCreateDraft$ = new Promise(resolve => resolve(true));
			(component as any).canUserDeleteBackup$ = new Promise(resolve => resolve(true));

			const buttons = await component['getActionButtons']('');

			expect(buttons.length).toBe(4);
		});

		it('should return two action buttons if does not have rights', async () => {
			(component as any).isLimitOverrideEnabled = false;

			(component as any).canUserCreateDraft$ = new Promise(resolve => resolve(false));
			(component as any).canUserDeleteBackup$ = new Promise(resolve => resolve(false));

			const buttons = await component['getActionButtons']('');

			expect(buttons.length).toBe(2);
		});

		it('should enable draft creation if limit is reached but override flag is enabled', async () => {
			jest.spyOn(backupsApiService, 'loadCompletedBackupJobs').mockReturnValue(
				of({
					items: [mockConfigHubBackupTotalObjectLimit],
					count: 1
				} as ApiListResponse<ConfigHubBackupJob>)
			);
			(component as any).isLimitOverrideEnabled = true;
			(component as any).canUserCreateDraft$ = new Promise(resolve => resolve(true));
			(component as any).canUserDeleteBackup$ = new Promise(resolve => resolve(true));

			const buttons = await component['getActionButtons']('');

			expect(buttons.length).toBe(4);
		});

		it('should not allow draft creation if limit is reached and override flag is disabled', async () => {
			jest.spyOn(backupsApiService, 'loadCompletedBackupJobs').mockReturnValue(
				of({
					items: [mockConfigHubBackupTotalObjectLimit],
					count: 1
				} as ApiListResponse<ConfigHubBackupJob>)
			);
			(component as any).isLimitOverrideEnabled = false;
			(component as any).canUserCreateDraft$ = new Promise(resolve => resolve(true));
			(component as any).canUserDeleteBackup$ = new Promise(resolve => resolve(true));

			const buttons = await component['getActionButtons']('');

			expect(buttons.length).toBe(4);
		});
	});
});
