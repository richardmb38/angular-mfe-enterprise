/*
 * Copyright (C) 2024 Acme Technologies, Inc.  All rights reserved.
 */
import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

import { Observable, catchError, map, throwError } from 'rxjs';

import { AlertService } from '@acme-priv/armada-angular/src/acme/angular/components/alert';
import { ModalService } from '@acme-priv/armada-angular/src/acme/angular/components/modal';
import { TranslateService } from '@acme-priv/armada-angular/src/acme/angular/l10n/translation';

import {
	ApiListRequestOptions,
	ApiRequestOptions,
	ApiVersion
} from '@acme-priv/ui-common/src/acme/angular/api';
import { ErrorResponse } from '@acme-priv/ui-common/src/acme/angular/util/idn-error-response/shared/models';

import {
	ConfigHubJobType,
	ConfigHubSyncJob,
	getNoFilesToSyncAlertConfig,
	getSyncInProgressAlertConfig
} from '../../models';
import { ConfigHubBaseApiService } from '../base/base.api.service';
import { ConfigHubCloudSyncListResponse } from 'app/components/config-hub/activity-log/activity-log.model';

@Injectable({ providedIn: 'root' })
export class ConfigHubCloudStorageSyncApiService extends ConfigHubBaseApiService<ConfigHubSyncJob, void, void> {
	/**
	 * The API path for sync jobs
	 */
	public static readonly API_PATH = 'sp-config/cloud-storage-sync';

	constructor(
		httpClient: HttpClient,
		modalService: ModalService,
		private translateService: TranslateService,
		private alertService: AlertService
	) {
		super(
			ApiVersion.BETA,
			ConfigHubCloudStorageSyncApiService.API_PATH,
			ConfigHubJobType.SYNC,
			httpClient,
			modalService
		);
	}

	/**
	 * Creates a new sync job
	 */
	public createSyncJob(): Observable<ConfigHubSyncJob> {
		const requestOptions: ApiRequestOptions = {
			headers: { _slptHandleErrors: ['*'] }
		};
		return super.request('POST', requestOptions).pipe(
			map(response => {
				return response.body;
			}),
			catchError(error => {
				const errorResponse: ErrorResponse = error.error;
				if (errorResponse.detailCode.includes('404')) {
					this.alertService.open(getNoFilesToSyncAlertConfig(this.translateService));
					return throwError(() => error);
				} else if (errorResponse.detailCode.includes('400')) {
					this.alertService.open(getSyncInProgressAlertConfig(this.translateService));
					return throwError(() => error);
				} else {
					return this.handleRequestError(error);
				}
			})
		);
	}

	/**
	 * Retrieves the latest synchronization job.
	 *
	 * @return {Observable<ConfigHubSyncJob>} The observable that emits the latest synchronization job.
	 */
	public getLatestSyncJob(): Observable<ConfigHubSyncJob> {
		const requestOptions: ApiRequestOptions = {
			headers: { _slptHandleErrors: ['*'] },
			replaceUrl: this.API_PATH + '/latest'
		};

		return super.request('GET', requestOptions).pipe(
			map(response => {
				return response.body;
			}),
			catchError(error => {
				const errorResponse: ErrorResponse = error.error;
				if (errorResponse.detailCode !== '404 Not found') {
					return this.handleRequestError(error);
				}
			})
		);
	}

	/**
	 * API call to get all the entries related to deploys.
	 * @param lastEvaluatedObject The last evaluated object (used for pagination)
	 * @param limit The limit amount of entries to be retrieved.
	 */
	public getCloudSyncListPaginated(
		lastEvaluatedObject: string,
		limit: number
	): Observable<ConfigHubCloudSyncListResponse> {
		const requestOptions: ApiListRequestOptions = {
			limit
		};

		if (lastEvaluatedObject) {
			requestOptions.params = {
				lastEvaluatedObject: lastEvaluatedObject
			};
		}

		return super.request('GET', requestOptions).pipe(
			map(response => {
				return response.body;
			}),
			catchError(error => this.handleRequestError(error))
		);
	}
}
