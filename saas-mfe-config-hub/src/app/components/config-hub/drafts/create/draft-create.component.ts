/* eslint-disable no-console */

/*
 * Copyright (C) 2023 Acme Technologies, Inc.  All rights reserved.
 */
import { Component, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';

import { Observable, Subject, filter, switchMap, takeUntil } from 'rxjs';
import { take } from 'rxjs/operators';

import { ModalConfig, ModalService } from '@acme-priv/armada-angular/src/acme/angular/components/modal';
import { NotificationType } from '@acme-priv/armada-angular/src/acme/angular/components/notification-header';
import { TranslateService } from '@acme-priv/armada-angular/src/acme/angular/l10n/translation';

import { PendoService } from '@acme-priv/ui-common/src/acme/angular/monitoring';

import { CONFIG_HUB_URL, ConfigHubChildRoutes, UPLOADS } from '../../config-hub.model';
import { ConfigHubDraftJob, ConfigHubJobStatus, ConfigHubModeType, JOB_STATUS_POLL_PERIOD } from '../../shared/models';
import { ConfigHubDraftsApiService } from '../../shared/services';
import { isConfigHubJobDone } from '../../shared/utils';

/**
 * Configuration Hub Draft Create Page
 *
 * Display modal to ask for draft name and show loading state
 */
@Component({
	selector: 'app-config-hub-draft-create',
	templateUrl: './draft-create.component.html',
	styleUrls: ['./draft-create.component.scss']
})
export class ConfigHubDraftCreateComponent implements OnDestroy {
	/**
	 * Indicates if there's a draft job in progress
	 */
	public isDraftJobLoading = false;

	/**
	 * Indicates if the modal to create a draft is open
	 */
	public isCreateDraftModalOpen = true;

	/**
	 * ID of source backup
	 */
	public sourceBackupId: string;

	/**
	 * Source Tenant selected for promote case;
	 */
	public sourceTenant: string;

	/**
	 * Route from where draft creation was initiated
	 */
	public sourceRoute: string;

	/**
	 * Subject to unsubscribe on destroy.
	 */
	private unsubscribe$ = new Subject<void>();

	/** PENDO EVENTS */
	DRAFT_CREATION_BY_TYPE = 'Draft Creation by Type';

	constructor(
		private router: Router,
		private configHubDraftsApiService: ConfigHubDraftsApiService,
		private modalService: ModalService,
		private translateService: TranslateService,
		private pendoService: PendoService
	) {
		this.sourceBackupId = this.router.lastSuccessfulNavigation?.extras?.state?.sourceBackupId;
		this.sourceTenant = this.router.lastSuccessfulNavigation?.extras?.state?.sourceTenant;
		this.sourceRoute = this.router.lastSuccessfulNavigation?.previousNavigation?.finalUrl?.toString();
	}

	/**
	 * Clean up when the instance is destroyed.
	 */
	public ngOnDestroy(): void {
		this.unsubscribe$.next();
		this.unsubscribe$.complete();
	}

	/**
	 * Closes the Create Create Draft Modal and initiates a new draft if a name is supplied.
	 * @param draftName - The name of the new draft.
	 */
	public handleCreateDraftModalDismiss(draftName: string = null): void {
		this.isCreateDraftModalOpen = false;
		if (draftName) {
			this.isDraftJobLoading = true;
			this.sourceTenant
				? this.handleCreatePromoteDraft(draftName, this.sourceTenant)
				: this.handleCreateDraft(draftName);
		} else if (!this.isDraftJobLoading) {
			this.router.navigate([CONFIG_HUB_URL], { replaceUrl: true });
		}
	}

	/**
	 * Initiates a draft job.
	 * @param draftName - The name of the draft.
	 */
	public handleCreateDraft(draftName: string): void {
		const importMode =
			this.sourceRoute === '/' + CONFIG_HUB_URL + '/' + UPLOADS
				? ConfigHubModeType.UPLOAD
				: ConfigHubModeType.RESTORE;
		const jobInProgress$: Observable<ConfigHubDraftJob> = this.configHubDraftsApiService.createDraftJob(
			this.sourceBackupId,
			draftName,
			importMode
		);

		this.watchJob(jobInProgress$).subscribe((job: ConfigHubDraftJob) => {
			this.handleJobStatusChanges(job);
		});
		this.pendoService.trackEvent(this.DRAFT_CREATION_BY_TYPE, {
			draftMode: importMode
		});
	}

	/**
	 * Initialize a Promote Draft Job
	 * @param draftName - The name of the draft.
	 * @param sourceTenant - The name of the source tenant for promotion.
	 */
	public handleCreatePromoteDraft(draftName: string, sourceTenant: string): void {
		const jobInProgress$: Observable<ConfigHubDraftJob> = this.configHubDraftsApiService.createDraftJob(
			this.sourceBackupId,
			draftName,
			ConfigHubModeType.PROMOTE,
			sourceTenant
		);

		this.watchJob(jobInProgress$).subscribe((job: ConfigHubDraftJob) => {
			this.handleJobStatusChanges(job);
		});
		this.pendoService.trackEvent(this.DRAFT_CREATION_BY_TYPE, {
			draftMode: ConfigHubModeType.PROMOTE
		});
	}

	/**
	 * Will delete a Draft in the scenario the draftSummary has no changes.
	 * @param draftId - The job to watch.
	 * @returns {void}
	 */
	public handleDeleteDraft(draftId: string): void {
		this.configHubDraftsApiService.delete(draftId).pipe(take(1)).subscribe();
	}

	/**
	 * Monitors a job and initiates changes when the job's status changes.
	 * @param jobToWatch - The job to watch.
	 * @returns {Observable<ConfigHubDraftJob>}
	 */
	private watchJob(jobToWatch$: Observable<ConfigHubDraftJob>): Observable<ConfigHubDraftJob> {
		return jobToWatch$.pipe(
			filter(Boolean),
			switchMap(job => this.configHubDraftsApiService.watchInProgressJob(job.jobId, JOB_STATUS_POLL_PERIOD)),
			takeUntil(this.unsubscribe$)
		);
	}

	/**
	 * Creates a Modal configuration to inform the user of no detected changes between the backup and live state.
	 * @param title - The title of the modal.
	 * @param message - The message of the modal.
	 * @param details - The details of the modal.
	 */
	public createModalNoChangesDetected(title: string, message: string): void {
		const modalConfig: ModalConfig = {
			title,
			message,
			type: NotificationType.Success,
			footer: true
		};

		this.modalService.open(modalConfig);
	}

	/**
	 * Handles changes to a job's status.
	 * @param job - The the job to handle.
	 */
	private handleJobStatusChanges(job: ConfigHubDraftJob): void {
		if (isConfigHubJobDone(job.status)) {
			switch (job.status) {
				case ConfigHubJobStatus.COMPLETE:
					this.configHubDraftsApiService
						.getDraftSummary(job.jobId)
						.pipe(take(1))
						.subscribe({
							next: sum => {
								if (Object.keys(sum.objectBreakdown).length === 0) {
									this.router.navigate([CONFIG_HUB_URL], { replaceUrl: true });
									this.handleDeleteDraft(job.jobId);
									this.createModalNoChangesDetected(
										'CONFIG_HUB.NO_CHANGES_DETECTED_IN_THIS_DRAFT',
										this.translateService.instant('CONFIG_HUB.NO_DRAFT_CHANGES_MESSAGE')
									);
									this.router.navigate([CONFIG_HUB_URL], { replaceUrl: true });
								} else {
									this.router.navigate(
										[CONFIG_HUB_URL, ConfigHubChildRoutes.DRAFTS.route, job.jobId],
										{
											replaceUrl: true
										}
									);
								}
							}
						});
					break;
				case ConfigHubJobStatus.CANCELLED:
					this.router.navigate([CONFIG_HUB_URL], { replaceUrl: true });
					break;
				case ConfigHubJobStatus.FAILED:
					this.modalService.openErrorModal('CONFIG_HUB.ERROR_CREATING_DRAFT', null, null, job.message);
					this.router.navigate([CONFIG_HUB_URL], { replaceUrl: true });
					break;
				case ConfigHubJobStatus.FAILED_EXTERNAL_COMMUNICATION:
					this.modalService.openErrorModal(
						'CONFIG_HUB.ERROR_CREATING_DRAFT',
						'CONFIG_HUB.ERROR_CREATING_DRAFT_EXTERNAL_COMMUNICATION',
						null,
						job.message
					);
					this.router.navigate([CONFIG_HUB_URL], { replaceUrl: true });
					break;
			}
		}
	}
}
