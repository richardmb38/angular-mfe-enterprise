/*
 * Copyright (C) 2023 Acme Technologies, Inc.  All rights reserved.
 */
import {
	ChangeDetectorRef,
	Component,
	ElementRef,
	EventEmitter,
	Input,
	OnDestroy,
	OnInit,
	Output,
	ViewChild
} from '@angular/core';
import { UntypedFormBuilder, UntypedFormControl, UntypedFormGroup } from '@angular/forms';

import { concatLatestFrom } from '@ngrx/effects';
import { Store } from '@ngrx/store';
import { BehaviorSubject, Subject, filter } from 'rxjs';
import { debounceTime, distinctUntilChanged, takeUntil, withLatestFrom } from 'rxjs/operators';

import { FieldValidators } from '@acme-priv/armada-angular/src/acme/angular/components/form';
import { UnsavedChangesWarningService } from '@acme-priv/armada-angular/src/acme/angular/util/unsaved-changes-warning';
import { Alignment } from '@acme-priv/armada-angular/src/acme/theme/typescript';

import { FeatureFlagService } from '@acme-priv/ui-common/src/acme/angular/util';
import { UserRightsService } from '@acme-priv/ui-common/src/acme/angular/util/user-rights';

import { draftsPageActions } from '../../store/actions';
import { fromDraftsPage } from '../../store/selectors';

import {
	BaseObject,
	ConfigHubModificationMetadata,
	ConfigHubObjectTab,
	ConfigHubObjectTabs,
	ConfigHubPatchOperations,
	ObjectDetailMessage,
	ObjectOperationType
} from '../../../shared/models';
import { ConfigHubRoles } from '../../../shared/models/config-hub.model';
import { ConfigHubFieldValidators } from '../../../shared/utils/config-hub-field-validators';
import { ConfigHubDraftDetailsComponent } from '../draft-details.component';
import { ObjectDetails } from 'app/components/config-hub/shared/models';
import { FeatureFlags } from 'app/featureflags.enum';
import { Operation, getValueByPointer } from 'fast-json-patch';

/**
 * Configuration Hub Object Overlay
 *
 * Displays details of the selected object.
 */
@Component({
	selector: 'app-config-hub-object-overlay',
	templateUrl: './object-overlay.component.html',
	styleUrls: ['./object-overlay.component.scss']
})
export class ConfigHubObjectOverlayComponent implements OnInit, OnDestroy {
	/**
	 * The setter for the selected object ID.
	 */
	@Input() set selectedObjectId(selectedObjectId: string) {
		this._selectedObjectId = selectedObjectId;
		if (this.selectedObjectId) {
			this.initOverlayConfig();
			if (this.isOperationChanged) {
				this.calculateDiffViewHeight();
			}
		}
	}

	/**
	 * The getter for the selected object ID.
	 */
	get selectedObjectId(): string {
		return this._selectedObjectId;
	}

	/**
	 * The selected object ID.
	 */
	private _selectedObjectId: string;

	/**
	 * The selected object type.
	 */
	@Input() selectedObjectType: string;

	/**
	 * The selected object type.
	 */
	private _selectedOperationType: ObjectOperationType;

	/**
	 * The selected operation type setter.
	 */
	@Input() set selectedOperationType(operationType: ObjectOperationType) {
		this._selectedOperationType = operationType;
		this.isOperationChanged = operationType === ObjectOperationType.CHANGED;
		this.isOperationAdded = operationType === ObjectOperationType.ADDED;
		this.setOverlayTabs();
		this.setInitialTab();
	}

	/**
	 * The selected operation type getter.
	 */
	public get selectedOperationType(): ObjectOperationType {
		return this._selectedOperationType;
	}

	/**
	 * Emits an event when the overlay is closed.
	 */
	@Output() onClose = new EventEmitter<void>();

	/**
	 * Key used for the liveObjectJsonFormControl.
	 */
	public readonly LIVE_OBJECT_JSON_FORM_KEY = 'liveObjectJson';

	/**
	 * Key used for the objectJsonFormControl.
	 */
	public readonly DRAFT_OBJECT_JSON_FORM_KEY = 'draftObjectJson';

	/**
	 * Key used for the diffObjectJsonFormControl.
	 */
	public readonly DIFF_OBJECT_JSON_FORM_KEY = 'diffObjectJson';

	/**
	 * Flag indicating whether the operation is equal to CHANGED
	 */
	public isOperationChanged = false;

	/**
	 * Flag indicating whether the operation is equal to ADDED
	 */
	public isOperationAdded = false;

