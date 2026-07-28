/*
 * Copyright (C) 2023 Acme Technologies, Inc.  All rights reserved.
 */
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { Router } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';

import { TranslateLoader } from '@ngx-translate/core';
import { of, take } from 'rxjs';

import { ModalService } from '@acme-priv/armada-angular/src/acme/angular/components/modal';
import { TranslateStaticLoader } from '@acme-priv/armada-angular/src/acme/angular/l10n/translate-static-loader';
import { TranslateModule } from '@acme-priv/armada-angular/src/acme/angular/l10n/translation';

import { PendoService } from '@acme-priv/ui-common/src/acme/angular/monitoring';

import { CONFIG_HUB_URL, ConfigHubChildRoutes } from '../../config-hub.model';
import {
	ConfigHubJobStatus,
	JOB_STATUS_POLL_PERIOD,
	mockConfigHubBackupJob,
	mockConfigHubDraftJob,
	mockConfigHubDraftJobSummary,
	mockConfigHubDraftJobSummaryNoChanges
} from '../../shared/models';
import { ConfigHubDraftsApiService } from '../../shared/services';
import { ConfigHubDraftCreateComponent } from './draft-create.component';

const routerMock = {
	lastSuccessfulNavigation: {
		extras: {
			state: {
				sourceBackupId: 'any-id'
			}
		},
		previousNavigation: {
			finalUrl: '/admin/config-hub/uploads'
		}
	},
	navigate: () => {}
};

