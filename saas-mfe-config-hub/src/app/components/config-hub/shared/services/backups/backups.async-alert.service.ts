/*
 * Copyright (C) 2023 Acme Technologies, Inc.  All rights reserved.
 */
import { DatePipe } from '@angular/common';
import { Injectable } from '@angular/core';

import { Observable, Subscription } from 'rxjs';

import { AlertConfig, AlertService } from '@acme-priv/armada-angular/src/acme/angular/components/alert';
import { TranslateService } from '@acme-priv/armada-angular/src/acme/angular/l10n/translation';

import { getBackupJobAlertConfigs } from '../../../backups/backup-list.model';
import { ConfigHubBackupJob, ConfigHubBackupType, ConfigHubJobStatus } from '../../models';
import { isConfigHubJobDone } from '../../utils/config-hub.utils';

/**
 * @name BackupsAsyncAlertService
 * @description backups AsyncAlertService
 */
@Injectable({ providedIn: 'root' })
export class BackupsAsyncAlertService {
	/**
	 * To handle subscription
	 */
	private subscription$: Subscription;

	constructor(
		private alertService: AlertService,
		private translateService: TranslateService,
		private datePipe: DatePipe
	) {}

	/**
	 * Inits async alert
	 * @param $observer to listen to
	 * @param backupName backup name
	 * @param showInProgressAlert whether to trigger in progress alert or not
	 */
	public init(
		$observer: Observable<any>,
		backupName: string,
		showInProgressAlert?: boolean,
		isUploaded?: boolean
	): void {
		if (showInProgressAlert) {
			const inProgressAlertConfig = {
				name: backupName,
				backupType: isUploaded ? ConfigHubBackupType.UPLOADED : '',
				status: ConfigHubJobStatus.IN_PROGRESS
			} as ConfigHubBackupJob;
			const alertConfigs = getBackupJobAlertConfigs(inProgressAlertConfig, this.translateService, this.datePipe);
			this.createJobStatusAlert(ConfigHubJobStatus.IN_PROGRESS, alertConfigs);
		}
		this.subscription$ = $observer.subscribe((data: any) => {
			if (isConfigHubJobDone(data.status)) {
				const alertConfigs = getBackupJobAlertConfigs(data, this.translateService, this.datePipe);
				this.createJobStatusAlert(data.status, alertConfigs);
				this.subscription$?.unsubscribe();
			}
		});
	}

	/**
	 * Creates an alert to be displayed indicating a job's status.
	 * @param jobStatus - The job status that should be created for.
	 * @param alertConfigs - AlertConfigs to use for alert creation.
	 */
	private createJobStatusAlert(
		jobStatus: ConfigHubJobStatus,
		alertConfigs: Partial<Record<ConfigHubJobStatus, AlertConfig>>
	): void {
		let collapseTimeout = 0;
		for (const status in ConfigHubJobStatus) {
			if (status !== jobStatus && this.alertService.isPopUpOpen(status)) {
				this.alertService.destroy(status);
				collapseTimeout = 500;
			}
		}

		// Before opening a new alert, wait until any existing alert disappears
		setTimeout(() => this.alertService.open(alertConfigs[jobStatus]), collapseTimeout);
	}
}
