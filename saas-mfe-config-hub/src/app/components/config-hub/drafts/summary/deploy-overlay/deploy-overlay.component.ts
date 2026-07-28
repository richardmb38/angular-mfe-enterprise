/*
 * Copyright (C) 2023 Acme Technologies, Inc.  All rights reserved.
 */
import { Component, EventEmitter, OnDestroy, OnInit } from '@angular/core';
import { UntypedFormControl, UntypedFormGroup } from '@angular/forms';
import { Router } from '@angular/router';

import { Store } from '@ngrx/store';
import { Subject, combineLatest } from 'rxjs';
import { take } from 'rxjs/operators';

import { FieldValidators } from '@acme-priv/armada-angular/src/acme/angular/components/form';

import { FeatureFlagService } from '@acme-priv/ui-common/src/acme/angular/util';

import { draftsPageActions } from '../../store/actions';
import { fromDraftsPage } from '../../store/selectors';

import { CONFIG_HUB_URL } from '../../../config-hub.model';
import { ConfigHubDeployOverlayService } from './deploy-overlay.service';
import {
	ScheduleDeployFormControlKeys,
	ScheduleDeployOptions,
	ScheduleDeployRadioOptions
} from 'app/components/config-hub/shared/models';
import { FeatureFlags } from 'app/featureflags.enum';
import { GlobalValue, LegacyGlobalServiceAdapter } from 'app/shared/services/globals';

/**
 * Configuration Hub Deploy Overlay
 *
 * Displays details of the deploy.
 */
@Component({
	selector: 'app-config-hub-deploy-overlay',
	templateUrl: './deploy-overlay.component.html',
	styleUrls: ['./deploy-overlay.component.scss']
})
export class ConfigHubDeployOverlayComponent implements OnInit, OnDestroy {
	/**
	 * The current tenant.
	 */
	public currentTenant: string;

	/**
	 * Whether or not the deploy overlay is open.
	 */
	public isOverlayOpen$ = this.configHubDeployOverlayService.isOverlayOpen$;

	/**
	 * The deploy job.
	 */
	public deployJob$ = this.store.select(fromDraftsPage.selectDeployJob);

	/**
	 * Results from a deploy job.
	 */
	public deployResults$ = this.store.select(fromDraftsPage.selectDeployResultsStringified);

	/**
	 * The selected draft's name.
	 */
	public draftName$ = this.store.select(fromDraftsPage.selectDraftName);

	/**
	 * Whether or not the draft with error.
	 */
	public isDraftWithError$ = this.store.select(fromDraftsPage.selectIsDraftWithError);

	/**
	 * Whether or not a deploy has yet to be initiated.
	 */
	public isDeployInit$ = this.store.select(fromDraftsPage.selectDeployIsInit);

	/**
	 * Whether or not a deploy is in progress.
	 */
	public isDeployInProgress$ = this.store.select(fromDraftsPage.selectDeployIsLoading);

	/**
	 * Whether or not a deploy is complete.
	 */
	public isDeployComplete$ = this.store.select(fromDraftsPage.selectDeployIsComplete);

	/**
	 * Whether or not a deploy has failed.
	 */
	public isDeployFailed$ = this.store.select(fromDraftsPage.selectDeployStatusIsFailed);

	/**
	 * Whether or not a deploy has a partial failure.
	 */
	public isDeployPartial$ = this.store.select(fromDraftsPage.selectDeployStatusIsPartiallyComplete);

	/**
	 * Whether or not a deploy has resolved.
	 */
	public isDeployResolved$ = this.store.select(fromDraftsPage.selectDeployStatusIsComplete);

	/**
	 * Whether or not a scheduled deploy has yet to be initiated.
	 */
	public isScheduledDeployInit$ = this.store.select(fromDraftsPage.selectScheduleDeployIsInit);

	/**
	 * Whether or not a scheduled deploy is in progress.
	 */
	public isScheduledDeployInProgress$ = this.store.select(fromDraftsPage.selectScheduleDeployIsLoading);

	/**
	 * Whether or not a scheduled deploy is complete.
	 */
	public isScheduledDeployComplete$ = this.store.select(fromDraftsPage.selectScheduledDeployIsComplete);

	/**
	 * Whether or not a scheduled deploy has failed.
	 */
	public isScheduledDeployFailed$ = this.store.select(fromDraftsPage.selectScheduleDeployStatusIsFailed);

	/**
	 * Whether or not a scheduled deploy has resolved.
	 */
	public isScheduledDeployResolved$ = this.store.select(fromDraftsPage.selectScheduleDeployStatusIsResolved);

