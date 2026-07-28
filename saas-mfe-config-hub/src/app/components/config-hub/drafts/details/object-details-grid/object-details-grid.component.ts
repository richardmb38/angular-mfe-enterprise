/*
 * Copyright (C) 2023 Acme Technologies, Inc.  All rights reserved.
 */
import {
	ChangeDetectionStrategy,
	ChangeDetectorRef,
	Component,
	HostListener,
	Input,
	OnDestroy,
	ViewChild
} from '@angular/core';

import { Store } from '@ngrx/store';
import {
	CellClickedEvent,
	GridApi,
	GridOptions,
	GridReadyEvent,
	RowDataUpdatedEvent,
	RowNode,
	SelectionChangedEvent
} from 'ag-grid-community';
import { Subject, take, withLatestFrom } from 'rxjs';

import {
	CompositeDataGridComponent,
	DataGridColumnsFactoryService,
	DataGridLoadingComponent,
	DataGridNoDataComponent,
	SlptColDef
} from '@acme-priv/armada-angular/src/acme/angular/components/grid';
import { TranslateService } from '@acme-priv/armada-angular/src/acme/angular/l10n/translation';
import { Alignment } from '@acme-priv/armada-angular/src/acme/theme/typescript';

import { FeatureFlagService } from '@acme-priv/ui-common/src/acme/angular/util';
import { UserRightsService } from '@acme-priv/ui-common/src/acme/angular/util/user-rights';

import { draftsPageActions } from '../../store/actions';
import { fromDraftsPage } from '../../store/selectors';

import { FeatureFlags } from '../../../../../featureflags.enum';
import {
	CONFIG_HUB_PAGE_SIZE_OPTIONS,
	ConfigHubApprovalStatus,
	GRID_SELECT_COLUMN_ID,
	OBJECT_TYPE_ITEM_ID_FIELD,
	ObjectDetails,
	ObjectOperationType,
	gridNoDataModel
} from '../../../shared/models';
import { ConfigHubRoles } from '../../../shared/models/config-hub.model';
import { ObjectWarningCellComponent } from './object-warning-cell/object-warning-cell.component';
import { ConfigHubObservedIds } from 'app/components/config-hub/config-hub.model';
import { getNodeSelectedStatus, handleRowSelectionChange } from 'app/components/config-hub/shared/utils';

/**
 * Configuration Hub Object Details Grid
 *
 * Displays a list of object details for a given type and operation.
 */
@Component({
	selector: 'app-config-hub-object-details-grid',
	templateUrl: './object-details-grid.component.html',
	styleUrls: ['./object-details-grid.component.scss'],
	changeDetection: ChangeDetectionStrategy.OnPush
})
export class ConfigHubObjectDetailsGridComponent implements OnDestroy {
	/**
	 * Whether the grid is currently loading new data.
	 */
	@Input() loading: boolean;

	/**
	 * Alignment used for the pager
	 */
	public Alignment = Alignment;

	/**
	 * Object details data used to populate the grid.
	 */
	@Input() objectDetails: ObjectDetails[];

	/**
	 * The selected object type, e.g. ACCESS_PROFILES.
	 */
	@Input() selectedObjectType: string;

	/**
	 * The selected object ID.
	 */
	@Input() selectedObjectId: string;

	/**
	 * The currently selected ObjectOperationType.
	 */
	private _selectedOperationType: ObjectOperationType;

	/**
	 * Gets the selected operation type
	 */
	@Input()
	get selectedOperationType(): ObjectOperationType {
		return this._selectedOperationType;
	}

	/**
	 * Sets the selected operation type
	 */
	set selectedOperationType(operationType: ObjectOperationType) {
		if (this._selectedOperationType !== operationType) {
			this._selectedOperationType = operationType;

			this.objectDetailsHasErrors$
				.pipe(withLatestFrom(this.draftApprovalStatus$, this.isApprovalsEnabled$))
				.subscribe(([objectDetailsHasErrors, approvalStatus, approvalsEnabled]) => {
					this.updateGrid(objectDetailsHasErrors, approvalStatus, approvalsEnabled);
				});
		}
	}

