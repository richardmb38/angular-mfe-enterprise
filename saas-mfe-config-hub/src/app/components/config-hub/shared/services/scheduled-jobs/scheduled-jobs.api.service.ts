import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';

import { Observable, catchError, throwError } from 'rxjs';

import { ModalService } from '@acme-priv/armada-angular/src/acme/angular/components/modal';

import { ApiListResponse, ApiService, ApiVersion } from '@acme-priv/ui-common/src/acme/angular/api';
import { ErrorResponse } from '@acme-priv/ui-common/src/acme/angular/util/idn-error-response/shared/models';

import { ConfigHubJobType, ConfigHubScheduledJob, ConfigHubScheduledJobPayload } from '../../models';

@Injectable({ providedIn: 'root' })
export class ConfigHubScheduledJobsApiService extends ApiService<any> {
	/**
	 * The API path from scheduled jobs
	 */
	public static readonly API_PATH = 'sp-config/scheduled-actions';

	constructor(
		httpClient: HttpClient,
		private modalService: ModalService
	) {
		super(ApiVersion.BETA, ConfigHubScheduledJobsApiService.API_PATH, httpClient);
	}

	/**
	 * API call to retrieve the list of scheduled jobs
	 * @returns {Observable<ApiListResponse<ConfigHubScheduledJob>>}
	 */
	public listScheduledJob(): Observable<ApiListResponse<ConfigHubScheduledJob>> {
		return super.list().pipe(catchError(error => this.handleRequestError(error)));
	}

	/**
	 * Create a scheduled job
	 * @returns {ConfigHubScheduledJob}
	 */
	public createScheduledJob(scheduledJob: ConfigHubScheduledJobPayload): Observable<ConfigHubScheduledJob> {
		return super.request('POST', {}, scheduledJob).pipe(catchError(error => this.handleRequestError(error)));
	}

	/**
	 * Edit a scheduled job
	 * @returns {ConfigHubScheduledJob}
	 */
	public editScheduledJob(scheduledJob: ConfigHubScheduledJobPayload, id: string): Observable<ConfigHubScheduledJob> {
		const body = [];

		if (scheduledJob.jobType === ConfigHubJobType.BACKUP) {
			body.push({ op: 'replace', path: '/content/name', value: scheduledJob.content.name });
			body.push({ op: 'replace', path: '/cronString', value: scheduledJob.cronString });
			body.push({ op: 'replace', path: '/content/backupOptions', value: scheduledJob.content.backupOptions });
		}

		if (scheduledJob.jobType === ConfigHubJobType.DEPLOY) {
			body.push({ op: 'replace', path: '/startTime', value: scheduledJob.startTime });
		}

		return super.request('PATCH', {}, body, id).pipe(catchError(error => this.handleRequestError(error)));
	}

	/**
	 * API call to delete a job.
	 * @returns {Observable<ConfigHubBackupJob>}
	 */
	public deleteScheduledJob(id: string): Observable<any> {
		return super.delete(id).pipe(catchError(error => this.handleRequestError(error)));
	}

	/**
	 * Handle API request error.
	 * @param {HttpErrorResponse} error - The error object.
	 * @returns {Observable<any>}
	 */
	private handleRequestError(error: HttpErrorResponse): Observable<any> {
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