describe('CreateComponent', () => {
	let component: ConfigHubDraftCreateComponent;
	let fixture: ComponentFixture<ConfigHubDraftCreateComponent>;
	let draftsApiService: ConfigHubDraftsApiService;
	let modalService: ModalService;
	let pendoService: PendoService;

	beforeEach(async () => {
		await TestBed.configureTestingModule({
			declarations: [ConfigHubDraftCreateComponent],
			imports: [
				TranslateModule.forRoot({
					loader: {
						provide: TranslateLoader,
						useClass: TranslateStaticLoader
					}
				}),
				HttpClientTestingModule,
				NoopAnimationsModule,
				RouterTestingModule
			],
			schemas: [CUSTOM_ELEMENTS_SCHEMA],
			providers: [
				{
					provide: Router,
					useValue: routerMock
				},
				{
					provide: ModalService,
					useValue: { openErrorModal: jest.fn() }
				}
			]
		}).compileComponents();
	});

	beforeEach(() => {
		fixture = TestBed.createComponent(ConfigHubDraftCreateComponent);
		component = fixture.componentInstance;
		draftsApiService = TestBed.inject(ConfigHubDraftsApiService);
		modalService = TestBed.inject(ModalService);
		pendoService = TestBed.inject(PendoService);
		fixture.detectChanges();
	});

	it('should create', () => {
		expect(component).toBeTruthy();
	});

	describe('handleCreateDraftModalDismiss', () => {
		it('should not navigate back when draftName is not provided', () => {
			const routerSpy = jest.spyOn(routerMock, 'navigate');
			component.handleCreateDraftModalDismiss('draft name');
			expect(routerSpy).not.toHaveBeenCalledWith([CONFIG_HUB_URL]);
		});

		it('should navigate back when draftName is not provided', () => {
			const routerSpy = jest.spyOn(routerMock, 'navigate');
			component.handleCreateDraftModalDismiss();
			expect(routerSpy).toHaveBeenCalledWith([CONFIG_HUB_URL], { replaceUrl: true });
		});

		it('should be start a compare when draftName is provided', () => {
			const compareSpy = jest.spyOn(component, 'handleCreateDraft');
			component.handleCreateDraftModalDismiss('draft name');
			expect(compareSpy).toHaveBeenCalled();
		});
	});

	describe('handleJobStatusChanges', () => {
		it('should redirect to draft page when draft job is complete successfully', () => {
			const routerSpy = jest.spyOn(routerMock, 'navigate');
			const observableMockConfigHubDraftSummary = of(mockConfigHubDraftJobSummary);
			const summaryJobSpy = jest
				.spyOn(draftsApiService, 'getDraftSummary')
				.mockImplementation(() => observableMockConfigHubDraftSummary);
			(component as any).handleJobStatusChanges(mockConfigHubDraftJob);
			expect(summaryJobSpy).toHaveBeenCalled();
			expect(routerSpy).toHaveBeenCalledWith(
				[CONFIG_HUB_URL, ConfigHubChildRoutes.DRAFTS?.route, mockConfigHubDraftJob.jobId],
				{ replaceUrl: true }
			);
		});

		it('should throw modal en redirect config hub home if draft has no changes', () => {
			const routerSpy = jest.spyOn(routerMock, 'navigate');
			const observableMockConfigHubDraftSummaryNoChanges = of(mockConfigHubDraftJobSummaryNoChanges);
			const modalSpy = jest.spyOn(component, 'createModalNoChangesDetected');
			const summaryJobSpy = jest
				.spyOn(draftsApiService, 'getDraftSummary')
				.mockImplementationOnce(() => observableMockConfigHubDraftSummaryNoChanges);

			(component as any).handleJobStatusChanges(mockConfigHubDraftJob);
			expect(summaryJobSpy).toHaveBeenCalled();
			expect(modalSpy).toHaveBeenCalled();
			expect(routerSpy).toHaveBeenCalled();
		});

		it('should redirect to backups page and show error modal when draft job fails', () => {
			const routerSpy = jest.spyOn(routerMock, 'navigate');
			const errorModalSpy = jest.spyOn(modalService, 'openErrorModal');

			const mockFailedDraftJob = { ...mockConfigHubDraftJob, status: ConfigHubJobStatus.FAILED };

			(component as any).handleJobStatusChanges(mockFailedDraftJob);
			expect(errorModalSpy).toHaveBeenCalled();
			expect(routerSpy).toHaveBeenCalledWith([CONFIG_HUB_URL], { replaceUrl: true });
		});

		it('should redirect to backups page and show error modal when draft job fails', () => {
			const routerSpy = jest.spyOn(routerMock, 'navigate');
			const errorModalSpy = jest.spyOn(modalService, 'openErrorModal');

			const mockFailedDraftJob = {
				...mockConfigHubDraftJob,
				status: ConfigHubJobStatus.FAILED_EXTERNAL_COMMUNICATION
			};

			(component as any).handleJobStatusChanges(mockFailedDraftJob);
			expect(errorModalSpy).toHaveBeenCalled();
			expect(routerSpy).toHaveBeenCalledWith([CONFIG_HUB_URL], { replaceUrl: true });
		});

		it('should redirect to backups page when draft job is cancelled', () => {
			const routerSpy = jest.spyOn(routerMock, 'navigate');
			const errorModalSpy = jest.spyOn(modalService, 'openErrorModal');

			const mockFailedDraftJob = { ...mockConfigHubDraftJob, status: ConfigHubJobStatus.CANCELLED };

			(component as any).handleJobStatusChanges(mockFailedDraftJob);
			expect(errorModalSpy).not.toHaveBeenCalled();
			expect(routerSpy).toHaveBeenCalledWith([CONFIG_HUB_URL], { replaceUrl: true });
		});
	});

	describe('handleCreateDraft', () => {
		it('should initiate a compare job and monitor its progress', () => {
			const observableMockConfigHubDraftJob = of(mockConfigHubDraftJob);
			component.sourceBackupId = mockConfigHubBackupJob.jobId;

			const createCompareJobSpy = jest
				.spyOn(draftsApiService, 'createDraftJob')
				.mockImplementationOnce(() => observableMockConfigHubDraftJob);
			const watchJobSpy = jest.spyOn(component as any, 'watchJob');

			component.handleCreateDraft('New Draft');
			expect(createCompareJobSpy).toHaveBeenCalled();
			expect(watchJobSpy).toHaveBeenCalledWith(observableMockConfigHubDraftJob);
		});

		it('should call handleJobStatusChanges for a given job', fakeAsync(() => {
			const handleJobStatusChangesSpy = jest.spyOn(component as any, 'handleJobStatusChanges');
			jest.spyOn(component as any, 'watchJob').mockReturnValue(of(mockConfigHubDraftJob));
			component.handleCreateDraft('New Draft');
			tick();
			expect(handleJobStatusChangesSpy).toHaveBeenCalledWith(mockConfigHubDraftJob);
		}));

		it('should fire custom pendo event}', () => {
			jest.spyOn(pendoService, 'trackEvent');

			const observableMockConfigHubDraftJob = of(mockConfigHubDraftJob);
			component.sourceBackupId = mockConfigHubBackupJob.jobId;

			const createCompareJobSpy = jest
				.spyOn(draftsApiService, 'createDraftJob')
				.mockImplementationOnce(() => observableMockConfigHubDraftJob);
			const watchJobSpy = jest.spyOn(component as any, 'watchJob');

			component.handleCreateDraft('New Draft');
			expect(createCompareJobSpy).toHaveBeenCalled();
			expect(watchJobSpy).toHaveBeenCalledWith(observableMockConfigHubDraftJob);

			expect(pendoService.trackEvent).toHaveBeenCalled();
		});
	});

	describe('handleCreateDraftPromote', () => {
		it('should initiate compare job and moniotr its progress', () => {
			const observableMockConfigHubDraftJob = of(mockConfigHubDraftJob);
			component.sourceBackupId = mockConfigHubBackupJob.jobId;
			component.sourceTenant = 'someSourceTenant';

			const createCompareJobSpy = jest
				.spyOn(draftsApiService, 'createDraftJob')
				.mockImplementationOnce(() => observableMockConfigHubDraftJob);
			const watchJobSpy = jest.spyOn(component as any, 'watchJob');

			component.handleCreatePromoteDraft('New Draft', 'someSourceTenant');
			expect(createCompareJobSpy).toHaveBeenCalled();
			expect(watchJobSpy).toHaveBeenCalledWith(observableMockConfigHubDraftJob);
		});

		it('should call handleJobStatusChanges for a given job', fakeAsync(() => {
			const handleJobStatusChangesSpy = jest.spyOn(component as any, 'handleJobStatusChanges');
			jest.spyOn(component as any, 'watchJob').mockReturnValue(of(mockConfigHubDraftJob));
			component.handleCreateDraft('New Draft');
			tick();
			expect(handleJobStatusChangesSpy).toHaveBeenCalledWith(mockConfigHubDraftJob);
		}));
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

	describe('watchJob', () => {
		it('should call watchInProgressJob for a given job', () => {
			const watchInProgressJobSpy = jest.spyOn(draftsApiService, 'watchInProgressJob');

			(component as any).watchJob(of(mockConfigHubDraftJob)).pipe(take(1)).subscribe();
			expect(watchInProgressJobSpy).toHaveBeenCalledWith(mockConfigHubDraftJob.jobId, JOB_STATUS_POLL_PERIOD);
		});
	});
});
