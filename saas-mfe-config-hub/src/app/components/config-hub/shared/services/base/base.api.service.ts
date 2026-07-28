/*
 * Copyright (C) 2023 Acme Technologies, Inc.  All rights reserved.
 */
import { HttpClient, HttpErrorResponse, HttpResponse } from '@angular/common/http';

import { Observable, throwError, timer } from 'rxjs';
import { map, switchMap, takeWhile } from 'rxjs/operators';

import { ModalService } from '@acme-priv/armada-angular/src/acme/angular/components/modal';

import {
	ApiListRequestOptions,
	ApiListResponse,
	ApiRequestOptions,
	ApiService,
	ApiVersion,
	CacheOptions
} from '@acme-priv/ui-common/src/acme/angular/api';
import { ErrorResponse } from '@acme-priv/ui-common/src/acme/angular/util/idn-error-response/shared/models';

import {
	ConfigHubBackupJob,
	ConfigHubBackupSummary,
	ConfigHubCompareJob,
	ConfigHubCompareSummary,
	ConfigHubDeployJob,
	ConfigHubDeployResults,
	ConfigHubDraftJob,
	ConfigHubDraftSummary,
	ConfigHubJobType,
	ConfigHubSyncJob
} from '../../models';
import { isConfigHubJobDone } from '../../utils';

export abstract class ConfigHubBaseApiService<
	T extends ConfigHubBackupJob | ConfigHubCompareJob | ConfigHubDeployJob | ConfigHubDraftJob | ConfigHubSyncJob,
	U extends ConfigHubBackupSummary | ConfigHubCompareSummary | ConfigHubDraftSummary | void = void,
	V extends ConfigHubDeployResults | void = void
> extends ApiService<T> {
	/**
	 * The path segment for the <API_VERSON>/<API_PATH>/:id/download path.
	 */
	public static readonly DOWNLOAD_PATH_SEGMENT = 'download';

	/**
	 * The path segment for the <API_VERSON>/<API_PATH>/:id/summary path.
	 */
	public static readonly SUMMARY_PATH_SEGMENT = 'summary';

	protected constructor(
		public readonly API_VERSION: ApiVersion,
		public readonly API_PATH: string,
		public readonly JOB_TYPE: ConfigHubJobType,
		httpClient: HttpClient,
		protected modalService: ModalService
	) {
		super(API_VERSION, API_PATH, httpClient);
	}

	/**
	 * Constructs a request to create a new resource
	 * Modifies the response to include a type property
	 * TODO: Remove in https://acme.atlassian.net/browse/PLTIN-3857
	 * @param item - item to be created
	 * @param requestOptions - Additional request options
	 */
	public create(item: Partial<T>, requestOptions?: ApiRequestOptions): Observable<T> {
		return super.create(item, requestOptions).pipe(map(response => ({ ...response, type: this.JOB_TYPE })));
	}

	/**
	 * Constructs a request to get a resource by Id
	 * Modifies the response to include a type property
	 * TODO: Remove in https://acme.atlassian.net/browse/PLTIN-3857
	 * @param id - Id of the resource to get
	 * @param requestOptions - Additional request options
	 */
	public get(id: string, requestOptions?: ApiRequestOptions, cacheOptions?: CacheOptions): Observable<T> {
		return super
			.get(id, requestOptions, cacheOptions)
			.pipe(map(response => ({ ...response, type: this.JOB_TYPE })));
	}

	/**
	 * Constructs a request to update a resource
	 * Modifies the response to include a type property
	 * TODO: Remove in https://acme.atlassian.net/browse/PLTIN-3857
	 * @param item - The item to be updated
	 * @param requestOptions - Additional request options
	 */
	public update(item: T, requestOptions?: ApiRequestOptions): Observable<T> {
		return super.update(item, requestOptions).pipe(map(response => ({ ...response, type: this.JOB_TYPE })));
	}

	/**
	 * Constructs a request to get a list of resource
	 * Modifies the response to include a type property
	 * TODO: Remove in https://acme.atlassian.net/browse/PLTIN-3857
	 * @param requestOptions - Additional request options and options to do paging, sorting and filtering
	 * @param cacheOptions - Options given by the user to specify the cache time
	 */
	public list(requestOptions?: ApiListRequestOptions, cacheOptions?: CacheOptions): Observable<ApiListResponse<T>> {
		return super.list(requestOptions, cacheOptions).pipe(
			map(response => ({
				...response,
				items: response.items.map(job => ({
					...job,
					type: this.JOB_TYPE
				}))
			}))
		);
	}

	/**
	 * API call to retrieve a job's download results.
	 * @param jobId - The id of the job to retrieve download results for.
	 * @returns {Observable<V>}
	 */
	public getDownload(jobId: string): Observable<V> {
		const requestOptions: ApiRequestOptions = {
			replaceUrl: `${this.API_PATH}/${jobId}/${ConfigHubBaseApiService.DOWNLOAD_PATH_SEGMENT}`
		};

		return super.request('GET', requestOptions).pipe(map((response: HttpResponse<V>) => response.body));
	}

	/**
	 * API call to retrieve a job summary.
	 * @param jobId - The id of the job to retrieve a summary for.
	 * @returns {Observable<U>}
	 */
	public getSummary(jobId: string): Observable<U> {
		const requestOptions: ApiRequestOptions = {
			replaceUrl: `${this.API_PATH}/${jobId}/${ConfigHubBaseApiService.SUMMARY_PATH_SEGMENT}`
		};

		return super.request('GET', requestOptions).pipe(map((response: HttpResponse<U>) => response.body));
	}

	/**
	 * Periodically polls for changes to an in-progress job's status until it is considered done.
	 * @param jobId - The id of the job to watch.
	 * @param interval - How often to poll the backend, in milliseconds.
	 * @returns {Observable<T>}
	 */
	public watchInProgressJob(jobId: string, interval: number): Observable<T> {
		return timer(0, interval).pipe(
			switchMap(() => super.get(jobId)),
			takeWhile((job: T) => !isConfigHubJobDone(job.status), true)
		);
	}

	/**
	 * Periodically polls for changes to any job until it is considered done.
	 * @param jobId - The id of the job to watch.
	 * @param interval - How often to poll the backend, in milliseconds.
	 * @param keepCheckingCallback - callback api to check if should keep taking.
	 * @returns {Observable<T>}
	 */
	public watchStatusInProgress(
		jobId: string,
		interval: number,
		keepCheckingCallback: (result: any) => boolean
	): Observable<T> {
		return timer(0, interval).pipe(
			switchMap(() => super.get(jobId)),
			takeWhile(keepCheckingCallback, true)
		);
	}

	/**
	 * Handle API request error.
	 * @param {HttpErrorResponse} error - The error object.
	 * @returns {Observable<any>}
	 */
	protected handleRequestError(error: HttpErrorResponse): Observable<any> {
		const errorResponse: ErrorResponse = error.error;

		this.modalService.openErrorModal(
			undefined,
			undefined,
			errorResponse.trackingId,
			errorResponse.messages.map(message => message.text)
		);
		return throwError(() => error);
	}
}
