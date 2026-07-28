/*
 * Copyright (C) 2023 Acme Technologies, Inc.  All rights reserved.
 */
import { ChangeDetectionStrategy, Component, OnDestroy, OnInit } from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';

import { Store } from '@ngrx/store';
import { Subject, filter, first, take, takeUntil, withLatestFrom } from 'rxjs';

import { ModalService } from '@acme-priv/armada-angular/src/acme/angular/components/modal';
import { TranslateService } from '@acme-priv/armada-angular/src/acme/angular/l10n/translation';
import { BrandingService } from '@acme-priv/armada-angular/src/acme/angular/util/branding';
import { UnsavedChangesWarningService } from '@acme-priv/armada-angular/src/acme/angular/util/unsaved-changes-warning';

import { PathRouteService } from '@acme-priv/ui-common/src/acme/angular/shared';
import { FeatureFlagService } from '@acme-priv/ui-common/src/acme/angular/util';
import { UserInfoService } from '@acme-priv/ui-common/src/acme/angular/util/user-info';
import { UserRightsService } from '@acme-priv/ui-common/src/acme/angular/util/user-rights';

import { draftsApiActions, draftsPageActions } from './store/actions';
import { fromDraftsPage } from './store/selectors';

import { FeatureFlags } from '../../../featureflags.enum';
import { CONFIG_HUB_URL, ConfigHubChildRoutes } from '../config-hub.model';
import { ConfigHubApprovalStatus } from '../shared/models';
import { ConfigHubRoles } from '../shared/models/config-hub.model';
import { ApprovalStatusBadgeColors, ApprovalStatusTranslations } from './details/draft-details.model';
import { DraftsChildRoutes, getConfirmCancelRequestModalConfig } from './drafts.model';
import { ConfigHubDeployOverlayService } from './summary/deploy-overlay/deploy-overlay.service';
import { GlobalValue, LegacyGlobalServiceAdapter } from 'app/shared/services/globals';

/**
 * Drafts Page
 *
 * Acts as a container for child components, enabling navigation between them via a side navigation bar.
 */
@Component({
	selector: 'app-config-hub-drafts',
	templateUrl: './drafts.component.html',
	styleUrls: ['./drafts.component.scss'],
	changeDetection: ChangeDetectionStrategy.OnPush
})
export class ConfigHubDraftsComponent implements OnInit, OnDestroy {
	/**
	 * The current tenant.
	 */
	public currentTenant: string;

	/**
	 * Name of source backup
	 */
	public sourceBackupName: string;

	/**
	 * Name of source tenant
	 */
	public sourceTenant: string;

	/**
	 * Whether or not to show header controls, e.g. Discard Changes/Save Changes/Deploy Draft buttons.
	 */
	public showHeaderControls = false;

	/**
	 * Whether or not to show the Back to Draft Summary button in the header.
	 */
	public showBackToSummary = false;

	/**
	 * The draft's id.
	 */
	public draftId$ = this.store.select(fromDraftsPage.selectDraftId);

	/**
	 * The selected draft's name.
	 */
	public draftName$ = this.store.select(fromDraftsPage.selectDraftName);

	/**
	 * The selected draft's approval status.
	 */
	public draftApprovalStatus$ = this.store.select(fromDraftsPage.selectApprovalStatus);

	/**
	 * Comment history from the draft selected
	 */
	public draftComments$ = this.store.select(fromDraftsPage.selectApprovalStatusComments);

	/**
	 * Draft summary from the draft selected
	 */

	public draftSummary$ = this.store.select(fromDraftsPage.selectSummary);

	/**
	 * current userId obtained from the user context;
	 */
	public currentUserId: string;

	/**
	 * last user obtained from the previous comment history.
	 */
	public lastUserId: string;

	/**
	 * The id of the last user that requested for approval.
	 */
	public lastRequesterId: string;

	/**
	 * Whether or not the draft has unsaved changes.
	 */
	public isDraftDirty$ = this.store.select(fromDraftsPage.selectIsDraftDirty);

	/**
	 * Whether or not the draft can be deployed.
	 */
	public isDraftDeployable$ = this.store.select(fromDraftsPage.selectIsDraftDeployable);

