/*
 * Copyright (C) 2023 Acme Technologies, Inc.  All rights reserved.
 */
import { Component, HostListener, Input, OnDestroy, ViewChild } from '@angular/core';

import { GridOptions, GridReadyEvent } from 'ag-grid-community';
import { Subject } from 'rxjs';

import {
	CompositeDataGridComponent,
	DataGridLoadingComponent,
	DataGridNoDataComponent,
	DataGridTruncatedTextTooltipCellComponent,
	SlptColDef
} from '@acme-priv/armada-angular/src/acme/angular/components/grid';
import { TranslateService } from '@acme-priv/armada-angular/src/acme/angular/l10n/translation';

import { gridNoDataModel } from 'app/components/config-hub/shared/models';
import { formatPropertyValue } from 'app/components/config-hub/shared/utils';
import { Operation } from 'fast-json-patch';

@Component({
	selector: 'app-config-hub-object-changelog-grid',
	templateUrl: './object-changelog-grid.component.html',
	styleUrls: ['./object-changelog-grid.component.scss']
})
export class ConfigHubObjectChangelogGridComponent implements OnDestroy {
	/**
	 * Column definitions for the Object Mapping grid.
	 */
	public columnDefs: SlptColDef[] = [
		{
			headerName: this.translateService.instant('CONFIG_HUB.CHANGE_TYPE'),
			field: 'op',
			colId: 'op',
			suppressSizeToFit: true,
			resizable: true,
			sortable: false,
			sort: 'asc',
			valueFormatter: params => params.value?.toUpperCase(),
			cellStyle: { 'font-weight': 'bold' }
		},
		{
			headerName: this.translateService.instant('CONFIG_HUB.JSON_PATH'),
			field: 'path',
			colId: 'path',
			suppressSizeToFit: true,
			resizable: true,
			sortable: false,
			valueGetter: ({ data }) => this.jsonPatchToJsonPath(data.path),
			cellRenderer: DataGridTruncatedTextTooltipCellComponent
		},
		{
			headerName: this.translateService.instant('CONFIG_HUB.LIVE_VALUE'),
			field: 'oldValue',
			colId: 'oldValue',
			sortable: false,
			suppressSizeToFit: true,
			resizable: true,
			valueGetter: ({ data }) => formatPropertyValue(data.oldValue),
			cellRenderer: DataGridTruncatedTextTooltipCellComponent
		},
		{
			headerName: this.translateService.instant('CONFIG_HUB.BACKUP_VALUE'),
			field: 'value',
			colId: 'value',
			sortable: false,
			suppressSizeToFit: true,
			resizable: true,
			valueGetter: ({ data }) => formatPropertyValue(data.value),
			cellRenderer: DataGridTruncatedTextTooltipCellComponent
		}
	];

	/**
	 * The list of object changes
	 */
	@Input() public objectChangelog: Array<Operation> = [];

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

	/**
	 * Subject to unsubscribe on destroy.
	 */
	private unsubscribe$ = new Subject<void>();

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
			this.gridApi = event;
		}
	}

	/**
	 * Formats a Json PATCH path as a JsonPath path
	 * @param path - the path to the object attribute in Json PATCH format
	 */
	private jsonPatchToJsonPath(path: string): string {
		const pathArray: Array<string> = path.split('/');
		const numberMatch = new RegExp('[0-9]+', 'i');

		return pathArray
			.filter(item => item.length > 0)
			.reduce((accumulated, currentItem) => {
				if (numberMatch.test(currentItem)) {
					return accumulated + '[' + currentItem + ']';
				} else {
					return accumulated + '.' + currentItem;
				}
			}, '$');
	}
}
