/*
 * Copyright (C) 2024 Acme Technologies, Inc.  All rights reserved.
 */
import { CommonModule, DatePipe } from '@angular/common';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { Router } from '@angular/router';

import { GridReadyEvent } from 'ag-grid-community';
import { of, take } from 'rxjs';

import { ModalService } from '@acme-priv/armada-angular/src/acme/angular/components/modal';
import { TranslateModule } from '@acme-priv/armada-angular/src/acme/angular/l10n/translation';

import { ApiListResponse } from '@acme-priv/ui-common/src/acme/angular/api/api-service';

import * as backupListModel from '../backups/backup-list.model';
import { CONFIG_HUB_URL, ConfigHubChildRoutes } from '../config-hub.model';
import { DraftsChildRoutes } from '../drafts/drafts.model';
import { ConfigHubBackupJob, ConfigHubJobStatus, JOB_STATUS_POLL_PERIOD } from '../shared/models';
import { mockConfigHubBackupJob, mockConfigHubBackupUploadJob } from '../shared/models/config-hub-backup-job.mock';
import { mockAutomatedConfigHubBackupJob, mockConfigHubDraftJob } from '../shared/models/job.mock';
import { ConfigHubBackupsApiService } from '../shared/services';
import { ConfigHubBackupUploadsComponent } from './backup-uploads.component';

const mockGridReadyEvent = {
	api: {
		sizeColumnsToFit: jest.fn()
	}
} as unknown as GridReadyEvent;

const mockCellClickedArgs = { column: { getColId: () => 'backupName' }, data: mockConfigHubBackupJob };

const routerMock = {
	navigate: () => {}
};

