/*
 * Copyright (C) 2023 Acme Technologies, Inc.  All rights reserved.
 */
import { Component, EventEmitter, HostListener, Input, OnDestroy, OnInit, Output, ViewChild } from '@angular/core';

import { GridOptions, GridReadyEvent, RowNode } from 'ag-grid-community';
import { BehaviorSubject, Subject, of, take } from 'rxjs';

import { AlertService } from '@acme-priv/armada-angular/src/acme/angular/components/alert';
import { TypeaheadOption } from '@acme-priv/armada-angular/src/acme/angular/components/form';
import {
	CompositeDataGridComponent,
	DataGridColumnsFactoryService,
	DataGridLoadingComponent,
	DataGridNoDataComponent,
	SlptColDef
} from '@acme-priv/armada-angular/src/acme/angular/components/grid';
import { TranslateService } from '@acme-priv/armada-angular/src/acme/angular/l10n/translation';
import { deepClone } from '@acme-priv/armada-angular/src/acme/angular/util/deep-clone';
import { Alignment } from '@acme-priv/armada-angular/src/acme/theme/typescript';

import { DropdownCellComponent } from '../../shared/components/dropdown-cell/dropdown-cell.component';
import { IconCellComponent } from '../../shared/components/icon-cell/icon-cell.component';
import { IconCellIcons } from '../../shared/components/icon-cell/icon-cell.model';
import { ConfigHubObjectMapping, getObjectMappingSuccessAlertConfig, gridNoDataModel } from '../../shared/models';
import { ConfigHubObjectMappingService } from '../../shared/services/object-mappings/object-mappings.service';

/**
 * Configuration Hub Object Mapping Overlay
 */
@Component({
	selector: 'app-config-hub-object-mapping-create-overlay',
	templateUrl: './object-mapping-create-overlay.component.html',
	styleUrls: ['./object-mapping-create-overlay.component.scss']
})
export class ConfigHubObjectMappingOverlayComponent implements OnDestroy, OnInit {
	/**
	 * Current selected tenant
	 */
	@Input() public selectedTenant: string;

	/**
	 * Object types list
	 */
	@Input() public objectTypes: Array<TypeaheadOption>;

	/**
	 * Emits an event when the overlay is dismissed.
	 */
	@Output() onDismiss = new EventEmitter<void>();

	/**
	 * Emits an event when data is saved
	 */
	@Output() onSave = new EventEmitter<Array<ConfigHubObjectMapping>>();

	/**
	 * Column definitions for the Object Mapping grid.
	 */
	public columnDefs: SlptColDef[];

	/**
	 * The grid api.
	 */
	public gridApi: GridReadyEvent;

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
	 * The options for the grid.
	 */
	public gridOptions: GridOptions = {
		getRowId: ({ data }) => data.objectMappingId,
		suppressMovableColumns: true,
		enableBrowserTooltips: true,
		suppressMultiSort: true,
		suppressColumnVirtualisation: true,
		suppressRowVirtualisation: true,
		singleClickEdit: true,
		colResizeDefault: 'shift',
		domLayout: 'normal',
		components: {
			customLoadingOverlay: DataGridLoadingComponent,
			customNoRowsOverlay: DataGridNoDataComponent
		}
	};

	/**
	 * Object mapping list
	 */
	public objectMappingList$ = new BehaviorSubject<Array<ConfigHubObjectMapping>>([]);

	/**
	 * Loading state
	 */
	public loading = false;

	/**
	 * Empty object mapping model
	 */
	public readonly emptyMappingModel: ConfigHubObjectMapping = {
		objectType: `<${this.translateService.instant('CONFIG_HUB.PLACEHOLDER_TEXT')}>`,
		jsonPath: '$.name',
		sourceValue: `<${this.translateService.instant('CONFIG_HUB.PLACEHOLDER_TEXT')}>`,
		targetValue: `<${this.translateService.instant('CONFIG_HUB.PLACEHOLDER_TEXT')}>`,
		enabled: false
	};

	/**
	 * Subject to unsubscribe on destroy.
	 */
	private unsubscribe$ = new Subject<void>();