	/**
	 * The form group containing the objectJsonFormControl.
	 */
	public objectDetailsForm: UntypedFormGroup;

	/**
	 * The form control for the object JSON textarea.
	 */
	public objectJsonFormControl: UntypedFormControl;

	/**
	 * The form control for the live object JSON textarea.
	 */
	public liveObjectJsonFormControl: UntypedFormControl;

	/**
	 * The form control for the local draft JSON textarea in the diff view.
	 */
	public localDraftObjectJsonFormControl: UntypedFormControl;

	/**
	 * The currently selected ObjectDetails.
	 */
	public objectDetails$ = this.store.select(fromDraftsPage.selectObjectDetails());

	/**
	 * The stringified BaseObject JSON for the selected ObjectDetails in the live configuration.
	 */
	public liveObjectJson$ = this.store.select(fromDraftsPage.selectFullLiveObjectStringified());

	/**
	 * The stringified BaseObject JSON for the selected ObjectDetails.
	 */
	public objectJson$ = this.store.select(fromDraftsPage.selectFullBaseObjectStringified());

	/**
	 * Indicates if the user should be able to edit the current object or not.
	 */
	public isEditingEnabled$ = this.store.select(fromDraftsPage.selectIsObjectEditingAvailable());

	/**
	 * The selected draft's approval status.
	 */
	public draftApprovalStatus$ = this.store.select(fromDraftsPage.selectApprovalStatus);

	/**
	 * Indicates if the user should be able to edit the current object or not, based on selected object JwsSignature
	 */
	public isObjectWithJwsSignature$ = new BehaviorSubject<boolean>(false);

	/**
	 * The name of the object operation type in the overlay title.
	 */
	public objectOperationTitle$ = this.store.select(fromDraftsPage.selectSelectedOperationTypeTitle());

	/**
	 * Flag indicating whether the operations for an object type contains operation CHANGED
	 */
	public operationTypesIncludeChange$ = this.store.select(
		fromDraftsPage.selectIsOperationTypeAvailable(ObjectOperationType.CHANGED)
	);

	/**
	 * Error details from object details
	 */
	public errorsDetail: Array<ObjectDetailMessage>;

	/**
	 * Alignment used for the tooltip.
	 */
	public Alignment = Alignment;

	/**
	 * Emits an event when the user tries to submit the form.
	 */
	public submitAttempted = new EventEmitter<void>();

	/**
	 * Subject to unsubscribe on destroy.
	 */
	private unsubscribe$ = new Subject<void>();

	/**
	 * Whether or not the PLTCONFHUB_JSON_DIFF_VIEW flag is enabled.
	 * TODO: Cleanup in https://acme.atlassian.net/browse/PLTCONFHUB-1473
	 */
	public isJsonDiffViewFlagEnabled = this.featureFlagService.isEnabled(FeatureFlags.PLTCONFHUB_JSON_DIFF_VIEW);

	/**
	 * Whether or not the PLT_UI_ADMIRAL_CONFIG_HUB_JSON_CHANGELOG flag is enabled.
	 * TODO: Cleanup in https://acme.atlassian.net/browse/PLTCONFHUB-1336
	 */
	public isJsonChangelogFlagEnabled = this.featureFlagService.isEnabled(
		FeatureFlags.PLT_UI_ADMIRAL_CONFIG_HUB_JSON_CHANGELOG
	);

	/**
	 * Whether or not the PLT_UI_ADMIRAL_CONFIG_HUB_METADATA_OVERLAY flag is enabled.
	 * TODO: Clean up in https://acme.atlassian.net/browse/PLTCONFHUB-1545
	 */
	public isObjectMetadataEnabled = this.featureFlagService.isEnabled(
		FeatureFlags.PLT_UI_ADMIRAL_CONFIG_HUB_METADATA_OVERLAY
	);

	/**
	 * Object Overlay tabs to display in the template
	 */
	public objectOverlayTabs: Array<ConfigHubObjectTab> = [];

	/**
	 * Object overlay tab names enum to use in the template
	 */
	public readonly objectOverlayTabIndexes: typeof ConfigHubObjectTabs = ConfigHubObjectTabs;

	/**
	 * Selected overlay tab
	 */
	public currentObjectOverlayTab: ConfigHubObjectTabs = ConfigHubObjectTabs.JSON;

	/**
	 * List of JSON patch operations
	 */
	public jsonDiffList: Array<Operation> = [];

	/**
	 * The local value of the draft json object for the diff view
	 */
	public localDraftJson: string;

	/**
	 * Reference to the draft textarea in the diff view tab
	 */
	@ViewChild('draftTextArea', { static: false, read: ElementRef }) draftTextArea: ElementRef;

