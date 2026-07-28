/*
 * Copyright (C) 2024 Acme Technologies, Inc.  All rights reserved.
 */
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';

import { Observable, catchError, map, throwError } from 'rxjs';

import { AlertService } from '@acme-priv/armada-angular/src/acme/angular/components/alert';
import { ModalService } from '@acme-priv/armada-angular/src/acme/angular/components/modal';
import { TranslateService } from '@acme-priv/armada-angular/src/acme/angular/l10n/translation';

import { ApiRequestOptions, ApiService, ApiVersion } from '@acme-priv/ui-common/src/acme/angular/api';
import { ErrorResponse } from '@acme-priv/ui-common/src/acme/angular/util/idn-error-response/shared/models';

import {
	ConfigHubAdvancedSettings,
	ConfigHubAdvancedSettingsApiResponse,
	getCloudStorageFoundAlertConfig,
	getNoCloudStorageFoundAlertConfig
} from '../../models/cloud-storage.model';
import { GenericResponse } from '../../models/generic-response.model';
import { Operation as JSONPatchOperation } from 'fast-json-patch';

@Injectable({ providedIn: 'root' })
export class ConfigHubAdvancedSettingsApiService extends ApiService<ConfigHubAdvancedSettings> {
	/**
	 * The API path from object mappings
	 */
	public static readonly API_PATH = 'sp-config/s3-info';

	/**
	 * The API path for advanced settings
	 */
	public static readonly ADVANCE_SETTINGS_API_PATH = 'sp-config/advance-settings';

	/**
	 * The API path for advanced settings
	 */
	public static readonly APPROVALS_API_PATH = 'approvals';

	constructor(
		httpClient: HttpClient,
		private modalService: ModalService,
		private alertService: AlertService,
		private translateService: TranslateService
	) {
		super(ApiVersion.BETA, ConfigHubAdvancedSettingsApiService.API_PATH, httpClient);
	}

	/**
	 * Fetches a tenant's cloud storage configuration from Config Hub
	 */
	public getCloudStorage(showMessage = true): Observable<ConfigHubAdvancedSettings> {
		const requestOptions: ApiRequestOptions = {
			headers: { _slptHandleErrors: ['*'] }
		};
		return super.request('GET', requestOptions).pipe(
			map(response => {
				if (response.body.enabled && showMessage) {
					this.alertService.open(getCloudStorageFoundAlertConfig(this.translateService));
				}
				return response.body;
			}),
			catchError(error => {
				const errorResponse: ErrorResponse = error.error;
				if (errorResponse.detailCode.includes('404') && showMessage) {
					this.alertService.open(getNoCloudStorageFoundAlertConfig(this.translateService));
					return throwError(() => error);
				} else {
					return this.handleRequestError(error);
				}
			})
		);
	}

	/**
	 * Creates new cloud storage configuration
	 */
	public createCloudStorage(payload: ConfigHubAdvancedSettings): Observable<ConfigHubAdvancedSettings> {
		return super.create(payload).pipe(catchError(error => this.handleRequestError(error)));
	}

	/**
	 * Updates a tenant's cloud storage configuration
	 */
	public updateCloudStorage(payload: ConfigHubAdvancedSettings): Observable<ConfigHubAdvancedSettings> {
		return super.update(payload).pipe(catchError(error => this.handleRequestError(error)));
	}

	/**
	 * Patches a tenant's cloud storage info configuration
	 */
	public patchCloudStorage(patch: Array<JSONPatchOperation>): Observable<ConfigHubAdvancedSettings> {
		return super.request('PATCH', null, patch).pipe(
			map(response => response.body),
			catchError(error => this.handleRequestError(error))
		);
	}

	/**
	 * Deletes a tenant's cloud storage configuration
	 */
	public deleteCloudStorage(): Observable<{}> {
		return super.request('DELETE').pipe(catchError(error => this.handleRequestError(error)));
	}

	/**
	 * Tests a tenant's cloud storage configuration by sending a test file to the tenant's saved S3 bucket
	 */
	public testCloudStorageConnection(): Observable<ConfigHubAdvancedSettingsApiResponse<GenericResponse>> {
		const requestOptions: ApiRequestOptions = {
			replaceUrl: `${ConfigHubAdvancedSettingsApiService.API_PATH}/test-connection`
		};

		return super.request('POST', requestOptions).pipe(
			map(response => {
				return response.body;
			}),
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

	/**
	 * Check wether or not the approvals setting is enabled
	 */
	public getIsApprovalsSettingEnabled(): Observable<boolean> {
		const requestOptions: ApiRequestOptions = {
			replaceUrl: `${ConfigHubAdvancedSettingsApiService.ADVANCE_SETTINGS_API_PATH}/${ConfigHubAdvancedSettingsApiService.APPROVALS_API_PATH}`
		};

		return super.request('GET', requestOptions).pipe(
			map(response => {
				return response.body;
			}),
			catchError(error => this.handleRequestError(error))
		);
	}
}
