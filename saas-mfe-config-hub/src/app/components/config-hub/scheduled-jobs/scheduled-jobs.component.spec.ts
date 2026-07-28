/*
 * Copyright (C) 2023 Acme Technologies, Inc.  All rights reserved.
 */
import { CommonModule } from '@angular/common';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';

import { ModalService } from '@acme-priv/armada-angular/src/acme/angular/components/modal';
import { TranslateModule } from '@acme-priv/armada-angular/src/acme/angular/l10n/translation';

import { ApiVersion } from '@acme-priv/ui-common/src/acme/angular/api';

import { getDeleteScheduledJobModalConfig, mockScheduleJobSelected } from '../shared/models';
import { ConfigHubScheduledJobsApiService } from '../shared/services/scheduled-jobs/scheduled-jobs.api.service';
import { ConfigHubScheduledJobsComponent } from './scheduled-jobs.component';

describe('ConfigHubScheduledJobsComponent', () => {
	let configHubApiService: ConfigHubScheduledJobsApiService;
	let component: ConfigHubScheduledJobsComponent;
	let fixture: ComponentFixture<ConfigHubScheduledJobsComponent>;
	let modalService: ModalService;
	let http: HttpTestingController;
	let apiPath: string;

	beforeEach(async () => {
		await TestBed.configureTestingModule({
			declarations: [ConfigHubScheduledJobsComponent],
			imports: [TranslateModule.forRoot(), CommonModule, HttpClientTestingModule],
			providers: [
				ConfigHubScheduledJobsApiService,
				{
					provide: ModalService,
					useValue: { open: () => Promise.resolve() }
				}
			]
		}).compileComponents();
	});

	beforeEach(() => {
		fixture = TestBed.createComponent(ConfigHubScheduledJobsComponent);
		component = fixture.componentInstance;
		fixture.detectChanges();
		http = TestBed.inject(HttpTestingController);
		configHubApiService = TestBed.inject(ConfigHubScheduledJobsApiService);
		modalService = TestBed.inject(ModalService);
		apiPath = `${ApiVersion.BETA}://${ConfigHubScheduledJobsApiService.API_PATH}`;
	});

	it('should create', () => {
		expect(component).toBeTruthy();
	});

	it('should initialize grid options on init', async () => {
		await component.ngOnInit();
		expect(component.columnDefs).toBeDefined();
		expect(component.columnDefs.length).toBeGreaterThan(0);
	});

	it('should return two action buttons if not have rights', async () => {
		(component as any).canUserDeleteScheduledJobs$ = new Promise(resolve => resolve(false));
		(component as any).isScheduledActionsEnabled = true;

		const actionButtons = await component['getActionButtons']();
		expect(actionButtons.length).toBe(1);
	});

	it('should return three action buttons if has rights', async () => {
		(component as any).canUserDeleteScheduledJobs$ = new Promise(resolve => resolve(true));
		(component as any).canUserUpdateScheduleActions$ = new Promise(resolve => resolve(true));
		(component as any).isScheduledActionsEnabled = true;

		const actionButtons = await component['getActionButtons']();

		expect(actionButtons.length).toBe(3);
	});

	describe('handleDeleteScheduledJob', () => {
		it('should open a modal for confirmation', () => {
			component.scheduledJobSelected = mockScheduleJobSelected;

			const modalOpenSpy = jest.spyOn(modalService, 'open');
			(component as any).handleDeleteScheduledJob({ data: mockScheduleJobSelected });
			expect(modalOpenSpy).toHaveBeenCalledWith(getDeleteScheduledJobModalConfig());
		});

		it('should do nothing if modal is cancelled', fakeAsync(() => {
			component.scheduledJobSelected = mockScheduleJobSelected;
			const deleteSpy = jest.spyOn(configHubApiService, 'deleteScheduledJob');

			const modalSpy = jest.spyOn(modalService, 'open').mockReturnValue(Promise.resolve(false));

			(component as any).handleDeleteScheduledJob({ data: mockScheduleJobSelected.id });
			tick();

			expect(modalSpy).toHaveBeenCalled();
			expect(deleteSpy).not.toHaveBeenCalled();
		}));

		it('should call delete job function on modal confirmation', fakeAsync(() => {
			component.scheduledJobSelected = mockScheduleJobSelected;

			const deleteSpy = jest.spyOn(configHubApiService, 'deleteScheduledJob');

			jest.spyOn(modalService, 'open').mockReturnValue(Promise.resolve(true));

			(component as any).handleDeleteScheduledJob({ data: mockScheduleJobSelected.id });
			tick();

			expect(component.loading).toBe(true);
			expect(deleteSpy).toHaveBeenCalled();
		}));

		it('should send request if delete success', fakeAsync(() => {
			component.scheduledJobSelected = mockScheduleJobSelected;
			const deleteSpy = jest.spyOn(configHubApiService, 'deleteScheduledJob');

			jest.spyOn(modalService, 'open').mockReturnValue(Promise.resolve(true));
			(component as any).handleDeleteScheduledJob({ data: mockScheduleJobSelected });
			tick();
			expect(deleteSpy).toHaveBeenCalledWith(mockScheduleJobSelected.id);

			const request = http.expectOne({
				url: `${apiPath}/${mockScheduleJobSelected.id}`,
				method: 'DELETE'
			});
			request.flush({});
		}));
	});
});