	/**
	 * Whether or not the PLTCONFHUB_SCHEDULED_ACTIONS flag is enabled.
	 */
	public isScheduledActionsEnabled = this.featureFlagService.isEnabled(FeatureFlags.PLTCONFHUB_SCHEDULED_ACTIONS);

	/**
	 * The keys for the form group
	 */
	public formControlKeys = ScheduleDeployFormControlKeys;

	/**
	 * Enum for schedule deploy options possible values
	 */
	public scheduleDeployOptions = ScheduleDeployOptions;

	/**
	 * Form Group for deploy schedule
	 */
	public scheduleDeployFormGroup: UntypedFormGroup = new UntypedFormGroup({
		[this.formControlKeys.ACTION]: new UntypedFormControl(
			ScheduleDeployOptions.DEPLOY,
			[],
			FieldValidators.required
		),
		[this.formControlKeys.DATE]: new UntypedFormControl('', [], null),
		[this.formControlKeys.TIME]: new UntypedFormControl('', [], null)
	});

	/**
	 * Radio options for the schedule deploy radio input
	 */
	public radioOptions = ScheduleDeployRadioOptions;

	/**
	 * Emits an event when the user tries to submit the form.
	 */
	public submitAttempted = new EventEmitter<void>();

	/**
	 * Min date for the date picker
	 */
	public minDate: Date = new Date();

	/**
	 * Subject to unsubscribe on destroy.
	 */
	private unsubscribe$ = new Subject<void>();

	constructor(
		private configHubDeployOverlayService: ConfigHubDeployOverlayService,
		private globalService: LegacyGlobalServiceAdapter,
		private router: Router,
		private store: Store,
		private featureFlagService: FeatureFlagService
	) {}

	/**
	 * Initialization of the component.
	 */
	public ngOnInit(): void {
		this.currentTenant = this.globalService.get<string>(GlobalValue.OrgScriptName);

		this.scheduleDeployFormGroup.controls[ScheduleDeployFormControlKeys.ACTION].valueChanges.subscribe(value => {
			if (value === ScheduleDeployOptions.SCHEDULE) {
				this.scheduleDeployFormGroup.controls[ScheduleDeployFormControlKeys.DATE].setAsyncValidators([
					FieldValidators.required,
					FieldValidators.invalidDatepickerFormat,
					FieldValidators.invalidDatepickerSelection
				]);
				this.scheduleDeployFormGroup.controls[ScheduleDeployFormControlKeys.TIME].setAsyncValidators([
					FieldValidators.required
				]);
			} else {
				this.scheduleDeployFormGroup.controls[ScheduleDeployFormControlKeys.DATE].setAsyncValidators(null);
				this.scheduleDeployFormGroup.controls[ScheduleDeployFormControlKeys.TIME].setAsyncValidators(null);
			}
			this.scheduleDeployFormGroup.controls[ScheduleDeployFormControlKeys.DATE].updateValueAndValidity();
			this.scheduleDeployFormGroup.controls[ScheduleDeployFormControlKeys.TIME].updateValueAndValidity();
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
	 * Handles overlay close.
	 */
	public handleDismiss(): void {
		combineLatest([this.isDeployInProgress$, this.isDeployComplete$, this.isScheduledDeployComplete$])
			.pipe(take(1))
			.subscribe(([isDeployInProgress, isDeployComplete, isScheduledDeployComplete]) => {
				if (isDeployComplete || isScheduledDeployComplete) {
					this.router.navigate([CONFIG_HUB_URL], { replaceUrl: true });
				}

				if (!isDeployInProgress) {
					this.configHubDeployOverlayService.handleDismiss();
				}
			});
	}

	/**
	 * Handles saving the modified object JSON.
	 */
	public handleDeploy(): void {
		if (!this.isScheduledActionsEnabled) {
			this.store.dispatch(draftsPageActions.deployDraft());
			return;
		}

		if (this.scheduleDeployFormGroup.valid) {
			if (
				this.scheduleDeployFormGroup.get(this.formControlKeys.ACTION).value ===
				this.scheduleDeployOptions.DEPLOY
			) {
				this.store.dispatch(draftsPageActions.deployDraft());
			} else {
				const date = this.scheduleDeployFormGroup.get(this.formControlKeys.DATE).value;
				const time = this.scheduleDeployFormGroup.get(this.formControlKeys.TIME).value;

				const datetime = new Date(`${date.inputValue}, ${time}`).toISOString();

				this.store.dispatch(draftsPageActions.scheduleDeployDraft({ startTime: datetime }));
			}
		}
	}
}
