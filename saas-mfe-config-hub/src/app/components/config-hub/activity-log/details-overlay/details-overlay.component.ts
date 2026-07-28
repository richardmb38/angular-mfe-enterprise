/*
 * Copyright (C) 2023 Acme Technologies, Inc.  All rights reserved.
 */
import { ChangeDetectorRef, Component, EventEmitter, Input, OnDestroy, OnInit, Output } from '@angular/core';
import { UntypedFormBuilder, UntypedFormGroup } from '@angular/forms';

import { Subject, take } from 'rxjs';

import { FeatureFlagService } from '@acme-priv/ui-common/src/acme/angular/util';

import {
	ConfigHubDeployJob,
	ConfigHubDeployResults,
	ConfigHubDraftResults,
	ConfigHubJobStatus
} from '../../shared/models';
import { ConfigHubDraftsApiService } from '../../shared/services';
import { ConfigHubActivityLogTab, ConfigHubActivityLogTabs } from '../activity-log.model';

/**
 * Configuration Hub Activity Log Details Overlay
 *
 * Displays details of the selected object.
 */
@Component({
	selector: 'app-config-hub-details-overlay',
	templateUrl: './details-overlay.component.html',
	styleUrls: ['./details-overlay.component.scss']
})
export class ConfigHubDetailsOverlayComponent implements OnInit, OnDestroy {
	/**
	 *  Input for overlay selected details
	 */
	@Input() public set selectedDetails(results: ConfigHubDeployJob) {
		if (results) {
			this._selectedDetails = results;
			this.isDeployComplete = results.status === ConfigHubJobStatus.COMPLETE;
			if (results.status === ConfigHubJobStatus.PARTIALLY_COMPLETE) {
				this.isDeployPartiallyComplete = true;
			}
		}
	}

	/**
	 *  Set download results when results present
	 */
	@Input() public set downloadResults(results: ConfigHubDeployResults) {
		if (results) {
			this.updateObjectDetailsForm(this.OBJECT_JSON_FORM_KEY, results.results);
		}
	}

	/**
	 * Draft download results object
	 */
	public draftDownloadResults: ConfigHubDraftResults;

	/**
	 * Emits an event when the overlay is dismissed.
	 */
	@Output() onDismiss = new EventEmitter<void>();

	/**
	 * Key used for the objectDetailsForm.
	 */
	public readonly OBJECT_JSON_FORM_KEY = 'objectJson';

	/**
	 * Key used for the objectDetailsForm for draft tab.
	 */
	public readonly DRAFT_OBJECT_JSON_FORM_KEY = 'draftObjectJson';

	/**
	 * The object details form to display json output
	 */
	public objectDetailsForm: UntypedFormGroup;

	/**
	 * Checks deploy status
	 */
	public isDeployComplete: boolean;

	/**
	 * Checks if deploy is partially complete
	 */
	public isDeployPartiallyComplete: boolean;

	/**
	 * Selected Details Results
	 */
	get selectedDetails(): ConfigHubDeployJob {
		return this._selectedDetails;
	}

	/**
	 * Tabs to display in the template
	 */
	public tabs: Array<ConfigHubActivityLogTab> = [];

	/**
	 * Selected tab
	 */
	public currentTab: ConfigHubActivityLogTabs = ConfigHubActivityLogTabs.DEPLOYMENT_LOG;

	/**
	 * Loading draft
	 */
	public loadingDraft;

	/**
	 * Tab names enum to use in the template
	 */
	public readonly tabIndexes: typeof ConfigHubActivityLogTabs = ConfigHubActivityLogTabs;

	/**
	 * Selected details object
	 */
	private _selectedDetails: ConfigHubDeployJob;

	/**
	 * Subject to unsubscribe on destroy.
	 */
	private unsubscribe$ = new Subject<void>();

	constructor(
		private formBuilder: UntypedFormBuilder,
		private changeDetectorRef: ChangeDetectorRef,
		private featureFlagService: FeatureFlagService,
		private configHubDraftsApiService: ConfigHubDraftsApiService
	) {}

	/**
	 * Initialization of the component.
	 */
	public ngOnInit(): void {
		this.initObjectDetailsForm();
		this.setTabs();
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
		this.objectDetailsForm?.reset();
		this.onDismiss.emit();
	}

	/**
	 * Handle tab click to define current tab
	 * @param tab selected tab
	 */
	public handleTabClick(tab: ConfigHubActivityLogTabs): void {
		this.currentTab = tab;
		if (tab === ConfigHubActivityLogTabs.DEPLOYMENT_DRAFT && this.draftDownloadResults == null) {
			this.loadingDraft = true;
			this.loadDraftDownloadResults(this.selectedDetails.draftId, this.selectedDetails.jobId);
		}
	}

	/**
	 * Get the actual tab index in the tabs array position
	 * @param tabIndex tab index from the enum
	 */
	public getTabIndex(tabIndex: ConfigHubActivityLogTabs): number {
		return this.tabs.findIndex(tab => tab.index === tabIndex);
	}

	/**
	 * Initiates the objectDetailsForm.
	 */
	private initObjectDetailsForm(): void {
		this.objectDetailsForm = this.formBuilder.group({
			[this.OBJECT_JSON_FORM_KEY]: '',
			[this.DRAFT_OBJECT_JSON_FORM_KEY]: 'No historical draft found.'
		});
	}

	/**
	 * Loads historical drafts details
	 * @param draftId - Draft Id
	 */
	private loadDraftDownloadResults(draftId: string, deployJobId: string): void {
		this.configHubDraftsApiService
			.getHistoricalDraft(draftId, deployJobId)
			.pipe(take(1))
			.subscribe({
				next: results => {
					this.draftDownloadResults = results;
					this.loadingDraft = false;
					this.updateObjectDetailsForm(this.DRAFT_OBJECT_JSON_FORM_KEY, results.object);
					this.changeDetectorRef.detectChanges();
				},
				error: () => {
					this.loadingDraft = false;
					this.changeDetectorRef.detectChanges();
				}
			});
	}

	/**
	 * Updates the objectDetailsForm.
	 * @param key form key to update
	 * @param results type of result to render in the form
	 */
	private updateObjectDetailsForm(
		key: string,
		results: ConfigHubDeployResults['results'] | ConfigHubDraftResults['object']
	): void {
		if (this.objectDetailsForm) {
			this.objectDetailsForm.patchValue({ [key]: JSON.stringify([{ results }], null, 2) });
		}
	}

	/**
	 * Sets tabs values
	 */
	private setTabs(): void {
		this.tabs = [
			{
				title: 'CONFIG_HUB.DEPLOYMENT_LOG',
				index: ConfigHubActivityLogTabs.DEPLOYMENT_LOG
			},
			{
				title: 'CONFIG_HUB.DEPLOYMENT_DRAFT',
				index: ConfigHubActivityLogTabs.DEPLOYMENT_DRAFT
			}
		];
	}
}