	/**
	 * Height of the diff view to match the textarea
	 */
	public diffViewHeight = 0;

	/**
	 * List of applied metadata modifications
	 */
	public appliedModificationMetadata: Array<ConfigHubModificationMetadata> = [];

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
	 * Determines if the draft can be updated based on its draft status
	 */
	public isDraftStatusUpdatable = false;

	/**
	 * Selector for wether or not to use the approvals feature
	 */
	public isApprovalsEnabled$ = this.store.select(fromDraftsPage.selectIsApprovalsEnabled);

	constructor(
		private formBuilder: UntypedFormBuilder,
		private store: Store,
		private unsavedChangesWarningService: UnsavedChangesWarningService,
		private featureFlagService: FeatureFlagService,
		private changeDetectorRef: ChangeDetectorRef,
		private userRightsService: UserRightsService
	) {
		this.canUserEditDraft$ = this.userRightsService.hasRight(ConfigHubRoles.DRAFT_UPDATE);
	}

	/**
	 * Initialization of the component.
	 */
	public ngOnInit(): void {
		this.initOverlayConfig();
	}

	/**
	 * Clean up when the instance is destroyed.
	 */
	public ngOnDestroy(): void {
		this.unsubscribe$.next();
		this.unsubscribe$.complete();
	}

	/**
	 * All initial configurations for the object overlay
	 */
	public initOverlayConfig(): void {
		this.initObjectDetailsForm();
		this.initErrorsDetail();
		this.getModificationMetadata();
		this.validateObjectWithJwsSignature();
		this.setOverlayTabs();
		this.setIsDraftUpdatable();
	}

	/**
	 * Handles overlay close.
	 */
	public handleDismiss(): void {
		this.unsavedChangesWarningService
			.promptToAbandonUnsavedChanges(ConfigHubDraftDetailsComponent)
			.then(shouldProceed => {
				if (shouldProceed) {
					this.setInitialTab();
					this.unsavedChangesWarningService.removeObjection(ConfigHubDraftDetailsComponent);

					this.objectJsonFormControl.markAsPristine();

					if (this.isJsonDiffViewFlagEnabled && this.isOperationChanged) {
						this.localDraftObjectJsonFormControl.markAsPristine();
					}
					this.unsubscribe$.next();
					this.store.dispatch(draftsPageActions.closeObjectDetails());
					this.onClose.emit();
				}
			});
	}

	/**
	 * Sets the flag to know if the draft is updatable or not based on its status
	 */
	private setIsDraftUpdatable(): void {
		this.draftApprovalStatus$
			.pipe(withLatestFrom(this.isApprovalsEnabled$), takeUntil(this.unsubscribe$))
			.subscribe(([approvalStatus, approvalsEnabled]) => {
				this.isDraftStatusUpdatable =
					this.isConfigHubDraftApprovalEnabled && approvalsEnabled ? approvalStatus === null : true;
			});
	}

	/**
	 * Handles saving the modified object JSON.
	 */
	public handleSave(): void {
		this.submitAttempted.emit();

		if (this.objectJsonFormControl.valid) {
			const objectJson = JSON.parse(this.objectJsonFormControl.value) as BaseObject;

			this.store.dispatch(
				draftsPageActions.objectJsonChangesSaved({
					objectType: this.selectedObjectType,
					objectOperationType: this.selectedOperationType,
					objectId: this.selectedObjectId,
					objectJson: objectJson.object
				})
			);

			this.unsavedChangesWarningService.removeObjection(ConfigHubDraftDetailsComponent);
			this.handleDismiss();
		}
	}

	/**
	 * Handle tab click to define current tab
	 * @param tab selected tab
	 */
	public handleTabClick(tab: ConfigHubObjectTabs): void {
		this.currentObjectOverlayTab = tab;

		if (tab === ConfigHubObjectTabs.EDIT) {
			this.calculateDiffViewHeight();
		}
	}

	/**
	 * Get the actual tab index in the objectOverlayTabs array position
	 * @param tabIndex tab index from the enum
	 */
	public getTabIndex(tabIndex: ConfigHubObjectTabs): number {
		return this.objectOverlayTabs.findIndex(tab => tab.index === tabIndex);
	}

	/**
	 * Calculate the height of the diff view text area
	 */
	private calculateDiffViewHeight(): void {
		this.changeDetectorRef.detectChanges();
		this.diffViewHeight = this.draftTextArea?.nativeElement.getBoundingClientRect().height - 66; // Subtract padding and border
	}