	/**
	 * Whether or not the draft has errors.
	 */
	public hasErrors$ = this.store.select(fromDraftsPage.selectHasErrors);

	/**
	 * Whether or not a draft save is in progress.
	 */
	public saveStateLoading$ = this.store.select(fromDraftsPage.selectSaveStateIsLoading);

	/**
	 * Whether or not the draft summary is loading
	 */
	public isSummaryLoading$ = this.store.select(fromDraftsPage.selectSummaryIsLoading);

	/**
	 * Checks wether user can approve drafts
	 */
	public canUserApproveDraft$: Promise<boolean>;

	/**
	 * Checks wether user can edit a draft
	 */
	public canUserEditDraft$: Promise<boolean>;

	/**
	 * Checks wether user can deploy a draft
	 */
	public canUserDeployDraft$: Promise<boolean>;

	/**
	 * Subject to unsubscribe on destroy.
	 */
	private unsubscribe$ = new Subject<void>();

	/**
	 * A record of approval statuses to their translations
	 */
	public approvalStatusText: string;

	/**
	 * A record of approval statuses to their badge colors
	 */
	public approvalStatusBadgeColor: string;

	/**
	 * A record of approval statuses to their badge colors
	 */
	public readonly ApprovalStatus = ConfigHubApprovalStatus;

	/**
	 * Checks if draft approvals are enabled
	 */
	public readonly isConfigHubDraftApprovalEnabled = this.featureFlagService.isEnabled(
		FeatureFlags.PLT_UI_ADMIRAL_CONFIG_HUB_DRAFTS_APPROVAL
	);

	/**
	 * If FF is enabled, in case the draft is not editable it will change to false and not render those buttons. (needed since is not a disabled action)
	 */
	public displayDiscardAndSaveChangesFF = true;

	/**
	 * If FF is enabled, in case the draft is not deployable it will change to true and disable the buttons. (needed since is a disable action and anyone should
	 * see button regardles, so default is true)
	 */
	public deployDisabledWithApprovalFF = true;

	/**
	 * If FF is enabled, in case draft is pending for approval, you will get option to approve or rquest
	 */
	public displayApproveRequestFF = true;

	/**
	 * Action Type that is passed down to requestApproval with Comments to determine the labels used, default
	 * is pending for approval, only changes on deny and approve.
	 */
	public actionType: ConfigHubApprovalStatus = ConfigHubApprovalStatus.PENDING_FOR_APPROVAL;

	/**
	 * the current approval status value. Used to make the rendering of buttons behind displayDiscardAndSaveChangesFF more responsive
	 */
	public currentApprovalStatus;

	/**
	 * Flag to indicate if the comments overlay should be shown
	 */
	public showCommentsOverlay = false;

	/**
	 * Show the request overlyWithComment MAKE SURE IS HIDDEN BEHIND FF.
	 */
	public showRequestOverlay = false;

	/**
	 * Selector for wether or not to use the approvals feature
	 */
	public isApprovalsEnabled$ = this.store.select(fromDraftsPage.selectIsApprovalsEnabled);

	/**
	 * Local flag for wether or not to use the approvals feature
	 */
	public isApprovalsFeatureEnabled = false;

	constructor(
		private configHubDeployOverlayService: ConfigHubDeployOverlayService,
		private featureFlagService: FeatureFlagService,
		private globalService: LegacyGlobalServiceAdapter,
		private pathRouteService: PathRouteService,
		private router: Router,
		private store: Store,
		private unsavedChangesWarningService: UnsavedChangesWarningService,
		private userRightsService: UserRightsService,
		private userInfoService: UserInfoService,
		public brandingService: BrandingService,
		private translateService: TranslateService,
		private modalService: ModalService
	) {
		this.sourceBackupName = this.router.lastSuccessfulNavigation?.extras?.state?.sourceBackupName;
		this.sourceTenant = this.router.lastSuccessfulNavigation?.extras?.state?.sourceTenant;

		this.canUserEditDraft$ = this.userRightsService.hasRight(ConfigHubRoles.DRAFT_UPDATE);
		this.canUserDeployDraft$ = this.userRightsService.hasRight(ConfigHubRoles.DEPLOY_CREATE);
		this.canUserApproveDraft$ = this.userRightsService.hasAllRights([
			ConfigHubRoles.DRAFT_APPROVE,
			ConfigHubRoles.ADVANCED_SETTINGS_UPDATE
		]);
	}

