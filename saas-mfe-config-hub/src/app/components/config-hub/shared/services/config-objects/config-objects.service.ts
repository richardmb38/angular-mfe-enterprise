import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';

import { Observable, catchError, map, throwError } from 'rxjs';

import { ModalService } from '@acme-priv/armada-angular/src/acme/angular/components/modal';

import { ApiListRequestOptions, ApiService, ApiVersion } from '@acme-priv/ui-common/src/acme/angular/api';
import { ErrorResponse } from '@acme-priv/ui-common/src/acme/angular/util/idn-error-response/shared/models';

import { ConfigHubBackupObjectType } from '../../models';

@Injectable({
	providedIn: 'root'
})
export class ConfigHubConfigObjectsService extends ApiService<ConfigHubBackupObjectType> {
	/**
	 * The API path for configuration objects
	 */
	public static readonly API_PATH = 'sp-config/config-objects';

	constructor(
		httpClient: HttpClient,
		private modalService: ModalService
	) {
		super(ApiVersion.BETA, ConfigHubConfigObjectsService.API_PATH, httpClient);
	}

	/**
	 * API call to retrieve the list of object configuration types
	 * @returns {Observable<ConfigHubBackupObjectType[]>}
	 */
	public getObjectTypes(exportable?: boolean): Observable<ConfigHubBackupObjectType[]> {
		const requestOptions: ApiListRequestOptions =
			exportable == null ? {} : { filters: `exportable eq "${exportable}"` };

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