	/**
	 * Validates if text area should be enabled based on object JwsSignature
	 */
	private validateObjectWithJwsSignature(): void {
		this.objectDetails$.pipe(takeUntil(this.unsubscribe$)).subscribe(details => {
			if (details?.object.jwsSignature) {
				this.isObjectWithJwsSignature$.next(true);
			} else {
				this.isObjectWithJwsSignature$.next(false);
			}
		});
	}

	/**
	 * Initiates the objectDetailsForm.
	 */
	private initObjectDetailsForm(): void {
		this.objectDetailsForm = this.formBuilder.group({
			[this.DRAFT_OBJECT_JSON_FORM_KEY]: [
				'',
				[],
				[
					FieldValidators.required,
					ConfigHubFieldValidators.enforceValidJson,
					ConfigHubFieldValidators.enforceSameId(this.objectJson$, 'object'),
					ConfigHubFieldValidators.enforceOnlyObjectBlockChanges(this.objectJson$)
				]
			],
			[this.LIVE_OBJECT_JSON_FORM_KEY]: ['', [], []],
			[this.DIFF_OBJECT_JSON_FORM_KEY]: [
				'',
				[],
				[
					FieldValidators.required,
					ConfigHubFieldValidators.enforceValidJson,
					ConfigHubFieldValidators.enforceSameId(this.objectJson$, 'object'),
					ConfigHubFieldValidators.enforceOnlyObjectBlockChanges(this.objectJson$)
				]
			]
		});

		this.objectJsonFormControl = this.objectDetailsForm.get(this.DRAFT_OBJECT_JSON_FORM_KEY) as UntypedFormControl;

		this.objectJson$.pipe(takeUntil(this.unsubscribe$)).subscribe(value => {
			this.localDraftJson = value;
			this.changeDetectorRef.detectChanges();
		});

		this.objectJsonFormControl.statusChanges
			.pipe(
				filter(() => this.objectJsonFormControl.dirty && !this.unsavedChangesWarningService.hasObjections()),
				takeUntil(this.unsubscribe$)
			)
			.subscribe(() => this.unsavedChangesWarningService.setObjection(ConfigHubDraftDetailsComponent));

		// Init read only view of live object in comparison view
		if (this.isOperationChanged || this.isOperationAdded) {
			this.liveObjectJsonFormControl = this.objectDetailsForm.get(
				this.LIVE_OBJECT_JSON_FORM_KEY
			) as UntypedFormControl;

			this.liveObjectJson$.pipe(takeUntil(this.unsubscribe$)).subscribe(value => {
				this.liveObjectJsonFormControl.setValue(value);
			});

			this.initFormatJsonPatchList();
		}

		// Init editable view of draft object in diff view
		if ((this.isOperationChanged || this.isOperationAdded) && this.isJsonDiffViewFlagEnabled) {
			this.localDraftObjectJsonFormControl = this.objectDetailsForm.get(
				this.DIFF_OBJECT_JSON_FORM_KEY
			) as UntypedFormControl;

			this.localDraftObjectJsonFormControl.valueChanges
				.pipe(takeUntil(this.unsubscribe$), debounceTime(400), distinctUntilChanged())
				.subscribe(value => {
					this.objectJsonFormControl.setValue(value);
					this.changeDetectorRef.detectChanges();
				});

			this.localDraftObjectJsonFormControl.statusChanges
				.pipe(
					filter(
						() =>
							this.localDraftObjectJsonFormControl.dirty &&
							!this.unsavedChangesWarningService.hasObjections()
					),
					takeUntil(this.unsubscribe$)
				)
				.subscribe(() => this.unsavedChangesWarningService.setObjection(ConfigHubDraftDetailsComponent));

			this.objectJsonFormControl.valueChanges
				.pipe(takeUntil(this.unsubscribe$), debounceTime(400), distinctUntilChanged())
				.subscribe(value => {
					this.localDraftJson = value;
					this.changeDetectorRef.detectChanges();
				});
		}
	}

	/**
	 * Get the list of differences between both JSON objects
	 * @param diffList - A list of JSON patch operations
	 * @param parsedLiveJSON - The live JSON parsed as an object
	 * @param parsedObjectJSON - The draft JSON parsed as an object
	 */
	private compareJSONs(diffList: Array<Operation>, parsedLiveJSON: ObjectDetails): void {
		this.jsonDiffList = diffList.map(diffElement => {
			if (diffElement.op === ConfigHubPatchOperations.REPLACE) {
				return {
					...diffElement,
					oldValue: String(getValueByPointer(parsedLiveJSON, diffElement.path)),
					value: String(diffElement.value)
				};
			}

			return diffElement;
		});
	}

