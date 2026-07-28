import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';

import { Observable, catchError, throwError } from 'rxjs';

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
	ConfigHubObjectMapping,
	ConfigHubObjectMappingCreateApiResponse,
	ConfigHubObjectMappingPatchApiResponse,
	ObjectMappingPatchDictionary
} from '../../models/object-mapping.model';

@Injectable({ providedIn: 'root' })
export class ConfigHubObjectMappingService extends ApiService<ConfigHubObjectMapping> {
	/**
	 * The API path from object mappings
	 */
	public static readonly API_PATH = 'sp-config/object-mappings';

	constructor(
		httpClient: HttpClient,
		private modalService: ModalService
	) {
		super(ApiVersion.BETA, ConfigHubObjectMappingService.API_PATH, httpClient);
	}

	/**
	 * API call to retrieve the list object mappings
	 * @returns {Observable<ApiListResponse<ConfigHubObjectMapping>>}
	 */
	public listObjectMappingsSourceOrg(sourceOrg: string): Observable<ApiListResponse<ConfigHubObjectMapping>> {
		const requestOptions: ApiListRequestOptions = {
			replaceUrl: `${ConfigHubObjectMappingService.API_PATH}/${sourceOrg}`
		};

		return super.list(requestOptions).pipe(catchError(error => this.handleRequestError(error)));
	}

	/**
	 * API call to delete a tenant connection
	 * @param sourceTenant - The source tenant
	 * @param objectMappingId - The ID of the mapping to delete
	 */
	public deleteObjectMapping(sourceTenant: string, objectMappingId: string): Observable<any> {
		const requestOptions: ApiRequestOptions = {
			replaceUrl: `${ConfigHubObjectMappingService.API_PATH}/${sourceTenant}/${objectMappingId}`
		};

		return super.request('DELETE', requestOptions).pipe(catchError(error => this.handleRequestError(error)));
	}

	/** API call to bulk patch the list object mappings
	 * @param sourceOrg source org to where create mappings
	 * @param patches list of modifications
	 * @returns {Observable<ConfigHubObjectMappingPatchApiResponse<ConfigHubObjectMapping>>}
	 */
	public bulkPatchObjectMappings(
		sourceOrg: string,
		patches: ObjectMappingPatchDictionary
	): Observable<ConfigHubObjectMappingPatchApiResponse<ConfigHubObjectMapping>> {
		const requestOptions: ApiRequestOptions = {
			replaceUrl: `${ConfigHubObjectMappingService.API_PATH}/${sourceOrg}/bulk-patch`
		};

		return super
			.request('POST', requestOptions, { patches })
			.pipe(catchError(error => this.handleRequestError(error)));
	}

	/** API call to retrieve the list object mappings
	 * @param sourceOrg source org to where create mappings
	 * @param newObjectsMappings list of mappings to create
	 * @returns {Observable<ConfigHubObjectMappingCreateApiResponse<ConfigHubObjectMapping>>}
	 */
	public createObjectMappingsSourceOrg(
		sourceOrg: string,
		newObjectsMappings: Array<ConfigHubObjectMapping>
	): Observable<ConfigHubObjectMappingCreateApiResponse<any>> {
		const requestOptions: ApiListRequestOptions = {
			replaceUrl: `${ConfigHubObjectMappingService.API_PATH}/${sourceOrg}/bulk-create`
		};

		return super
			.request('POST', requestOptions, { newObjectsMappings })
			.pipe(catchError(error => this.handleRequestError(error)));
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
