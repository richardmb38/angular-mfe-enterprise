/*
 * Copyright (C) 2023 Acme Technologies, Inc.  All rights reserved.
 */
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';

import { Observable, throwError } from 'rxjs';
import { catchError, map, tap } from 'rxjs/operators';

import { AlertService } from '@acme-priv/armada-angular/src/acme/angular/components/alert';
import { ModalService } from '@acme-priv/armada-angular/src/acme/angular/components/modal';
import { TranslateService } from '@acme-priv/armada-angular/src/acme/angular/l10n/translation';
import { Counter, MetricService } from '@acme-priv/armada-angular/src/acme/angular/monitoring/metrics';
import { HANDLE_ERRORS_HEADER } from '@acme-priv/armada-angular/src/acme/angular/network';

import {
	ApiListRequestOptions,
	ApiListResponse,
	ApiRequestOptions,
	ApiVersion
} from '@acme-priv/ui-common/src/acme/angular/api';
import { ErrorResponse } from '@acme-priv/ui-common/src/acme/angular/util/idn-error-response/shared/models';

import { getBackupsLimitReachedAlertConfig } from '../../../backups/backup-list.model';
import {
	BACKUPS_LIMIT_VIOLATION_CODE,
	ConfigHubBackupJob,
	ConfigHubBackupSummary,
	ConfigHubJobStatus,
	ConfigHubJobType,
	ConfigHubObjectConfigurationResult,
	IncludedNames,
	MAX_MANUAL_BACKUPS_ALLOWED,
	ObjectDetailsListResponse
} from '../../models';
import { ConfigHubBaseApiService } from '../base/base.api.service';

enum MetricResultEnum {
	Expected = 'EXPECTED',
	Unexpected = 'UNEXPECTED'
}

@Injectable({ providedIn: 'root' })
export class ConfigHubBackupsApiService extends ConfigHubBaseApiService<ConfigHubBackupJob, ConfigHubBackupSummary> {
	/**
	 * The api version.
	 */
	public static readonly API_VERSION = ApiVersion.V0;

	/**
	 * The api path.
	 */
	public static readonly API_PATH = 'sp-config/backups/';

	/**
	 * The path segment for the /backups/:jobId/object path.
	 */
	public static readonly OBJECT_PATH_SEGMENT = 'object';

	/**
	 * The path segment for the /backups/:jobId/objects path.
	 */
	public static readonly OBJECTS_PATH_SEGMENT = 'objects';

	/**
	 * The path segment for /backups/hydrate path.
	 */
	public static readonly HYDRATE_PATH_SEGMENT = 'hydrate';

	/**
	 * The path segment for /backups/upload path.
	 */
	public static readonly UPLOAD_PATH_SEGMENT = 'uploads';

	private createConfigHubBackupMetric: Counter = this.metricService.createCounter({
		name: 'ui_admiral_create_configuration_hub_backup_total',
		help: `User created a new configuration backup (${ConfigHubBackupsApiService.API_VERSION}://${ConfigHubBackupsApiService.API_PATH})`,
		analytics: true
	});

	private deleteConfigHubBackupMetric: Counter = this.metricService.createCounter({
		name: 'ui_admiral_delete_configuration_hub_backup_total',
		help: `User deleted a configuration backup (${ConfigHubBackupsApiService.API_VERSION}://${ConfigHubBackupsApiService.API_PATH}/id)`,
		analytics: true
	});

	constructor(
		httpClient: HttpClient,
		modalService: ModalService,
		private alertService: AlertService,
		private metricService: MetricService,
		private translateService: TranslateService
	) {
		super(ApiVersion.BETA, 'sp-config/backups', ConfigHubJobType.BACKUP, httpClient, modalService);
	}

	/**
	 * API call to delete a backup.
	 * @returns {Observable<ConfigHubBackupJob>}
	 */
	public deleteBackup(id: string): Observable<ConfigHubBackupJob> {
		return super.delete(id).pipe(
			tap({
				next: () => this.deleteConfigHubBackupMetric.increment({ result: MetricResultEnum.Expected }),
				error: error => {
					this.handleRequestError(error);
					this.deleteConfigHubBackupMetric.increment({ result: MetricResultEnum.Unexpected });
				}
			})
		);
	}

