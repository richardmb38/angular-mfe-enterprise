/*
 * Copyright (C) 2023 Acme Technologies, Inc.  All rights reserved.
 */
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { Router } from '@angular/router';

import { TranslateLoader } from '@ngx-translate/core';
import { Observable, of } from 'rxjs';

import { LoadingMaskModule } from '@acme-priv/armada-angular/src/acme/angular/components/loading-mask';
import { TranslateStaticLoader } from '@acme-priv/armada-angular/src/acme/angular/l10n/translate-static-loader';
import { TranslateModule } from '@acme-priv/armada-angular/src/acme/angular/l10n/translation';

import {
	ConfigHubBackupJob,
	ConfigHubBackupSummary,
	HydrationStatuses,
	mockConfigHubBackupJob,
	mockConfigHubBackupJobSummary
} from '../../shared/models';
import { ConfigHubBackupsApiService, ConfigHubTenantConnectionsService } from '../../shared/services';
import { ConfigHubBackupSummaryOverlayComponent } from './summary-overlay.component';

describe('ConfigHubBackupSummaryOverlayComponent', () => {
	let component: ConfigHubBackupSummaryOverlayComponent;
	let fixture: ComponentFixture<ConfigHubBackupSummaryOverlayComponent>;
	let backupsApiService: ConfigHubBackupsApiService;
	let tenantConnectionsService: ConfigHubTenantConnectionsService;

	const routerMock = {
		navigate: () => {},
		navigateByUrl: () => {}
	};

	beforeEach(async () => {
		await TestBed.configureTestingModule({
			declarations: [ConfigHubBackupSummaryOverlayComponent],
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
				{
					provide: Router,
					useValue: routerMock
				}
			]
		}).compileComponents();

		fixture = TestBed.createComponent(ConfigHubBackupSummaryOverlayComponent);
		component = fixture.componentInstance;
		backupsApiService = TestBed.inject(ConfigHubBackupsApiService);
		tenantConnectionsService = TestBed.inject(ConfigHubTenantConnectionsService);
		fixture.detectChanges();
	});

	it('should create', () => {
		expect(component).toBeTruthy();
	});

	describe('ngOnInit', () => {
		it('should call loadSummary ', () => {
			const loadSummarySpy = jest.spyOn(component as any, 'loadSummary');
			component.selectedBackup = mockConfigHubBackupJob;

			expect(loadSummarySpy).toHaveBeenCalled();
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
	});

	describe('handleDismiss', () => {
		it('should emit an onClose event when called', () => {
			const onCloseSpy = jest.spyOn(component.onDismiss, 'emit');

			component.handleDismiss();
			expect(onCloseSpy).toHaveBeenCalledTimes(1);
		});
	});

	describe('handleViewDetails', () => {
		it('should navigate to details view when HYDRATED', () => {
			const navigateToDetailsSpy = jest.spyOn(component as any, 'navigateToDetails');
			component.backupSummary = { jobId: '' } as ConfigHubBackupSummary;
			component.selectedBackup = { hydrationStatus: HydrationStatuses.HYDRATED } as ConfigHubBackupJob;
			component.handleViewDetails();
			expect(navigateToDetailsSpy).toHaveBeenCalledTimes(1);
		});

		it('should call api when not hydrated', () => {
			const hydrateBackupSpy = jest.spyOn(backupsApiService, 'hydrateBackup');
			component.backupSummary = { jobId: '1' } as ConfigHubBackupSummary;
			component.selectedBackup = { hydrationStatus: HydrationStatuses.NOT_HYDRATED } as ConfigHubBackupJob;
			component.handleViewDetails();

			expect(hydrateBackupSpy).toHaveBeenCalledTimes(1);
		});
	});

	describe('navigateToDetails', () => {
		it('should navigate to details', () => {
			const navigateByUrlSpy = jest.spyOn((component as any).router, 'navigateByUrl');
			component.backupSummary = { jobId: '1' } as ConfigHubBackupSummary;
			(component as any).navigateToDetails();
			expect(navigateByUrlSpy).toHaveBeenCalledTimes(1);
		});
	});

	describe('loadSummary', () => {
		it('should load a backup summary', () => {
			const getSummarySpy = jest.spyOn(backupsApiService, 'getSummary');

			getSummarySpy.mockReturnValue(of(mockConfigHubBackupJobSummary) as Observable<ConfigHubBackupSummary>);

			(component as any).loadSummary(mockConfigHubBackupJob);
			expect(getSummarySpy).toHaveBeenCalled();
			expect(component.backupSummary).toEqual(mockConfigHubBackupJobSummary);
			expect(component.loading).toBeFalsy();
		});

		it('should load a backup summary from a selected tenant', () => {
			const getTenantConnectionsBackupSummarySpy = jest.spyOn(
				tenantConnectionsService,
				'getTenantConnectionsBackupSummary'
			);

			getTenantConnectionsBackupSummarySpy.mockReturnValue(
				of(mockConfigHubBackupJobSummary) as Observable<ConfigHubBackupSummary>
			);

			component.selectedTenant = 'tenant-id';
			(component as any).loadSummary(mockConfigHubBackupJob);
			expect(getTenantConnectionsBackupSummarySpy).toHaveBeenCalled();
			expect(component.backupSummary).toEqual(mockConfigHubBackupJobSummary);
			expect(component.loading).toBeFalsy();
		});
	});
});
