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
import { ActivatedRoute, Router } from '@angular/router';

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
import { Subject, take } from 'rxjs';

import {
	DataGridActionsMenuDropdownModel,
	DataGridColumnsFactoryService,
	DataGridComponent,
	DataGridLoadingComponent,
	DataGridNoDataComponent,
	SlptColDef
} from '@acme-priv/armada-angular/src/acme/angular/components/grid';
import { TranslateService } from '@acme-priv/armada-angular/src/acme/angular/l10n/translation';

import { draftsPageActions } from 'app/components/config-hub/drafts/store/actions';
import { fromDraftsPage } from 'app/components/config-hub/drafts/store/selectors';

import {
	ConfigHubCompareSummaryRow,
	OBJECT_TYPE_ID_FIELD,
	ObjectDeltaTypeNames,
	ObjectOperationType,
	gridLoadingModel,
	gridNoDataModel,
	objectDeltaNamesToOperationTypes
} from '../../models';
import { getNodeSelectedStatus, handleRowSelectionChange } from '../../utils';
import { ObjectDiffCellComponent } from '../object-diff-cell/object-diff-cell.component';
import { ObjectTypeCellComponent } from '../object-type-cell/object-type-cell.component';
import { ConfigHubObservedIds } from 'app/components/config-hub/config-hub.model';
import { DraftsChildRoutes } from 'app/components/config-hub/drafts/drafts.model';

/**
 * Configuration Hub Compare Summary Grid
 *
 * Displays a summary of the compare result.
 */
@Component({
	selector: 'app-config-hub-compare-summary-grid',
	templateUrl: './compare-summary-grid.component.html',
	styleUrls: ['./compare-summary-grid.component.scss'],
	changeDetection: ChangeDetectionStrategy.OnPush
})
export class ConfigHubCompareSummaryGridComponent implements OnDestroy {
	/**
	 * Determines whether or not a user should be able to make edits
	 */
	@Input() set isEditingEnabled(isEditingEnabled: boolean) {
		if (isEditingEnabled !== null) {
			this._isEditingEnabled = isEditingEnabled;
			this.initializeGridOptions();
		}
	}

	/**
	 * The getter for the isEditingEnabled
	 */
	get isEditingEnabled(): boolean {
		return this._isEditingEnabled;
	}

	/**
	 * Column definitions for the Compare Summary grid.
	 */
	public columnDefs: SlptColDef[];

	/**
	 * The grid api.
	 */
	public gridApi: GridApi;

	/**
	 * The options for the grid.
	 */
	public gridOptions: GridOptions = {
		getRowId: (data: ConfigHubCompareSummaryRow | any) => data?.data?.objectType,
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
		onRowDataUpdated: (params: RowDataUpdatedEvent<any>) => this.setSelectedRows(params.api)
	};

	/**
	 * Internal grid loading mask model - disabled by default.
	 */
	public loadingModel = gridLoadingModel;

	/**
	 * Model containing the empty state component when the grid has no data.
	 */
	public noDataModel = gridNoDataModel();

	/**
	 * An array of ConfigHubCompareSummaryRow. Used to populate the grid.
	 */
	public summaryRowData$ = this.store.select(fromDraftsPage.selectSummaryRowData);

	/**
	 * List of the object types that are deselected
	 */
	private deselectedObjectTypes$ = this.store.select(fromDraftsPage.selectDeselectedObjectTypes);

	/**
	 * Reference to the DataGridComponent.
	 */
	@ViewChild('slptGrid', { static: true })
	public slptGrid: DataGridComponent;

	/**
	 * The private value for editing check
	 */
	private _isEditingEnabled: boolean;

	/**
	 * Subject to unsubscribe on destroy.
	 */
	private unsubscribe$ = new Subject<void>();

	constructor(
		private activatedRoute: ActivatedRoute,
		private changeDetectorRef: ChangeDetectorRef,
		private translateService: TranslateService,
		private columnsService: DataGridColumnsFactoryService,
		private router: Router,
		private store: Store
	) {}