	/**
	 * Column definitions for the Compare Summary grid.
	 */
	public columnDefs: SlptColDef[];

	/**
	 * The grid api.
	 */
	public gridApi: GridReadyEvent;

	/**
	 * The options for the grid.
	 */
	public gridOptions: GridOptions = {
		getRowId: (data: ObjectDetails | any) => data?.data?.objectId,
		suppressMovableColumns: true,
		enableBrowserTooltips: true,
		suppressMultiSort: true,
		suppressColumnVirtualisation: true,
		colResizeDefault: 'shift',
		domLayout: 'normal',
		components: {
			customLoadingOverlay: DataGridLoadingComponent,
			customNoRowsOverlay: DataGridNoDataComponent
		},
		onCellClicked: this.handleCellClicked.bind(this),
		onRowDataUpdated: (params: RowDataUpdatedEvent) => this.setSelectedRows(params.api)
	};

	/**
	 * Model containing the empty state component when the grid has no data.
	 */
	public noDataModel = gridNoDataModel();

	/**
	 * Reference to the CompositeDataGridComponent.
	 */
	@ViewChild('slptCompositeGrid')
	public slptCompositeGrid: CompositeDataGridComponent;

	/**
	 * The current search query.
	 */
	public searchQuery$ = this.store.select(fromDraftsPage.selectSearchQuery());

	/**
	 * The currently selected page.
	 */
	public currentPage$ = this.store.select(fromDraftsPage.selectCurrentPage());

	/**
	 * The last available page.
	 */
	public finalPage$ = this.store.select(fromDraftsPage.selectFinalPage());

	/**
	 * The page size.
	 */
	public pageSize$ = this.store.select(fromDraftsPage.selectPageSize());

	/**
	 * The total count for changed objects.
	 */
	public totalCount$ = this.store.select(fromDraftsPage.selectSingleSummarydTotal);

	/**
	 * The total count for selected objects.
	 */
	public objectSelectedCount$ = this.store.select(fromDraftsPage.selectSelectedObjectAmount());

	/**
	 * The selectable page size options.
	 */
	public pageSizeOptions = CONFIG_HUB_PAGE_SIZE_OPTIONS;

	/**
	 * Checks is its a filtered view
	 */
	public isErrorView$ = this.store.select(fromDraftsPage.selectObjectTypeShowErrorState);

	/**
	 * List of the ids that are deselected for the selected object type
	 */
	private deselectedObjectIds$ = this.store.select(fromDraftsPage.selectDeselectedObjectIds());

	/**
	 * Whether or not the object details has errors.
	 */
	private objectDetailsHasErrors$ = this.store.select(fromDraftsPage.selectObjectDetailsHasErrors);

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
	 * Selector for wether or not to use the approvals feature
	 */
	public isApprovalsEnabled$ = this.store.select(fromDraftsPage.selectIsApprovalsEnabled);

	/**
	 * Can the user edit drafts right call
	 */
	public canUserEditDrafts$: Promise<boolean>;

	/**
	 * Subject to unsubscribe on destroy.
	 */
	private unsubscribe$ = new Subject<void>();

	constructor(
		private columnsService: DataGridColumnsFactoryService,
		private store: Store,
		private translateService: TranslateService,
		private changeDetectorRef: ChangeDetectorRef,
		private userRightsService: UserRightsService,
		private featureFlagService: FeatureFlagService
	) {
		this.canUserEditDrafts$ = this.userRightsService.hasRight(ConfigHubRoles.DRAFT_UPDATE);
	}

