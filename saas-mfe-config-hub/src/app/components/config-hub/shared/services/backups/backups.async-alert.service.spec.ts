/*
 * Copyright (C) 2023 Acme Technologies, Inc.  All rights reserved.
 */
import { DatePipe } from '@angular/common';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { TestBed, fakeAsync, flush, tick } from '@angular/core/testing';

import { of } from 'rxjs';

import { AlertConfig, AlertService } from '@acme-priv/armada-angular/src/acme/angular/components/alert';
import {
	TranslateModule,
	TranslateService
} from '@acme-priv/armada-angular/src/acme/angular/l10n/translation';

import * as backupListModel from '../../../backups/backup-list.model';
import { ConfigHubJobStatus, mockConfigHubBackupJob } from '../../models';
import { BackupsAsyncAlertService } from './backups.async-alert.service';

describe('BackupsTagService', () => {
	let service: BackupsAsyncAlertService;
	let configHubJobAlertConfigs: Partial<Record<ConfigHubJobStatus, AlertConfig>>;
	let datePipe: DatePipe;
	let translateService: TranslateService;

	beforeEach(() => {
		TestBed.configureTestingModule({
			imports: [HttpClientTestingModule, TranslateModule.forRoot()],
			providers: [DatePipe, AlertService, TranslateService]
		});
		TestBed.inject(AlertService);
		service = TestBed.inject(BackupsAsyncAlertService);
		datePipe = TestBed.inject(DatePipe);
		translateService = TestBed.inject(TranslateService);
		configHubJobAlertConfigs = backupListModel.getBackupJobAlertConfigs(
			mockConfigHubBackupJob,
			translateService,
			datePipe
		);
	});

	it('should be created', () => {
		expect(service).toBeTruthy();
	});

	describe('init', () => {
		it('should trigger in progress followed by success alert', fakeAsync(() => {
			const alertSpy = jest.spyOn(service as any, 'createJobStatusAlert');
			const $observer = of({
				name: 'test',
				status: ConfigHubJobStatus.COMPLETE
			});

			service.init($observer, 'test', true);
			tick();

			expect(alertSpy).toHaveBeenCalledTimes(2);
		}));
	});
	describe('createJobStatusAlert', () => {
		it('should destroy other alerts when a new one is requested', fakeAsync(() => {
			const alertDestroySpy = jest.spyOn((service as any).alertService, 'destroy');
			jest.spyOn((service as any).alertService, 'open').mockImplementation(() => {});
			jest.spyOn((service as any).alertService, 'isPopUpOpen').mockImplementation(() => true);

			(service as any).createJobStatusAlert(mockConfigHubBackupJob.status, configHubJobAlertConfigs);

			flush();

			(service as any).createJobStatusAlert(
				{
					...mockConfigHubBackupJob,
					status: ConfigHubJobStatus.IN_PROGRESS
				},
				configHubJobAlertConfigs
			);

			flush();

			expect(alertDestroySpy).toHaveBeenCalledWith(ConfigHubJobStatus.COMPLETE);
		}));

		it('should create an alert for a given backup job status', fakeAsync(() => {
			const alertSpy = jest.spyOn((service as any).alertService, 'open');
			jest.spyOn((service as any).alertService, 'isPopUpOpen').mockImplementation(() => false);

			(service as any).createJobStatusAlert(mockConfigHubBackupJob.status, configHubJobAlertConfigs);
			flush();

			expect(alertSpy).toHaveBeenCalledWith(configHubJobAlertConfigs[ConfigHubJobStatus.COMPLETE]);
		}));
	});
});