	/**
	 * Initialization of the component.
	 */
	ngOnInit(): void {
		this.currentTenant = this.globalService.get<string>(GlobalValue.OrgScriptName);
		this.router.events
			.pipe(
				takeUntil(this.unsubscribe$),
				filter(event => event instanceof NavigationEnd)
			)
			.subscribe(() => this.updateHeaderText());
		this.updateHeaderText();

		this.isDraftDirty$
			.pipe(takeUntil(this.unsubscribe$))
			.subscribe(isDirty =>
				isDirty
					? this.unsavedChangesWarningService.setObjection(ConfigHubDraftsComponent)
					: this.unsavedChangesWarningService.removeObjection(ConfigHubDraftsComponent)
			);

		this.isApprovalsEnabled$
			.pipe(takeUntil(this.unsubscribe$))
			.subscribe(isEnabled => (this.isApprovalsFeatureEnabled = isEnabled));

		if (this.isConfigHubDraftApprovalEnabled) {
			this.draftApprovalStatus$
				.pipe(
					withLatestFrom(this.isApprovalsEnabled$),
					filter(([, isEnabled]) => !!isEnabled),
					takeUntil(this.unsubscribe$)
				)
				.subscribe(async ([value]) => {
					this.currentApprovalStatus = value;
					this.updateBadge(value);
					this.displayDiscardAndSaveChangesFF = ![
						ConfigHubApprovalStatus.PENDING_FOR_APPROVAL,
						ConfigHubApprovalStatus.APPROVED
					].includes(value);
					this.displayApproveRequestFF = ConfigHubApprovalStatus.PENDING_FOR_APPROVAL === value;
					this.deployDisabledWithApprovalFF = ['APPROVED'].includes(value);
					this.currentUserId = await this.userInfoService.externalIdAsync;
					this.draftComments$.pipe(takeUntil(this.unsubscribe$)).subscribe(commentArray => {
						if (commentArray === undefined || commentArray.length === 0) {
							this.lastUserId = this.currentUserId;
						} else {
							this.lastUserId = commentArray[commentArray.length - 1].id;
							this.lastRequesterId = [...commentArray]
								.reverse()
								.find(
									comment => comment.changedToStatus === ConfigHubApprovalStatus.PENDING_FOR_APPROVAL
								).id;
						}
					});
				});
		}
	}

	/**
	 * Dismisses all unsaved changes made to draft.
	 */
	public handleDiscardChanges(): void {
		this.isDraftDirty$.pipe(take(1)).subscribe(isDirty => {
			if (isDirty) {
				this.store.dispatch(draftsPageActions.discardAllDraftChanges());
			}
		});
	}

	/**
	 * Clean up when the instance is destroyed.
	 */
	ngOnDestroy(): void {
		this.store.dispatch(draftsPageActions.draftsPageLeave());
		this.unsubscribe$.next();
		this.unsubscribe$.complete();
	}

	/**
	 * Navigates the user to the Config Hub landing page.
	 */
	public handleDismiss(): void {
		const currentRoute = this.pathRouteService.getSelectedRoute();

		if (currentRoute === ConfigHubChildRoutes.DRAFTS.route) {
			this.router.navigate([CONFIG_HUB_URL]);
		} else {
			this.router.navigate([CONFIG_HUB_URL, ConfigHubChildRoutes.DRAFTS.route]);
		}
	}

	/**
	 * Initiates the draft saving process.
	 */
	public handleSave(): void {
		this.isDraftDirty$.pipe(take(1)).subscribe(isDirty => {
			if (isDirty) {
				this.store.dispatch(draftsPageActions.saveAllDraftChanges());
			}
		});
	}

	/**
	 * Opens the deploy overlay.
	 */
	public handleDeploy(): void {
		this.isDraftDeployable$.pipe(take(1)).subscribe(isDeployable => {
			if (isDeployable) {
				this.configHubDeployOverlayService.handleOpen();
			}
		});
	}

	/**
	 * Opens request approval overlay
	 */
	public handleRequestApprovalWithComment(): void {
		this.showRequestOverlay = true;
		this.actionType = ConfigHubApprovalStatus.PENDING_FOR_APPROVAL;
	}

