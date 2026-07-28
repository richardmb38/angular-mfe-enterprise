import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';

import { Observable, catchError, map, throwError } from 'rxjs';

import { ModalService } from '@acme-priv/armada-angular/src/acme/angular/components/modal';

import {
	ApiListRequestOptions,
	ApiListResponse,
	ApiRequestOptions,
	ApiService,
	ApiVersion
} from '@acme-priv/ui-common/src/acme/angular/api';
import { ErrorResponse } from '@acme-priv/ui-common/src/acme/angular/util/idn-error-response/shared/models';

import {
	ConfigHubBackupJob,
	ConfigHubBackupSummary,
	ConfigHubTenantConnection,
	CreateTenantConnectionParams
} from '../../models';

@Injectable({ providedIn: 'root' })
export class ConfigHubTenantConnectionsService extends ApiService<ConfigHubTenantConnection> {
	/**
	 * The path segment for the /connections/:id/backups path.
	 */
	public static readonly CONNECTION_BACKUPS_PATH = 'backups';

	/**
	 * The API path for connection objects
	 */
	public static readonly API_PATH = 'sp-config/connections';

	constructor(
		httpClient: HttpClient,
		private modalService: ModalService
	) {
		super(ApiVersion.BETA, ConfigHubTenantConnectionsService.API_PATH, httpClient);
	}

	/**
	 * API call to retrieve the list of connections
	 * @returns {Observable<ApiListResponse<ConfigHubTenantConnection>>}
	 */
	public listTenantConnections(requestFor: String): Observable<ApiListResponse<ConfigHubTenantConnection>> {
		const requestOptions: ApiRequestOptions = { params: { 'requested-for': requestFor } };
		return super.list(requestOptions).pipe(catchError(error => this.handleRequestError(error)));
	}

	/**
	 * API call to create a new tenant connection
	 * @returns {Observable<ConfigHubTenantConnection>}
	 */
	public createNewTenantConnection(
		newConnectionParams: CreateTenantConnectionParams
	): Observable<ConfigHubTenantConnection> {
		const requestOptions: ApiRequestOptions = {};

		return super.request('POST', requestOptions, newConnectionParams).pipe(
			map(response => response.body),
			catchError(error => this.handleRequestError(error))
		);
	}

	/**
	 * API call to delete a tenant connection
	 * @returns {Observable<ConfigHubTenantConnection>}
	 */
	public deleteTenantConnection(connection: string): Observable<any> {
		return super.delete(connection).pipe(catchError(error => this.handleRequestError(error)));
	}

	/**
	 * API call to get the backups from tenant connection;
	 * @param sourceTenant The name of the tenant to get backups for
	 */
	public listTenantConnectionsBackups(sourceTenant: String): Observable<ConfigHubBackupJob[]> {
		const requestOptions: ApiListRequestOptions = {
			replaceUrl: `${ConfigHubTenantConnectionsService.API_PATH}/${sourceTenant}/${ConfigHubTenantConnectionsService.CONNECTION_BACKUPS_PATH}`
		};
		return super.request('GET', requestOptions).pipe(
			map(response => response.body),
			catchError(error => this.handleRequestError(error))
		);
	}

	/**
	 * API call to get the backup summary from a tenant connection;
	 * @param sourceTenant The name of the tenant to get backups for
	 * @param jobId The id of the backup job
	 */
	public getTenantConnectionsBackupSummary(sourceTenant: String, jobId: string): Observable<ConfigHubBackupSummary> {
		const requestOptions: ApiListRequestOptions = {
			replaceUrl: `${ConfigHubTenantConnectionsService.API_PATH}/${sourceTenant}/${ConfigHubTenantConnectionsService.CONNECTION_BACKUPS_PATH}/${jobId}/summary`
		};
		return super.request('GET', requestOptions).pipe(
			map(response => response.body),
			catchError(error => this.handleRequestError(error))
		);
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