	/**
	 * Clean up when the instance is destroyed.
	 */
	public ngOnDestroy(): void {
		if (this.selectedObjectId) {
			this.store.dispatch(draftsPageActions.closeObjectDetails());
		}
		this.unsubscribe$.next();
		this.unsubscribe$.complete();
	}

	/**
	 * Handles the gridReady event when the grid loads and initiates updating rows.
	 * @param event - The grid ready event emitted by ag-grid.
	 */
	public onGridReady(event?: GridReadyEvent): void {
		if (!this.gridApi) {
			this.gridApi = event;
		}
		this.objectDetailsHasErrors$
			.pipe(withLatestFrom(this.draftApprovalStatus$, this.isApprovalsEnabled$))
			.subscribe(([objectDetailsHasErrors, approvalStatus, approvalsEnabled]) => {
				this.updateGrid(objectDetailsHasErrors, approvalStatus, approvalsEnabled);
			});
	}

	/**
	 * Updates the grid column definitions
	 * @param hasErrors wether to show errors column
	 */
	private async updateGrid(
		hasErrors = false,
		approvalStatus: ConfigHubApprovalStatus,
		approvalsEnabled: boolean
	): Promise<void> {
		this.canUserEditDrafts$.then(canUserEditRight => {
			const isDraftStatusUpdatable =
				this.isConfigHubDraftApprovalEnabled && approvalsEnabled ? approvalStatus === null : true;

			const columnDefs: SlptColDef[] = [
				...(canUserEditRight && isDraftStatusUpdatable ? [this.columnsService.createSelectColumn()] : []),
				{
					headerName: this.translateService.instant('CONFIG_HUB.NAME'),
					field: 'objectName',
					sortable: false,
					sort: 'asc',
					cellStyle: { 'font-weight': 'bold' },
					resizable: true
				},
				{
					headerName: 'ID',
					field: 'objectId',
					sortable: false,
					suppressSizeToFit: true,
					resizable: true,
					width: 360
				}
			];

			if (hasErrors) {
				columnDefs.splice(1, 0, {
					headerName: this.translateService.instant('CONFIG_HUB.ISSUE'),
					field: 'hasErrors',
					cellRenderer: ObjectWarningCellComponent,
					sortable: false,
					suppressAutoSize: true,
					suppressMovable: true,
					suppressSizeToFit: true,
					cellStyle: { display: 'flex' },
					maxWidth: 75
				});
			}

			this.columnDefs = columnDefs;
			this.addActionsColumn(canUserEditRight && isDraftStatusUpdatable);
		});
	}

	/**
	 * Adds the actions column to the grid
	 */
	private addActionsColumn(canUserEditDrafts: boolean): void {
		const actionsColumn = {
			...this.columnsService.createActionsColumnWithDropdown(
				[
					{
						label:
							this.selectedOperationType === ObjectOperationType.REMOVED || !canUserEditDrafts
								? 'CONFIG_HUB.VIEW'
								: 'CONFIG_HUB.EDIT',
						clickHandle: ({ data }: RowNode<ObjectDetails>) =>
							this.dispatchViewObjectDetails(data.objectId),
						slptIconName: 'edit'
					}
				],
				this.translateService.instant('CONFIG_HUB.ACTIONS'),
				180
			),
			headerClass: 'object-details-grid__actions-header'
		};

		this.columnDefs.push(actionsColumn);
	}

	/**
	 * Resize the grid to fit columns on window resize.
	 * Allows the grid to have a reactive feel.
	 * @param event - Window resize event.
	 */
	@HostListener('window:resize', ['$event'])
	public onWindowSizeChangedEvent(): void {
		if (!this.gridApi) {
			return;
		}

		this.gridApi.api.sizeColumnsToFit();
	}

	/**
	 * Handles changes to the search input.
	 * @param searchQuery - The query to filter results on.
	 */
	public handleSearchInputChange(searchQuery: string): void {
		this.store.dispatch(
			draftsPageActions.objectListSearchTermChange({
				objectType: this.selectedObjectType,
				objectOperationType: this.selectedOperationType,
				searchQuery
			})
		);
	}

