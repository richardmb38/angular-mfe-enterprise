/*
 * Copyright (C) 2023 Acme Technologies, Inc.  All rights reserved.
 */
import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

import { Observable } from 'rxjs';
import { catchError, map } from 'rxjs/operators';

import { ModalService } from '@acme-priv/armada-angular/src/acme/angular/components/modal';
import { HANDLE_ERRORS_HEADER } from '@acme-priv/armada-angular/src/acme/angular/network';

import { ApiListRequestOptions, ApiVersion } from '@acme-priv/ui-common/src/acme/angular/api';

import { ConfigHubDeployJob, ConfigHubDeployResults, ConfigHubJobType } from '../../models';
import { ConfigHubBaseApiService } from '../base/base.api.service';
import { ConfigHubDeployListResponse } from 'app/components/config-hub/activity-log/activity-log.model';

@Injectable({ providedIn: 'root' })
export class ConfigHubDeployApiService extends ConfigHubBaseApiService<
	ConfigHubDeployJob,
	void,
	ConfigHubDeployResults
> {
	constructor(httpClient: HttpClient, modalService: ModalService) {
		super(ApiVersion.BETA, 'sp-config/deploy', ConfigHubJobType.DEPLOY, httpClient, modalService);
	}

	/**
	 * API call to initiate a new deploy job.
	 * @param draftId - The id of the draft to deploy.
	 * @returns {Observable<ConfigHubDraftJob>}
	 */
	public createDeployJob(draftId: string): Observable<ConfigHubDeployJob> {
		return super
			.create({ draftId }, { headers: { [HANDLE_ERRORS_HEADER]: '*' } })
			.pipe(catchError(error => this.handleRequestError(error)));
	}

	/**
	 * API call to get all the entries related to deploys.
	 * @param lastEvaluatedObject The last evaluated object (used for pagination)
	 * @param limit The limit amount of entries to be retrieved.
	 */
	public getDeployListPaginated(lastEvaluatedObject: string, limit: number): Observable<ConfigHubDeployListResponse> {
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