	/**
	 * Formats objects in the the json patch list
	 */
	private initFormatJsonPatchList(): void {
		this.objectDetails$
			.pipe(
				concatLatestFrom(() => [this.liveObjectJson$, this.objectJson$]),
				takeUntil(this.unsubscribe$)
			)
			.subscribe(([objectDetail, liveJson]) => {
				if (objectDetail?.jsonPatch && liveJson) {
					this.compareJSONs(objectDetail.jsonPatch, JSON.parse(liveJson).object);
				}
			});
	}

	/**
	 * Parses messages from object details and sets to error details
	 */
	private initErrorsDetail(): void {
		this.objectDetails$.pipe(takeUntil(this.unsubscribe$)).subscribe(objectDetail => {
			if (objectDetail?.hasErrors) {
				this.errorsDetail = JSON.parse(objectDetail.message);
			}
		});
	}

	/**
	 * Gets the list of applied metadata modifications
	 */
	private getModificationMetadata(): void {
		if (this.isObjectMetadataEnabled) {
			this.objectDetails$.pipe(takeUntil(this.unsubscribe$)).subscribe(objectDetail => {
				if (objectDetail?.appliedModificationMetadata) {
					this.appliedModificationMetadata = objectDetail.appliedModificationMetadata || [];
					this.setOverlayTabs();
				}
			});
		}
	}

	/**
	 * Set The tabs available in the current iteration of the object overlay based on the selected operation
	 */
	private setOverlayTabs(): void {
		const tabs = {
			[ConfigHubObjectTabs.JSON]: {
				withIcon: false,
				title: 'CONFIG_HUB.JSON_VIEW',
				index: ConfigHubObjectTabs.JSON
			},
			[ConfigHubObjectTabs.ISSUES]: {
				withIcon: true,
				title: 'CONFIG_HUB.REFERENCE_ISSUES',
				index: ConfigHubObjectTabs.ISSUES
			}
		};

		const diffTab = {
			withIcon: false,
			title: 'CONFIG_HUB.EDIT_VIEW',
			index: ConfigHubObjectTabs.EDIT
		};

		const rulesTab = {
			withIcon: false,
			title: 'CONFIG_HUB.RULES_SUBSTITUTIONS',
			index: ConfigHubObjectTabs.RULES
		};

		const changelogTab = {
			withIcon: false,
			title: 'CONFIG_HUB.CHANGE_LOG',
			index: ConfigHubObjectTabs.CHANGELOG
		};

		if (this.isOperationChanged) {
			if (this.isJsonChangelogFlagEnabled) {
				tabs[changelogTab.index] = changelogTab;
			}

			if (this.isJsonDiffViewFlagEnabled) {
				tabs[diffTab.index] = diffTab;
			}
		}

		if (
			this.isObjectMetadataEnabled &&
			this.appliedModificationMetadata.length &&
			(this.isOperationChanged || this.isOperationAdded)
		) {
			tabs[rulesTab.index] = rulesTab;
		}

		this.objectOverlayTabs = this.formatTabs(tabs);
	}

	/**
	 * Formats the tabs in an array by reducing over preferred positions
	 * Will only aggregate those tabs passed into the function
	 * @param tabs formatted by index
	 */
	private formatTabs(tabs: { [key: string]: ConfigHubObjectTab }): Array<ConfigHubObjectTab> {
		return [
			ConfigHubObjectTabs.EDIT,
			ConfigHubObjectTabs.CHANGELOG,
			ConfigHubObjectTabs.JSON,
			ConfigHubObjectTabs.RULES,
			ConfigHubObjectTabs.ISSUES
		].reduce((acc, tabIndex) => {
			if (tabs[tabIndex]) {
				acc.push(tabs[tabIndex]);
			}
			return acc;
		}, []) as Array<ConfigHubObjectTab>;
	}

	/**
	 * Set initial tab based on the selected operation
	 */
	private setInitialTab(): void {
		if (this.isOperationChanged) {
			if (this.isJsonDiffViewFlagEnabled) {
				this.currentObjectOverlayTab = this.getTabIndex(ConfigHubObjectTabs.EDIT);
				if (this.selectedObjectId) {
					this.calculateDiffViewHeight();
				}
			} else if (this.isJsonChangelogFlagEnabled) {
				this.currentObjectOverlayTab = this.getTabIndex(ConfigHubObjectTabs.CHANGELOG);
			} else {
				this.currentObjectOverlayTab = this.getTabIndex(ConfigHubObjectTabs.JSON);
			}
		} else {
			this.currentObjectOverlayTab = this.getTabIndex(ConfigHubObjectTabs.JSON);
		}
	}
}