	/**
	 * Initialization of the component.
	 */
	private initializeGridOptions(): void {
		this.columnDefs = [
			...(this.isEditingEnabled ? [this.columnsService.createSelectColumn()] : []),
			{
				headerName: this.translateService.instant('CONFIG_HUB.DRAFT_OBJECTS'),
				field: 'objectType',
				sortable: false,
				sort: 'asc',
				cellStyle: { 'font-weight': 'bold' },
				resizable: true,
				cellRenderer: ObjectTypeCellComponent
			},
			{
				headerName: this.translateService.instant('CONFIG_HUB.ADDS_TO_LIVE'),
				headerClass: 'summary-grid__header--align-end',
				field: ObjectDeltaTypeNames.ADDED,
				sortable: false,
				suppressSizeToFit: true,
				resizable: true,
				width: 200,
				onCellClicked: this.handleCellClicked.bind(this),
				cellRenderer: ObjectDiffCellComponent,
				cellRendererParams: {
					operation: ObjectDeltaTypeNames.ADDED
				}
			},
			{
				headerName: this.translateService.instant('CONFIG_HUB.MODIFIES_TO_LIVE'),
				headerClass: 'summary-grid__header--align-end',
				field: ObjectDeltaTypeNames.DIFFERENT,
				sortable: false,
				suppressSizeToFit: true,
				resizable: true,
				width: 200,
				onCellClicked: this.handleCellClicked.bind(this),
				cellRenderer: ObjectDiffCellComponent,
				cellRendererParams: {
					operation: ObjectDeltaTypeNames.DIFFERENT
				}
			},
			{
				headerName: this.translateService.instant('CONFIG_HUB.NOT_IN_BACKUP'),
				headerClass: 'summary-grid__header--align-end',
				field: ObjectDeltaTypeNames.REMOVED,
				sortable: false,
				suppressSizeToFit: true,
				resizable: true,
				width: 200,
				onCellClicked: this.handleCellClicked.bind(this),
				cellRenderer: ObjectDiffCellComponent,
				cellRendererParams: {
					operation: ObjectDeltaTypeNames.REMOVED
				}
			},
			{
				headerName: this.translateService.instant('CONFIG_HUB.REFERENCE_ISSUES'),
				headerClass: 'summary-grid__header--align-end',
				field: ObjectDeltaTypeNames.ERRORS,
				sortable: false,
				suppressSizeToFit: true,
				resizable: true,
				width: 200,
				onCellClicked: ({ data }: RowNode<ConfigHubCompareSummaryRow>) =>
					this.navigateToObjectDetails(data, undefined, true),
				cellRenderer: ObjectDiffCellComponent,
				cellRendererParams: {
					operation: ObjectDeltaTypeNames.ERRORS
				}
			},
			{
				...this.columnsService.createActionsColumnWithDropdown(
					[
						{
							label: this.isEditingEnabled ? 'CONFIG_HUB.EDIT' : 'CONFIG_HUB.VIEW',
							disabledGetter: ({ node }) => !node.isSelected(),
							clickHandle: ({ data }: RowNode<ConfigHubCompareSummaryRow>) =>
								this.navigateToObjectDetails(data),
							slptIconName: 'edit'
						} as DataGridActionsMenuDropdownModel
					],
					this.translateService.instant('CONFIG_HUB.ACTIONS'),
					180
				),
				headerClass: 'summary-grid__header--align-center'
			}
		];
	}

	/**
	 * Clean up when the instance is destroyed.
	 */
	public ngOnDestroy(): void {
		this.unsubscribe$.next();
		this.unsubscribe$.complete();
	}

	/**
	 * Handles the gridReady event when the grid loads and initiates updating rows.
	 * @param event - The grid ready event emitted by ag-grid.
	 */
	public onGridReady(event?: GridReadyEvent): void {
		if (!this.gridApi) {
			this.gridApi = event.api;
		}
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

		this.gridApi.sizeColumnsToFit();
	}

