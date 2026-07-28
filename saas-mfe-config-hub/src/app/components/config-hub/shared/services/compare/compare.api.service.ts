/*
 * Copyright (C) 2023 Acme Technologies, Inc.  All rights reserved.
 */
import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

import { Observable } from 'rxjs';
import { catchError } from 'rxjs/operators';

import { ModalService } from '@acme-priv/armada-angular/src/acme/angular/components/modal';
import { HANDLE_ERRORS_HEADER } from '@acme-priv/armada-angular/src/acme/angular/network';

import { ApiVersion } from '@acme-priv/ui-common/src/acme/angular/api';

import { ConfigHubCompareJob, ConfigHubCompareSummary, ConfigHubJobType } from '../../models';
import { ConfigHubBaseApiService } from '../base/base.api.service';

@Injectable({ providedIn: 'root' })
export class ConfigHubCompareApiService extends ConfigHubBaseApiService<ConfigHubCompareJob, ConfigHubCompareSummary> {
	constructor(httpClient: HttpClient, modalService: ModalService) {
		super(ApiVersion.BETA, 'sp-config/compare', ConfigHubJobType.COMPARE, httpClient, modalService);
	}

	/**
	 * API call to initiate a new compare job.
	 * @param sourceId - The id of the source backup job.
	 * @param targetId - The id of the target backup job.
	 * @returns {Observable<ConfigHubCompareJob>}
	 */
	public createCompareJob(sourceId: string, targetId: string): Observable<ConfigHubCompareJob> {
		return super
			.create({ sourceId, targetId }, { headers: { [HANDLE_ERRORS_HEADER]: '*' } })
			.pipe(catchError(error => this.handleRequestError(error)));
	}
}