describe('UploadsComponent', () => {
	let backupsApiService: ConfigHubBackupsApiService;
	let component: ConfigHubBackupUploadsComponent;
	let fixture: ComponentFixture<ConfigHubBackupUploadsComponent>;
	let router: Router;
	let modalService: ModalService;
	let http: HttpTestingController;
	let apiPath: string;

	beforeEach(async () => {
		await TestBed.configureTestingModule({
			declarations: [ConfigHubBackupUploadsComponent],
			imports: [TranslateModule.forRoot(), CommonModule, HttpClientTestingModule],
			providers: [
				DatePipe,
				{
					provide: ModalService,
					useValue: { open: () => Promise.resolve() }
				},
				{ provide: Router, useValue: routerMock }
			]
		}).compileComponents();

		fixture = TestBed.createComponent(ConfigHubBackupUploadsComponent);
		component = fixture.componentInstance;
		fixture.detectChanges();

		backupsApiService = TestBed.inject(ConfigHubBackupsApiService);
		router = TestBed.inject(Router);
		http = TestBed.inject(HttpTestingController);
		modalService = TestBed.inject(ModalService);

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

	describe('onGridReady', () => {
		it('should set the gridApi', () => {
			expect(component.gridApi).not.toBeDefined();

			component.onGridReady(mockGridReadyEvent);
			expect(component.gridApi).toBeDefined();
		});
	});

	describe('loadUploadedBackups', () => {
		it('should load backups', () => {
			jest.spyOn(backupsApiService, 'loadUploadedBackups').mockReturnValue(
				of({
					items: [mockConfigHubBackupJob, mockAutomatedConfigHubBackupJob],
					count: 2
				} as ApiListResponse<ConfigHubBackupJob>)
			);

			(component as any).loadUploadedBackups();
			expect(component.uploadedBackups).toEqual([mockConfigHubBackupJob, mockAutomatedConfigHubBackupJob]);
			expect(component.uploadedBackups.length).toEqual(2);
			expect(component.loading).toBeFalsy();
		});
	});

	describe('onPrepareForDeploymentClick', () => {
		it('should close the overlay', () => {
			const handleSummaryOverlayCloseSpy = jest.spyOn(component, 'handleSummaryOverlayClose');
			(component as any).onPrepareForDeploymentClick({ data: mockConfigHubDraftJob });
			expect(handleSummaryOverlayCloseSpy).toHaveBeenCalled();
		});

		it('should navigate to draft creation', () => {
			jest.spyOn(router, 'navigate').mockImplementation();

			(component as any).onPrepareForDeploymentClick({ data: mockConfigHubDraftJob });

			expect(router.navigate).toHaveBeenCalledWith(
				[CONFIG_HUB_URL, ConfigHubChildRoutes.DRAFTS?.route, DraftsChildRoutes.CREATE.route],
				{
					state: {
						sourceBackupId: mockConfigHubDraftJob.jobId,
						sourceBackupName: mockConfigHubDraftJob.name,
						sourceTenant: null
					}
				}
			);
		});
	});

	describe('handleCellClicked', () => {
		it('should update the selected backup id', () => {
			(component as any).handleCellClicked(mockCellClickedArgs);
			expect(component.selectedBackup).toEqual(mockConfigHubBackupJob);
		});
	});

	describe('watchUploadJob', () => {
		it('should call watchInProgressJob for a given job', () => {
			const watchInProgressJobSpy = jest.spyOn(backupsApiService, 'watchInProgressJob');

			(component as any).watchUploadJob(of(mockConfigHubBackupJob)).pipe(take(1)).subscribe();
			expect(watchInProgressJobSpy).toHaveBeenCalledWith(mockConfigHubBackupJob.jobId, JOB_STATUS_POLL_PERIOD);
		});

		it('should call handleBackupUploadJobStatusChanges for a given job', () => {
			const handleBackupJobStatusChangesSpy = jest.spyOn(component as any, 'handleBackupUploadJobStatusChanges');
			jest.spyOn(backupsApiService, 'watchInProgressJob').mockReturnValue(of(mockConfigHubBackupUploadJob));

			(component as any).watchUploadJob(of(mockConfigHubBackupJob)).pipe(take(1)).subscribe();
			expect(handleBackupJobStatusChangesSpy).toHaveBeenCalledWith(mockConfigHubBackupUploadJob);
		});
	});

	describe('handleBackupUploadJobStatusChanges', () => {
		it('should call toggleIsBackupInProgress', () => {
			const toggleIsBackupInProgressSpy = jest.spyOn(component as any, 'setBackupUploadProgress');

			(component as any).handleBackupUploadJobStatusChanges(mockConfigHubBackupUploadJob);
			expect(toggleIsBackupInProgressSpy).toHaveBeenCalledWith(false);
		});

		it('should call loadBackups if the given job status is considered done', () => {
			const loadUploadedBackupsSpy = jest.spyOn(component as any, 'loadUploadedBackups');

			(component as any).handleBackupUploadJobStatusChanges({
				...mockConfigHubBackupJob,
				status: ConfigHubJobStatus.COMPLETE
			});
			expect(loadUploadedBackupsSpy).toHaveBeenCalled();
		});
	});

	describe('set upload backup in progress', () => {
		it('to true', () => {
			(component as any).setBackupUploadProgress(true);
			expect(component.isBackupUploadInProgress).toBeTruthy();
		});

		it('to false', () => {
			(component as any).setBackupUploadProgress(false);
			expect(component.isBackupUploadInProgress).toBeFalsy();
		});
	});

	describe('handleSummaryOverlayClose', () => {
		it('should set the selected backup as null', () => {
			component.selectedBackup = mockConfigHubBackupJob;
			component.handleSummaryOverlayClose();

			expect(component.selectedBackup).toBe(null);
		});
	});

	describe('handleDeleteUploadBackup', () => {
		it('should open a modal for confirmation', () => {
			component.selectedBackup = mockConfigHubBackupUploadJob;
			const modalOpenSpy = jest.spyOn(modalService, 'open');
			(component as any).onDeleteClick({ data: mockConfigHubBackupUploadJob });
			expect(modalOpenSpy).toHaveBeenCalledWith(
				backupListModel.getDeleteBackupModalConfig(mockConfigHubBackupUploadJob.name, true)
			);
		});

		it('should do nothing if modal is cancelled', fakeAsync(() => {
			component.selectedBackup = mockConfigHubBackupUploadJob;
			const deleteSpy = jest.spyOn(backupsApiService, 'delete');

			const modalSpy = jest.spyOn(modalService, 'open').mockReturnValue(Promise.resolve(false));

			(component as any).onDeleteClick({ data: mockConfigHubBackupUploadJob });
			tick();

			expect(modalSpy).toHaveBeenCalled();
			expect(deleteSpy).not.toHaveBeenCalled();
		}));

		it('should call delete backup function on modal confirmation', fakeAsync(() => {
			component.selectedBackup = mockConfigHubBackupUploadJob;
			const deleteSpy = jest.spyOn(backupsApiService, 'deleteUploadedBackup');
			jest.spyOn(modalService, 'open').mockReturnValue(Promise.resolve(true));
			(component as any).onDeleteClick({ data: mockConfigHubBackupUploadJob });
			tick();

			expect(component.loading).toBe(true);
			expect(deleteSpy).toHaveBeenCalledWith(mockConfigHubBackupUploadJob.jobId);
		}));

		it('should send request if delete success', fakeAsync(() => {
			component.selectedBackup = mockConfigHubBackupUploadJob;
			const deleteSpy = jest.spyOn(backupsApiService, 'deleteUploadedBackup');
			jest.spyOn(backupsApiService, 'loadUploadedBackups').mockReturnValue(
				of({
					items: [mockConfigHubBackupUploadJob, mockAutomatedConfigHubBackupJob],
					count: 1
				} as ApiListResponse<ConfigHubBackupJob>)
			);
			(component as any).loadUploadedBackups();
			jest.spyOn(modalService, 'open').mockReturnValue(Promise.resolve(true));
			(component as any).onDeleteClick({ data: mockConfigHubBackupUploadJob });
			tick();
			expect(deleteSpy).toHaveBeenCalledWith(mockConfigHubBackupUploadJob.jobId);

			const request = http.expectOne({
				url: `${apiPath}/uploads/${mockConfigHubBackupUploadJob.jobId}`,
				method: 'DELETE'
			});
			request.flush({});

			const getFilter = '?filters=status%20eq%20%22COMPLETE%22';
			const updateRequest = http.expectOne({
				url: `${apiPath}/uploads${getFilter}`,
				method: 'GET'
			});
			updateRequest.flush({});
			http.verify();
		}));
	});
});
