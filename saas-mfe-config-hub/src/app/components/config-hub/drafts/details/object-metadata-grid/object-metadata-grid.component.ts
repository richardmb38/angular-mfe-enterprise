/*
 * Copyright (C) 2023 Acme Technologies, Inc.  All rights reserved.
 */
import { Component, HostListener, Input, ViewChild } from '@angular/core';

import { GridOptions, GridReadyEvent } from 'ag-grid-community';

import {
	CompositeDataGridComponent,
	DataGridLoadingComponent,
	DataGridNoDataComponent,
	SlptColDef
} from '@acme-priv/armada-angular/src/acme/angular/components/grid';
import { TranslateService } from '@acme-priv/armada-angular/src/acme/angular/l10n/translation';

import { ConfigHubModificationMetadata, gridNoDataModel } from 'app/components/config-hub/shared/models';
import { formatPropertyValue } from 'app/components/config-hub/shared/utils';

@Component({
	selector: 'app-config-hub-object-metadata-grid',
	templateUrl: './object-metadata-grid.component.html',
	styleUrls: ['./object-metadata-grid.component.scss']
})
export class ConfigHubObjectMetadataGridComponent {
	/**
	 * Array of applied metadata modifications
	 */
	@Input() public appliedModificationMetadata: Array<ConfigHubModificationMetadata> = [];

	/**
	 * Column definitions for the Object Metadata grid.
	 * TODO: Check why moving this to the model causes formatPropertyValue to fail cypress tests
	 */
	public columnDefs: SlptColDef[] = [
		{
			headerName: this.translateService.instant('CONFIG_HUB.MODIFICATION_TYPE'),
			field: 'modificationType',
			colId: 'modificationType',
			suppressSizeToFit: true,
			resizable: true,
			sortable: false,
			sort: 'asc',
			cellStyle: { 'font-weight': 'bold' }
		},
		{
			headerName: this.translateService.instant('CONFIG_HUB.ATTRIBUTE_PATH'),
			field: 'attributePath',
			colId: 'attributePath',
			suppressSizeToFit: true,
			resizable: true,
			sortable: false,
			cellRenderer: 'truncatedTextTooltipCell'
		},
		{
			headerName: this.translateService.instant('CONFIG_HUB.OLD_VALUE'),
			field: 'oldValue',
			colId: 'oldValue',
			sortable: false,
			suppressSizeToFit: true,
			resizable: true,
			valueGetter: ({ data }) => formatPropertyValue(data?.oldValue),
			cellRenderer: 'truncatedTextTooltipCell'
		},
		{
			headerName: this.translateService.instant('CONFIG_HUB.NEW_VALUE'),
			field: 'newValue',
			colId: 'newValue',
			sortable: false,
			suppressSizeToFit: true,
			resizable: true,
			valueGetter: ({ data }) => formatPropertyValue(data?.newValue),
			cellRenderer: 'truncatedTextTooltipCell'
		}
	];

	/**
	 * The grid api.
	 */
	public gridApi: GridReadyEvent;

	/**
	 * The options for the grid.
	 */
	public gridOptions: GridOptions = {
		suppressMovableColumns: true,
		enableBrowserTooltips: true,
		suppressMultiSort: true,
		suppressColumnVirtualisation: true,
		colResizeDefault: 'shift',
		domLayout: 'normal',
		components: {
			customLoadingOverlay: DataGridLoadingComponent,
			customNoRowsOverlay: DataGridNoDataComponent
		}
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

	constructor(private translateService: TranslateService) {}

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
	 * Handles the gridReady event when the grid loads and initiates updating rows.
	 * @param event - The grid ready event emitted by ag-grid.
	 */
	public onGridReady(event: GridReadyEvent): void {
		if (!this.gridApi) {
			this.gridApi = event;
		}
	}
}