	/**
	 * API call to initiate a new backup job.
	 * @returns {Observable<ConfigHubBackupJob>}
	 */
	public createBackupJob(name: string): Observable<ConfigHubBackupJob> {
		return super.create({ name }, { headers: { [HANDLE_ERRORS_HEADER]: '*' } }).pipe(
			tap({
				next: () => this.createConfigHubBackupMetric.increment({ result: MetricResultEnum.Expected }),
				error: error => {
					this.handleRequestError(error);
					this.createConfigHubBackupMetric.increment({ result: MetricResultEnum.Expected });
				}
			})
		);
	}

	/**
	 * API call to initiate a new partial backup job.
	 * @param name name of the backup
	 * @param includeTypes a list of the configuration object types to be included in the backup
	 * @param objectOptions a collection of object names to be included in a partial backup, organized by object type
	 * @returns {Observable<ConfigHubBackupJob>}
	 */
	public createPartialBackupJob(
		name: string,
		includeTypes: string[],
		objectOptions: Map<string, IncludedNames>
	): Observable<ConfigHubBackupJob> {
		return super
			.create(
				{ name, backupOptions: { includeTypes, objectOptions: Object.fromEntries(objectOptions) } },
				{ headers: { [HANDLE_ERRORS_HEADER]: '*' } }
			)
			.pipe(
				tap({
					next: () => this.createConfigHubBackupMetric.increment({ result: MetricResultEnum.Expected }),
					error: error => {
						this.handleRequestError(error);
						this.createConfigHubBackupMetric.increment({ result: MetricResultEnum.Expected });
					}
				})
			);
	}

	/**
	 * API call to retrieve completed backup jobs.
	 * @returns {Observable<ApiListResponse<ConfigHubBackupJob>>}
	 */
	public loadCompletedBackupJobs(): Observable<ApiListResponse<ConfigHubBackupJob>> {
		const requestOptions: ApiListRequestOptions = {
			filters: `status eq "${ConfigHubJobStatus.COMPLETE}"`
		};

		return super.list(requestOptions);
	}

	/**
	 * API call to retrieve an in-progress backup job.
	 * @returns {Observable<ConfigHubBackupJob>}
	 */
	public loadInProgressBackupJob(): Observable<ConfigHubBackupJob> {
		const requestOptions: ApiListRequestOptions = {
			filters: `status eq "${ConfigHubJobStatus.IN_PROGRESS}"`
		};

		return super.list(requestOptions).pipe(map(response => response.items[0]));
	}

	/**
	 * Handle API request error.
	 * @param {HttpErrorResponse} error - the error object
	 */
	protected handleRequestError(error: HttpErrorResponse): Observable<any> {
		const errorResponse: ErrorResponse = error.error;
		if (errorResponse.detailCode === BACKUPS_LIMIT_VIOLATION_CODE) {
			this.alertService.open(
				getBackupsLimitReachedAlertConfig(MAX_MANUAL_BACKUPS_ALLOWED, this.translateService)
			);
			return throwError(() => error);
		} else {
			return super.handleRequestError(error);
		}
	}

	/**
	 * API call to get the JSON config for an object from the live configuration
	 * @param targetBackupId The id of the target backup
	 * @param objectId The id of the object
	 */
	public getObjectLiveConfiguration(
		targetBackupId: string,
		objectId: string
	): Observable<ConfigHubObjectConfigurationResult> {
		const requestOptions: ApiListRequestOptions = {
			replaceUrl: `${this.API_PATH}/${targetBackupId}/${ConfigHubBackupsApiService.OBJECT_PATH_SEGMENT}/${objectId}`
		};

		return super.request('GET', requestOptions).pipe(
			map(response => ({
				...response.body,
				object: JSON.parse(response.body.object)
			})),
			catchError(error => this.handleRequestError(error))
		);
	}

