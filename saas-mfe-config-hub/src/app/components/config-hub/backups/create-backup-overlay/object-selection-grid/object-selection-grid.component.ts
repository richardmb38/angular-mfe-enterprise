/*
 * Copyright (C) 2023 Acme Technologies, Inc.  All rights reserved.
 */
import {
	ChangeDetectionStrategy,
	ChangeDetectorRef,
	Component,
	EventEmitter,
	HostListener,
	Input,
	OnDestroy,
	OnInit,
	Output,
	ViewChild
} from '@angular/core';

import { GridOptions, GridReadyEvent, RowSelectedEvent } from 'ag-grid-community';
import { Subject } from 'rxjs';

import {
	DataGridColumnsFactoryService,
	DataGridComponent,
	DataGridLoadingComponent,
	DataGridNoDataComponent,
	SlptColDef
} from '@acme-priv/armada-angular/src/acme/angular/components/grid';
import { TranslateService } from '@acme-priv/armada-angular/src/acme/angular/l10n/translation';

import { FeatureFlagService } from '@acme-priv/ui-common/src/acme/angular/util';

import { ConfigHubObjectNameRendererComponent } from './object-name-renderer/object-name-renderer.component';
import {
	ConfigHubBackupObjectType,
	IncludedNames,
	gridLoadingModel,
	gridNoDataModel
} from 'app/components/config-hub/shared/models';
import { FeatureFlags } from 'app/featureflags.enum';

/**
 * Configuration Hub Backup Object Selection Grid
 *
 * SHows a list of the available configuration objects to include in the backup.
 */
@Component({
	selector: 'app-config-hub-object-selection-grid',
	templateUrl: './object-selection-grid.component.html',
	styleUrls: ['./object-selection-grid.component.scss'],
	changeDetection: ChangeDetectionStrategy.OnPush
})
export class ConfigHubObjectSelectionGridComponent implements OnDestroy, OnInit {
	/**
	 * The list of objects that can be included in the backup
	 */
	@Input() backupObjectList: ConfigHubBackupObjectType[];

	/**
	 * A list of the selected object types
	 */
	@Input() selectedObjectTypes: string[] = [];

	/**
	 * A collection of object names to be included in a partial backup, organized by object type.
	 */
	@Input() objectOptions: Map<string, IncludedNames> = new Map<string, IncludedNames>();

	/**
	 * The event emitter for when the list of selected object types changes
	 */
	@Output() selectedObjectTypesChange: EventEmitter<string[]> = new EventEmitter<string[]>();

	/**
	 * Whether or not the PLT_UI_ADMIRAL_CONFIG_HUB_OBJECT_OPTIONS_DROPDOWN flag is enabled.
	 * TODO: Cleanup in https://acme.atlassian.net/browse/PLTCONFHUB-1039.
	 */
	public isObjectOptionsDropdownEnabled = this.featureFlagService.isEnabled(
		FeatureFlags.PLT_UI_ADMIRAL_CONFIG_HUB_OBJECT_OPTIONS_DROPDOWN
	);

	/**
	 * Column definitions for the Backup Summary grid.
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
		getRowId: ({ data }) => data.objectType,
		suppressMovableColumns: true,
		enableBrowserTooltips: true,
		suppressMultiSort: true,
		suppressColumnVirtualisation: true,
		suppressRowVirtualisation: true,
		domLayout: 'normal',
		components: {
			customLoadingOverlay: DataGridLoadingComponent,
			customNoRowsOverlay: DataGridNoDataComponent
		}
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
	 * An array of containing the backup summary objectBreakdown. Used to populate the grid.
	 */
	public rows: { objectType: string }[];

	/**
	 * Reference to the DataGridComponent.
	 */
	@ViewChild('slptGrid', { static: true })
	public slptGrid: DataGridComponent;

	/**
	 * Subject to unsubscribe on destroy.
	 */
	private unsubscribe$ = new Subject<void>();

	constructor(
		private changeDetectorRef: ChangeDetectorRef,
		private columnsService: DataGridColumnsFactoryService,
		private translateService: TranslateService,
		private featureFlagService: FeatureFlagService
	) {}

	/**
	 * Initializes component
	 */
	public ngOnInit(): void {
		this.updateColumnDefs();
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
	public onGridReady(event: GridReadyEvent): void {
		if (!this.gridApi) {
			this.gridApi = event;
		}

		this.updateGridRows();
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
	 * Handles the row selected event when the selection of any row is changed.
	 * @param event - The row selected event emitted by ag-grid.
	 */
	public onRowSelected(event: RowSelectedEvent): void {
		const rowValue = event.data.objectType;
		if (event.node.isSelected()) {
			this.selectedObjectTypes.push(rowValue);
		} else {
			this.selectedObjectTypes = this.selectedObjectTypes.filter(objectType => objectType !== rowValue);
		}

		this.selectedObjectTypesChange.emit(this.selectedObjectTypes);
	}

	/**
	 * sets column defs based on flag
	 */
	private updateColumnDefs(): void {
		this.columnDefs = [
			this.columnsService.createSelectColumn(),
			{
				headerName: this.translateService.instant('CONFIG_HUB.OBJECT_TYPE'),
				field: 'objectType',
				sortable: false,
				sort: 'asc',
				cellStyle: { 'font-weight': 'bold' }
			}
		];

		if (this.isObjectOptionsDropdownEnabled) {
			this.columnDefs.push({
				headerName: this.translateService.instant('CONFIG_HUB.OBJECTS_BY_NAME'),
				field: 'names',
				sortable: false,
				sort: 'asc',
				wrapText: false,
				autoHeight: true,
				cellRenderer: ConfigHubObjectNameRendererComponent,
				cellRendererParams: {
					objectOptions: this.objectOptions,
					updateObjectOptions: (objectType: string, names: IncludedNames) => {
						this.objectOptions.set(objectType, names);
					}
				}
			});
		}
	}

	/**
	 * Updates the grid rows with information from the backup summary.
	 */
	private updateGridRows(): void {
		if (!this.backupObjectList) {
			return;
		}

		this.rows = this.backupObjectList.map(({ objectType }) => ({ objectType }));

		this.changeDetectorRef.detectChanges();
	}
}