	/**
	 * Triggers navigation to the ConfigHubDraftDetailsComponent.
	 * @param configHubCompareSummaryRow - The row of summary data.
	 * @param objectOperationType - The selected ObjectOperationType.
	 * @param showErrors - To show list of errors only.
	 */
	private navigateToObjectDetails(
		configHubCompareSummaryRow: ConfigHubCompareSummaryRow,
		objectOperationType?: ObjectOperationType,
		showErrors = false
	): void {
		this.store
			.select(fromDraftsPage.selectAvailableOperationTypes(configHubCompareSummaryRow.objectType))
			.pipe(take(1))
			.subscribe(objectOperationTypes => {
				this.store.dispatch(
					draftsPageActions.viewObjectList({
						objectType: configHubCompareSummaryRow.objectType,
						objectOperationType: objectOperationType ?? objectOperationTypes[0],
						showErrors
					})
				);
				this.router.navigate([DraftsChildRoutes.DETAILS.route.replace(':id/', '')], {
					relativeTo: this.activatedRoute
				});
			});
	}

	/**
	 * Handle cell Clicked
	 * @param {CellClickedEvent<ConfigHubCompareSummaryRow, number>} event cell clicked event
	 */
	public handleCellClicked(event: CellClickedEvent<ConfigHubCompareSummaryRow, number>): void {
		if (event.node.isSelected()) {
			const operationType: ObjectOperationType = objectDeltaNamesToOperationTypes[event.colDef.field];
			const objectType = event.data.objectType;
			this.store
				.select(fromDraftsPage.selectIsOperationTypeAvailable(operationType, objectType))
				.pipe(take(1))
				.subscribe(
					isOperationAvailable =>
						isOperationAvailable && this.navigateToObjectDetails(event.data, operationType)
				);
		}
	}

	/**
	 * Handle grid selection change
	 * @param {SelectionChangedEvent} event selection changed event
	 */
	public handleSelectionChange(event: SelectionChangedEvent): void {
		this.deselectedObjectTypes$.pipe(take(1)).subscribe((objectTypes: string[]) => {
			// Get selection status from each row since selectionChangedEvent doesn't provide the selected row
			const { deselectedIds, selectedIds } = getNodeSelectedStatus(event, OBJECT_TYPE_ID_FIELD);

			this.handleRowSelectionAction({
				deselectedIds,
				selectedIds,
				storeDeselectedIds: objectTypes
			});
		});
	}

	/**
	 * Handle row selection change actions
	 * @param {ConfigHubObservedIds} observedIds list of selected and deselected ids in the grid and store
	 */
	private handleRowSelectionAction(observedIds: ConfigHubObservedIds): void {
		const selectActions = {
			singleSelectAction: draftsPageActions.objectTypeSelect,
			singleDeselectAction: draftsPageActions.objectTypeDeselect,
			bulkSelectAction: draftsPageActions.objectTypesBulkSelect,
			bulkDeselectAction: draftsPageActions.objectTypesBulkDeselect
		};

		handleRowSelectionChange(observedIds, selectActions, {}, this.store, OBJECT_TYPE_ID_FIELD);

		this.gridApi.refreshCells({ force: true });
		this.changeDetectorRef.detectChanges();
	}

	/**
	 * Set the objectTypes that should be selected
	 * @param {GridApi} gridApi ag grid api
	 */
	private setSelectedRows(gridApi: GridApi): void {
		this.deselectedObjectTypes$.pipe(take(1)).subscribe((deselectedIds: string[]) => {
			gridApi.forEachNode(node => {
				node.setSelected(!deselectedIds.includes(node.data.objectType), false, 'rowDataChanged');
			});
			gridApi.refreshHeader();
			gridApi.refreshCells({ force: true });
			this.changeDetectorRef.detectChanges();
		});
	}
}