	/**
	 * API call to get the JSON config for an object from the live configuration
	 * @param objectId The id of the object
	 * @param objectType The type of the object
	 */
	public getObjectsByType(
		objectId: string,
		objectType: string,
		lastEvaluatedKey: string,
		limit: number,
		offset: number,
		searchQuery: string
	): Observable<ObjectDetailsListResponse> {
		const requestOptions: ApiListRequestOptions = {
			replaceUrl: `${this.API_PATH}/${objectId}/${ConfigHubBackupsApiService.OBJECTS_PATH_SEGMENT}`,
			limit,
			offset
		};

		const filters: string[] = [`objectType eq "${objectType}"`];

		if (searchQuery) {
			filters.push(`name co "${searchQuery}"`);
		}

		requestOptions.filters = filters.join(' and ');

		if (lastEvaluatedKey) {
			requestOptions.params = {
				lastEvaluatedKey: lastEvaluatedKey
			};
		}

		return super.request('GET', requestOptions).pipe(
			map(response => response.body),
			catchError(error => this.handleRequestError(error))
		);
	}

	/**
	 * Starts backup hydration
	 * @param backupId backup id to apply hydration
	 */
	public hydrateBackup(backupId: string): Observable<boolean> {
		const requestOptions: ApiRequestOptions = {
			replaceUrl: `${this.API_PATH}/${ConfigHubBackupsApiService.HYDRATE_PATH_SEGMENT}`
		};

		return super
			.request('POST', requestOptions, { backupId })
			.pipe(catchError(error => this.handleRequestError(error)));
	}

	// TODO: Refractor these to their own api service "backup-uploads.api.service.
	/**
	 * Upload a backup from a JSON file
	 * @param data the JSON file data
	 */
	public uploadBackup(file: File, backupName: string): Observable<ConfigHubBackupJob> {
		const requestOptions: ApiRequestOptions = {
			replaceUrl: `${this.API_PATH}/${ConfigHubBackupsApiService.UPLOAD_PATH_SEGMENT}`
		};

		const formData: FormData = new FormData();

		formData.append('data', file);
		formData.append('name', backupName);

		return super.request('POST', requestOptions, formData).pipe(
			map(response => response.body),
			catchError(error => this.handleRequestError(error))
		);
	}

	/**
	 * Get a backup of type upload using the upload id.
	 * @param uploadBackupId the JSON file data
	 */
	public getUploadBackup(uploadBackupId: string): Observable<ConfigHubBackupJob> {
		const requestOptions: ApiListRequestOptions = {
			replaceUrl: `${this.API_PATH}/${ConfigHubBackupsApiService.UPLOAD_PATH_SEGMENT}/${uploadBackupId}`
		};

		return super.request('GET', requestOptions).pipe(
			map(response => response.body),
			catchError(error => this.handleRequestError(error))
		);
	}

	/**
	 * load the backups of type uploaded.
	 */
	public loadUploadedBackups(): Observable<ApiListResponse<ConfigHubBackupJob>> {
		const requestOptions: ApiListRequestOptions = {
			replaceUrl: `${this.API_PATH}/${ConfigHubBackupsApiService.UPLOAD_PATH_SEGMENT}`,
			filters: `status eq "COMPLETE"`
		};

		return super.list(requestOptions);
	}

	/**
	 * delete an uploaded backup
	 */
	public deleteUploadedBackup(id: string): Observable<ConfigHubBackupJob> {
		const requestOptions: ApiListRequestOptions = {
			replaceUrl: `${this.API_PATH}/${ConfigHubBackupsApiService.UPLOAD_PATH_SEGMENT}`
		};
		return super.delete(id, requestOptions).pipe(
			tap({
				next: () => this.deleteConfigHubBackupMetric.increment({ result: MetricResultEnum.Expected }),
				error: error => {
					this.handleRequestError(error);
					this.deleteConfigHubBackupMetric.increment({ result: MetricResultEnum.Unexpected });
				}
			})
		);
	}
}