	/**
	 * Handle grid selection change
	 * @param {SelectionChangedEvent} event selection changed event
	 */
	public handleSelectionChange(event: SelectionChangedEvent): void {
		if (event.source !== 'rowDataChanged') {
			this.deselectedObjectIds$.pipe(take(1)).subscribe((objectIds: Record<ObjectOperationType, string[]>) => {
				// Get selection status from each row since selectionChangedEvent doesn't provide the selected row
				const { deselectedIds, selectedIds } = getNodeSelectedStatus(event, OBJECT_TYPE_ITEM_ID_FIELD);
				this.handleRowSelectionAction({
					deselectedIds,
					selectedIds,
					storeDeselectedIds: objectIds[this.selectedOperationType]
				});
			});
		}
	}

	/**
	 * Handle row selection change actions
	 * @param {ConfigHubObservedIds} observedIds list of selected and deselected ids in the grid and store
	 */
	private handleRowSelectionAction(observedIds: ConfigHubObservedIds): void {
		const selectActions = {
			singleSelectAction: draftsPageActions.objectSelect,
			singleDeselectAction: draftsPageActions.objectDeselect,
			bulkSelectAction: draftsPageActions.objectBulkSelect,
			bulkDeselectAction: draftsPageActions.objectBulkDeselect
		};

		const actionData = {
			objectType: this.selectedObjectType,
			objectOperationType: this.selectedOperationType
		};

		handleRowSelectionChange(observedIds, selectActions, actionData, this.store, OBJECT_TYPE_ITEM_ID_FIELD);

		this.gridApi.api.refreshCells();
		this.changeDetectorRef.detectChanges();
	}

	/**
	 * Set the rows that should be selected for the current object
	 * @param {GridApi} gridApi ag grid api
	 */
	private setSelectedRows(gridApi: GridApi): void {
		this.deselectedObjectIds$.pipe(take(1)).subscribe((deselectedIds: Record<ObjectOperationType, string[]>) => {
			gridApi.forEachNode(node => {
				node.setSelected(
					!deselectedIds[this.selectedOperationType].includes(node.data.objectId),
					false,
					'rowDataChanged'
				);
			});
			gridApi.refreshHeader();
		});
	}

	/**
	 * Handles the event `onPageChanged` from the ag-grid and updates the page number.
	 * @param {number} pageNumber - The current page number.
	 */
	public handlePageChanged(pageNumber: number) {
		this.store.dispatch(
			draftsPageActions.objectListPageNumberChange({
				objectType: this.selectedObjectType,
				objectOperationType: this.selectedOperationType,
				pageNumber: pageNumber
			})
		);
	}

	/**
	 * Handles the event `onPageSizeChanged` from the ag-grid and updates the page size.
	 * @param {number} pageSize - The current page size.
	 */
	public handlePageSizeChanged(pageSize: number) {
		this.store.dispatch(
			draftsPageActions.objectListPageSizeChange({
				objectType: this.selectedObjectType,
				objectOperationType: this.selectedOperationType,
				pageSize: pageSize
			})
		);
	}

	/**
	 * Handle cell clicked.
	 * @param args - Arguments passed from cell click event.
	 */
	private handleCellClicked(args: CellClickedEvent<ObjectDetails>): void {
		const colId = args.column.getColId();
		const notClickableElements = [GRID_SELECT_COLUMN_ID];
		if (!notClickableElements.includes(colId)) {
			this.dispatchViewObjectDetails(args.data.objectId);
		}
	}

	/**
	 * Dispatches the viewObjectDetails action with the given objectId.
	 * @param objectId - The objectId used in the action params.
	 */
	private dispatchViewObjectDetails(objectId: string): void {
		this.store.dispatch(draftsPageActions.viewObjectDetails({ objectId }));
	}
}