	constructor(
		private translateService: TranslateService,
		private configHubObjectMappingService: ConfigHubObjectMappingService,
		private alertService: AlertService,
		private columnsService: DataGridColumnsFactoryService
	) {}

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
	 * Initialize component
	 */
	ngOnInit(): void {
		this.columnDefs = [
			...this.getObjectMappingGridColumnDefs(),
			{
				...this.columnsService.createActionsColumnWithDropdown(
					[
						{
							label: 'CONFIG_HUB.REMOVE',
							slptIconName: 'edit',
							clickHandle: this.removeRow.bind(this),
							disabled: this.loading
						}
					],
					'',
					180,
					Alignment.RightCenter
				)
			}
		];
	}

	/**
	 * Clean up when the instance is destroyed.
	 */
	ngOnDestroy(): void {
		this.objectMappingList$.next([]);
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
	}

	/**
	 * Handles overlay close.
	 */
	public handleDismiss(): void {
		this.onDismiss.emit();
	}

	/**
	 * Adds a new object entry
	 */
	public handleAddMapping(): void {
		const newRow = { ...this.emptyMappingModel, objectMappingId: `${new Date().getTime()}` };
		this.objectMappingList$.next([...this.objectMappingList$.value, newRow]);
	}

	/**
	 * Handles Save
	 */
	public handleSave(): void {
		this.gridApi.api.stopEditing(false);
		this.loading = true;
		this.configHubObjectMappingService
			.createObjectMappingsSourceOrg(this.selectedTenant, this.getMappingPayload())
			.pipe(take(1))
			.subscribe({
				next: ({ body }) => {
					this.onSave.emit(body.addedObjects);
					this.loading = false;
					this.handleDismiss();
					this.alertService.open(
						getObjectMappingSuccessAlertConfig(
							this.translateService,
							'CONFIG_HUB.OBJECT_MAPPINGS_HAS_BEEN_CREATED_SUCCESSFULLY'
						)
					);
				},
				error: () => {
					this.loading = false;
				}
			});
	}

	/**
	 * Preps payload to the appropriate format, removes mapping id
	 * @returns list without mapping id
	 */
	private getMappingPayload(): Array<ConfigHubObjectMapping> {
		return this.objectMappingList$.getValue().map(row => {
			const newRow = deepClone(row);
			delete newRow.objectMappingId;
			return newRow;
		});
	}

	/**
	 * Column Defs
	 */
	private getObjectMappingGridColumnDefs(): SlptColDef[] {
		return [
			{
				headerName: this.translateService.instant('CONFIG_HUB.OBJECT_TYPE'),
				field: 'objectType',
				sortable: true,
				resizable: true,
				editable: false,
				minWidth: 220,
				cellRenderer: DropdownCellComponent,
				cellRendererParams: {
					options$: of(this.objectTypes),
					placeholder: 'CONFIG_HUB.OBJECT_TYPE'
				}
			},
			{
				headerName: this.translateService.instant('CONFIG_HUB.JSON_PATH'),
				field: 'jsonPath',
				sortable: true,
				suppressSizeToFit: true,
				resizable: true,
				editable: true,
				cellRenderer: IconCellComponent,
				cellRendererParams: {
					iconName: IconCellIcons.pencil,
					useText: true
				}
			},
			{
				headerName: this.translateService.instant('CONFIG_HUB.ORIGINAL_VALUE'),
				field: 'sourceValue',
				sortable: true,
				suppressSizeToFit: true,
				resizable: true,
				editable: true,
				cellRenderer: IconCellComponent,
				cellRendererParams: {
					iconName: IconCellIcons.pencil,
					useText: true
				}
			},
			{
				headerName: this.translateService.instant('CONFIG_HUB.NEW_VALUE'),
				field: 'targetValue',
				sortable: true,
				suppressSizeToFit: true,
				resizable: true,
				editable: true,
				cellRenderer: IconCellComponent,
				cellRendererParams: {
					iconName: IconCellIcons.pencil,
					useText: true
				}
			}
		];
	}

	/**
	 * Removes row from grid
	 * @param node Row node
	 */
	private removeRow({ data }: RowNode<ConfigHubObjectMapping>): void {
		const { objectMappingId } = data;
		const currentList = this.objectMappingList$.getValue().filter(item => objectMappingId !== item.objectMappingId);
		this.objectMappingList$.next(currentList);
	}
}
