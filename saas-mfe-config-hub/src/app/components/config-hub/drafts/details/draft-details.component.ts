/*
 * Copyright (C) 2023 Acme Technologies, Inc.  All rights reserved.
 */
import { ChangeDetectionStrategy, Component, OnDestroy, OnInit } from '@angular/core';

import { concatLatestFrom } from '@ngrx/effects';
import { Store } from '@ngrx/store';
import { BehaviorSubject, Subject, combineLatest } from 'rxjs';
import { map, take, takeUntil, withLatestFrom } from 'rxjs/operators';

import { FeatureFlagService } from '@acme-priv/ui-common/src/acme/angular/util';

import { draftsPageActions } from '../store/actions';
import { fromDraftsPage } from '../store/selectors';

import { ObjectOperationType, ObjectTypeDeltas, objectOperationTypesToDeltaNames } from '../../shared/models';
import { DraftDetailsTabConfig, objectOperationTabTitles } from './draft-details.model';
import { FeatureFlags } from 'app/featureflags.enum';

/**
 * Configuration Hub Draft Details Page
 *
 * Displays object details for a given draft.
 */
@Component({
	selector: 'app-config-hub-draft-details',
	templateUrl: './draft-details.component.html',
	styleUrls: ['./draft-details.component.scss'],
	changeDetection: ChangeDetectionStrategy.OnPush
})
export class ConfigHubDraftDetailsComponent implements OnInit, OnDestroy {
	/**
	 * Whether the grid is currently loading new data.
	 */
	public loading$ = this.store.select(fromDraftsPage.getObjectDetailsSelectors().selectIsLoading);

	/**
	 * Object details data used to populate the grid.
	 */
	public objectDetails$ = this.store.select(fromDraftsPage.selectObjectDetailsPage());

	/**
	 * Tab items used to populate the slpt-tab-list.
	 */
	public tabItems$ = new BehaviorSubject<DraftDetailsTabConfig[]>([]);

	/**
	 * The selected object type, e.g. ACCESS_PROFILES.
	 */
	public selectedObjectType$ = this.store.select(fromDraftsPage.selectSelectedObjectType);

	/**
	 * The selected object's id.
	 */
	public selectedObjectId$ = this.store.select(fromDraftsPage.selectSelectedObjectId);

	/**
	 * Selected ObjectOperationTypes for the selectedObjectType$.
	 */
	public selectedOperationObject$ = this.store.select(fromDraftsPage.selectSelectedOperationObject());

	/**
	 * The currently selected ObjectOperationType.
	 */
	public selectedOperationType$ = this.store.select(fromDraftsPage.selectSelectedOperationType());

	/**
	 * The currently selected tab index corresponding to the selected ObjectOperationType.
	 */
	public selectedTabIndex$ = combineLatest([this.selectedOperationType$, this.tabItems$]).pipe(
		map(([selectedOperationType, tabItems]) => tabItems.findIndex(tab => tab.type === selectedOperationType))
	);

	/**
	 * Indicates if the user should be able to edit the object JSON or not.
	 */
	public isEditingEnabled$ = this.store.select(fromDraftsPage.selectIsObjectEditingAvailable());

	/**
	 * The selected draft's approval status.
	 */
	public draftApprovalStatus$ = this.store.select(fromDraftsPage.selectApprovalStatus);

	/**
	 * Checks if draft approvals are enabled
	 */
	public readonly isConfigHubDraftApprovalEnabled = this.featureFlagService.isEnabled(
		FeatureFlags.PLT_UI_ADMIRAL_CONFIG_HUB_DRAFTS_APPROVAL
	);

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
		private store: Store,
		private featureFlagService: FeatureFlagService
	) {}

	/**
	 * Initialization of the component.
	 */
	public ngOnInit(): void {
		this.selectedOperationObject$
			.pipe(
				concatLatestFrom(() => this.store.select(fromDraftsPage.selectObjectTypeShowErrorState)),
				take(1)
			)
			.subscribe(([breakdownObject, showErrors]) =>
				this.tabItems$.next(this.buildTabs(breakdownObject, showErrors))
			);

		combineLatest([this.selectedObjectType$, this.selectedOperationType$])
			.pipe(take(1))
			.subscribe(([objectType, objectOperationType]) =>
				this.store.dispatch(draftsPageActions.objectListOpen({ objectType, objectOperationType }))
			);

		this.draftApprovalStatus$
			.pipe(withLatestFrom(this.isApprovalsEnabled$), takeUntil(this.unsubscribe$))
			.subscribe(([approvalStatus, isApprovalsEnabled]) => {
				this.isDraftStatusUpdatable =
					this.isConfigHubDraftApprovalEnabled && isApprovalsEnabled ? approvalStatus === null : true;
			});
	}

	/**
	 * Clean up when the instance is destroyed.
	 */
	public ngOnDestroy(): void {
		this.unsubscribe$.next();
		this.unsubscribe$.complete();
	}

	/**
	 * Handles updates to the selected tab.
	 * @param objectOperationType - The selected ObjectOperationType.
	 */
	private handleTabClick(objectOperationType: ObjectOperationType): void {
		this.selectedObjectType$
			.pipe(
				concatLatestFrom(() => this.store.select(fromDraftsPage.selectObjectTypeShowErrorState)),
				take(1)
			)
			.subscribe(([objectType, showErrors]) => {
				this.store.dispatch(
					draftsPageActions.operationTypeChange({ objectType, objectOperationType, showErrors })
				);
			});
	}

	/**
	 * Returns Array of tabs, displays based on ObjectOperationType
	 * @param breakdownObject - selected breakdown data
	 * @param showErrors - showErrors view
	 * @returns {DraftDetailsTabConfig[]} Array of tabs
	 */
	private buildTabs(breakdownObject: ObjectTypeDeltas, showErrors: boolean): DraftDetailsTabConfig[] {
		return Object.entries(objectOperationTabTitles).map(([type, title]: [ObjectOperationType, string]) => {
			const count = breakdownObject[objectOperationTypesToDeltaNames[type]];
			return {
				id: `slpt-draft-details-${type}-tab`,
				title,
				type,
				count: showErrors ? '' : count,
				disabled: count === 0,
				onTabClick: () => this.handleTabClick(type)
			};
		});
	}
}
