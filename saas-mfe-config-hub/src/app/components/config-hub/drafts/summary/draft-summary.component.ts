/*
 * Copyright (C) 2023 Acme Technologies, Inc.  All rights reserved.
 */
import { ChangeDetectionStrategy, Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

import { Store } from '@ngrx/store';
import { Subject, takeUntil, withLatestFrom } from 'rxjs';

import { FeatureFlagService } from '@acme-priv/ui-common/src/acme/angular/util';
import { UserRightsService } from '@acme-priv/ui-common/src/acme/angular/util/user-rights';

import { draftsPageActions } from '../store/actions';
import { fromDraftsPage } from '../store/selectors';

import { FeatureFlags } from '../../../../featureflags.enum';
import { ConfigHubRoles } from '../../shared/models/config-hub.model';

/**
 * Configuration Hub Draft Summary Page
 *
 * Displays a summary of a given draft.
 */
@Component({
	selector: 'app-config-hub-draft-summary',
	templateUrl: './draft-summary.component.html',
	styleUrls: ['./draft-summary.component.scss'],
	changeDetection: ChangeDetectionStrategy.OnPush
})
export class ConfigHubDraftSummaryComponent implements OnInit, OnDestroy {
	/**
	 * An object containing the total of elements by operation.
	 */
	public summaryObjectTotals$ = this.store.select(fromDraftsPage.selectSummaryObjectTotals);

	/**
	 * Whether the grid is currently loading new data.
	 */
	public loading$ = this.store.select(fromDraftsPage.selectSummaryIsLoading);

	/**
	 * Checks wether user can edit a draft
	 */
	public canUserEditDraft$: Promise<boolean>;

	/**
	 * Checks if draft approvals are enabled
	 */
	public readonly isConfigHubDraftApprovalEnabled = this.featureFlagService.isEnabled(
		FeatureFlags.PLT_UI_ADMIRAL_CONFIG_HUB_DRAFTS_APPROVAL
	);

	/**
	 * The selected draft's approval status.
	 */
	public draftApprovalStatus$ = this.store.select(fromDraftsPage.selectApprovalStatus);

	/**
	 * Determines if the draft can be updated based on its draft status
	 */
	public isDraftStatusUpdatable = false;

	/**
	 * Subject to unsubscribe on destroy.
	 */
	private unsubscribe$ = new Subject<void>();

	/**
	 * Selector for wether or not to use the approvals feature
	 */
	public isApprovalsEnabled$ = this.store.select(fromDraftsPage.selectIsApprovalsEnabled);

	constructor(
		private activatedRoute: ActivatedRoute,
		private store: Store,
		private userRightsService: UserRightsService,
		private featureFlagService: FeatureFlagService
	) {
		this.canUserEditDraft$ = this.userRightsService.hasRight(ConfigHubRoles.DRAFT_UPDATE);
	}

	/**
	 * Initialization of the component.
	 */
	public ngOnInit(): void {
		const draftId = this.activatedRoute.snapshot.params?.id;

		if (!draftId) {
			return;
		}

		this.draftApprovalStatus$
			.pipe(withLatestFrom(this.isApprovalsEnabled$), takeUntil(this.unsubscribe$))
			.subscribe(([approvalStatus, approvalsEnabled]) => {
				this.isDraftStatusUpdatable =
					this.isConfigHubDraftApprovalEnabled && approvalsEnabled ? approvalStatus === null : true;
			});

		this.store.dispatch(draftsPageActions.summaryPageOpen({ draftId }));
	}

	/**
	 * Clean up when the instance is destroyed.
	 */
	public ngOnDestroy(): void {
		this.unsubscribe$.next();
		this.unsubscribe$.complete();
	}
}
