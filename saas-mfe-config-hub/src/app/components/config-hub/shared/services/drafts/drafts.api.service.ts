/*
 * Copyright (C) 2023 Acme Technologies, Inc.  All rights reserved.
 */
import { HttpClient, HttpResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';

import { Observable } from 'rxjs';
import { catchError, map } from 'rxjs/operators';

import { AlertService } from '@acme-priv/armada-angular/src/acme/angular/components/alert';
import { ModalService } from '@acme-priv/armada-angular/src/acme/angular/components/modal';
import { TranslateService } from '@acme-priv/armada-angular/src/acme/angular/l10n/translation';
import { HANDLE_ERRORS_HEADER } from '@acme-priv/armada-angular/src/acme/angular/network';

import {
	ApiListRequestOptions,
	ApiListResponse,
	ApiRequestOptions,
	ApiVersion
} from '@acme-priv/ui-common/src/acme/angular/api';
import { ErrorResponse } from '@acme-priv/ui-common/src/acme/angular/util/idn-error-response/shared/models';

import {
	BaseObjectDeletePayload,
	BaseObjectPatchDictionary,
	ConfigHubApprovalStatus,
	ConfigHubDraftJob,
	ConfigHubDraftSummary,
	ConfigHubJobStatus,
	ConfigHubJobType,
	ObjectDetailsListResponse,
	ObjectOperationType
} from '../../models';
import { getApprovalConfirmation } from '../../models/approval-service.model';
import { ConfigHubBaseApiService } from '../base/base.api.service';

@Injectable({ providedIn: 'root' })
export class ConfigHubDraftsApiService extends ConfigHubBaseApiService<ConfigHubDraftJob, ConfigHubDraftSummary> {
	/**
	 * The path segment for the /drafts/:id/approvals path
	 */
	public static readonly APPROVALS = 'approvals';

	/**
	 * The path segment for the /drafts/:id/objects path.
	 */
	public static readonly OBJECTS_PATH_SEGMENT = 'objects';

	/**
	 * The path segment for the /drafts/:id/objects/bulk-delete path.
	 */
	public static readonly BULK_DELETE_PATH_SEGMENT = 'bulk-delete';

	/**
	 * The path segment for the /drafts/:id/objects/validate path.
	 */
	public static readonly VALIDATE_PATH_SEGMENT = 'validate';

	/**
	 * The path segment for the /drafts/historical/:draftJobId path.
	 */
	public static readonly HISTORICAL_PATH_SEGMENT = 'historical';

	/**
	 * The path segment for the /drafts/:id/summary
	 */
	public static readonly SUMMARY_PATH_SEGMENT = 'summary';

	constructor(
		httpClient: HttpClient,
		modalService: ModalService,
		private alertService: AlertService,
		private translateService: TranslateService
	) {
		super(ApiVersion.BETA, 'sp-config/drafts', ConfigHubJobType.DRAFT, httpClient, modalService);
	}

	/**
	 * API call to initiate a new draft job.
	 * @param sourceBackupId - The id of the source backup job.
	 * @param name - The name of the new draft.
	 * @param mode - the type of mode used in the draft case;
	 * @param sourceTenant - which source this backup is coming from in the promote case
	 * @returns {Observable<ConfigHubDraftJob>}
	 */
	public createDraftJob(
		sourceBackupId: string,
		name?: string,
		mode?: string,
		sourceTenant?: string
	): Observable<ConfigHubDraftJob> {
		return super
			.create({ sourceBackupId, name, mode, sourceTenant }, { headers: { [HANDLE_ERRORS_HEADER]: '*' } })
			.pipe(catchError(error => this.handleRequestError(error)));
	}

	/**
	 * API call to retrieve completed backup jobs.
	 * @returns {Observable<ApiListResponse<ConfigHubDraftJob>>}
	 */
	public loadCompletedDraftJobs(): Observable<ApiListResponse<ConfigHubDraftJob>> {
		const requestOptions: ApiListRequestOptions = {
			filters: `status eq "${ConfigHubJobStatus.COMPLETE}"`
		};
		return super.list(requestOptions);
	}

	/**
	 * API call to retrieve a list of objects for a given draft.
	 * @param draftId - The id of the draft job.
	 * @param limit - Limits the number of results to be returned.
	 * @param lastEvaluatedKey - The key used for retrieving the next page of results.
	 * 							 Should be the `nextToken` from the previous response.
	 * @param objectType - The type of object to filter on.
	 * @param operation - The ObjectOperationType to filter on.
	 * @returns {Observable<ApiListResponse<ObjectDetails>>}
	 */
	public getObjectDetails(
		draftId: string,
		limit: number,
		lastEvaluatedKey?: string,
		searchQuery?: string,
		objectType?: string,
		operation?: ObjectOperationType,
		showErrors?: boolean
	): Observable<ObjectDetailsListResponse> {
		const requestOptions: ApiListRequestOptions = {
			replaceUrl: `${this.API_PATH}/${draftId}/${ConfigHubDraftsApiService.OBJECTS_PATH_SEGMENT}`,
			limit,
			// TODO: Add sorting in https://acme.atlassian.net/browse/PLTIN-4560
			// Default sort should remain 'name' if no other sorters are applied.
			sorters: 'name'
		};
		const filters: string[] = [];

		if (objectType) {
			filters.push(`objectType eq "${objectType}"`);
		}

		if (operation) {
			filters.push(`operation eq "${operation}"`);
		}

		if (searchQuery) {
			filters.push(`name sw "${searchQuery}"`);
		}

		if (showErrors) {
			filters.push('hasErrors eq "true"');
		}

		if (objectType || operation || searchQuery) {
			requestOptions.filters = filters.join(' and ');
		}

		if (lastEvaluatedKey) {
			requestOptions.params = {
				lastEvaluatedKey: lastEvaluatedKey
			};
		}

		return super.request('GET', requestOptions).pipe(
			map((response: HttpResponse<ObjectDetailsListResponse>) => {
				response.body.items.forEach(
					objectDetails => (objectDetails.object = JSON.parse((<unknown>objectDetails.object) as string))
				);
				return {
					items: response.body.items,
					nextToken: response.body.nextToken ?? null
				};
			})
		);
	}

	/**
	 * API call to initiate a bulk patch of draft objects.
	 * @param draftId - The id of the draft job.
	 * @param draftObjectPatches - A dictionary of objectIds to their corresponding JSON patch operations.
	 * @returns {Observable<any>}
	 */
	public bulkPatchObjectDetails(draftId: string, draftObjectPatches: BaseObjectPatchDictionary): Observable<any> {
		const requestOptions: ApiRequestOptions = {
			replaceUrl: `${this.API_PATH}/${draftId}/${ConfigHubDraftsApiService.OBJECTS_PATH_SEGMENT}`
		};
		return super
			.request('POST', requestOptions, { draftObjectPatches })
			.pipe(catchError(error => this.handleRequestError(error)));
	}

	/**
	 * API call to get the summary of a draft Object
	 * @param draftId - The id of the draft job.
	 * @returns {Observable<ConfigHubDraftSummary>}
	 */
	public getDraftSummary(draftId: string): Observable<ConfigHubDraftSummary> {
		return super.getSummary(draftId).pipe(catchError(error => this.handleRequestError(error)));
	}

	/**
	 * API call to initiate a bulk delete of draft objects.
	 * @param draftId - The id of the draft job.
	 * @param bulkDeletePayload - A payload containing arrays of objectIds and objectTypes to delete from the draft.
	 * @returns {Observable<any>}
	 */
	public bulkDeleteObjectDetails(draftId: string, bulkDeletePayload: BaseObjectDeletePayload): Observable<any> {
		const requestOptions: ApiRequestOptions = {
			replaceUrl: `${this.API_PATH}/${draftId}/${ConfigHubDraftsApiService.OBJECTS_PATH_SEGMENT}/${ConfigHubDraftsApiService.BULK_DELETE_PATH_SEGMENT}`
		};
		return super
			.request('DELETE', requestOptions, bulkDeletePayload)
			.pipe(catchError(error => this.handleRequestError(error)));
	}

	/**
	 * API call to initiate validation of a draft - indicating to the backend that we have no changes left to save.
	 * @param draftId - The id of the draft job.
	 * @returns {Observable<any>}
	 */
	public validateObjectDetails(draftId: string): Observable<any> {
		const requestOptions: ApiRequestOptions = {
			replaceUrl: `${this.API_PATH}/${draftId}/${ConfigHubDraftsApiService.VALIDATE_PATH_SEGMENT}`,
			headers: {
				'content-type': 'application/json'
			}
		};

		return super.request('POST', requestOptions).pipe(catchError(error => this.handleRequestError(error)));
	}

	/**
	 * API call to get the historical of a draft
	 * @param draftId - The id of the draft job.
	 * @returns {Observable<any>}
	 */
	public getHistoricalDraft(draftId: string, deployJobId: string): Observable<any> {
		const requestOptions: ApiListRequestOptions = {
			replaceUrl: `${this.API_PATH}/${ConfigHubDraftsApiService.HISTORICAL_PATH_SEGMENT}/${deployJobId}`,
			params: { draftJobId: draftId },
			headers: { _slptHandleErrors: ['*'] }
		};

		return super.request('GET', requestOptions).pipe(
			map(response => response.body),
			catchError(error => {
				const errorResponse: ErrorResponse = error.error;
				if (!errorResponse.detailCode.includes('404')) {
					return this.handleRequestError(error);
				}
			})
		);
	}

	/**
	 * API call to get the historical of a draft
	 * @param deployJobId - The id of the draft job.
	 * @returns {Observable<any>}
	 */
	public getDraftDetails(deployJobId: string): Observable<any> {
		const requestOptions: ApiListRequestOptions = {
			replaceUrl: `${this.API_PATH}/${deployJobId}`,
			headers: { _slptHandleErrors: ['*'] }
		};

		return super.request('GET', requestOptions).pipe(
			map(response => response.body),
			map(summary => ({ ...summary, approvalStatus: summary.approvalStatus ?? null })),
			catchError(error => {
				const errorResponse: ErrorResponse = error.error;
				if (!errorResponse.detailCode.includes('404')) {
					return this.handleRequestError(error);
				}
			})
		);
	}

	/**
	 * API call to update the approval value
	 * @param draftId - The id of the draft job.
	 * @param approvalStatus - The new approval status of enum type ConfigHubApprovalStatus
	 * @returns {Observable<any>}
	 */
	public changeApprovalStatus(
		draftId: string,
		approvalStatus: ConfigHubApprovalStatus,
		comments: string
	): Observable<any> {
		const requestOptions: ApiRequestOptions = {
			replaceUrl: `${this.API_PATH}/${draftId}/${ConfigHubDraftsApiService.APPROVALS}`
		};
		return super.request('POST', requestOptions, { approvalStatus, comments }).pipe(
			map(response => {
				if (approvalStatus === ConfigHubApprovalStatus.PENDING_FOR_APPROVAL) {
					this.alertService.open(getApprovalConfirmation(this.translateService));
				}
				return response.body;
			}),
			catchError(error => this.handleRequestError(error))
		);
	}
}