	/**
	 * Deny Draft with approval overlay comment
	 */
	public handleDenyDraftWithComment(): void {
		this.actionType = ConfigHubApprovalStatus.DENIED;
		this.showRequestOverlay = true;
	}

	/**
	 * Approve draft with approval overlay comment
	 */
	public handleApproveDraftWithComment(): void {
		this.actionType = ConfigHubApprovalStatus.APPROVED;
		this.showRequestOverlay = true;
	}

	/**
	 * handleRequestApprovalDismiss
	 */
	public handleRequestApprovalDismiss(comment: string = null): void {
		this.showRequestOverlay = false;
		if (comment) {
			this.handleApprovalStatusChange(this.actionType, comment);
		}
	}

	/**
	 * Open confirmation modal for canceling the current approval request
	 */
	public handleCancelRequest(): void {
		const confirmCancelRequestModal = getConfirmCancelRequestModalConfig(this.currentApprovalStatus);

		this.modalService.open(confirmCancelRequestModal).then(confirm => {
			if (confirm) {
				this.handleApprovalStatusChange(null);
			}
		});
	}

	/**
	 * Navigates the user back to the draft summary page.
	 */
	public handleBackToSummary(): void {
		const urlSegments = this.router.routerState.snapshot.url.split('/');
		urlSegments.pop();
		this.router.navigate(urlSegments);
	}

	/**
	 * Update the boolean controlling what header text is being shown.
	 */
	private updateHeaderText(): void {
		this.draftId$.pipe(first(draftId => !!draftId)).subscribe(draftId => {
			const selectedRoute = this.pathRouteService.getSelectedRoute();
			this.showHeaderControls = selectedRoute === draftId;
			this.showBackToSummary = selectedRoute === DraftsChildRoutes.DETAILS.route.split('/')[1];
		});
	}

	/**
	 * Checking in the template if approval status is one of the specified values.
	 **/
	public approvalStatusIsOneOf(approvalStatusExpected: ConfigHubApprovalStatus[]) {
		if (this.isConfigHubDraftApprovalEnabled && this.isApprovalsFeatureEnabled) {
			return approvalStatusExpected.includes(this.currentApprovalStatus);
		}
		return true;
	}

	/**
	 * Update approval status badge color and value;
	 */
	updateBadge(value: ConfigHubApprovalStatus) {
		this.approvalStatusBadgeColor = ApprovalStatusBadgeColors[value];
		this.approvalStatusText = this.translateService.instant(ApprovalStatusTranslations[value]);
	}

	/**
	 * Update Draft Status;
	 */
	public handleApprovalStatusChange(approvalStatus: ConfigHubApprovalStatus, comments?: string) {
		this.store.dispatch(draftsApiActions.updateApprovalStatus({ approvalStatus, comments }));
	}

	/**
	 * Show comments overlay
	 */
	public handleViewComments(): void {
		this.showCommentsOverlay = true;
	}

	/**
	 * Dismiss comments overlay
	 */
	public handleOverlayDismiss(): void {
		this.showCommentsOverlay = false;
	}

	/**
	 * Get the label for the cancel request button depending on the current approval status
	 */
	public getCancelRequestLabel(): string {
		if (this.currentApprovalStatus === ConfigHubApprovalStatus.PENDING_FOR_APPROVAL) {
			return 'CONFIG_HUB.CANCEL_REQUEST';
		}
		return 'CONFIG_HUB.EDIT_AND_RESUBMIT';
	}

	/**
	 * Check if current user is the same as the user that requested the draft approval
	 */
	public isSameUser(): boolean {
		return this.currentUserId === this.lastUserId;
	}

	/**
	 * check the original requester
	 */
	public isLastRequester(): boolean {
		if (this.isConfigHubDraftApprovalEnabled && this.isApprovalsFeatureEnabled) {
			return this.currentUserId === this.lastRequesterId;
		}
		return true;
	}

	/**
	 * Check if the cancel request/edit and resubmit button should be shown
	 */
	public shouldShowCancelRequestButton(): boolean {
		return !this.approvalStatusIsOneOf([null]);
	}
}
