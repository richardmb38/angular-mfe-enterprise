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

import { GridOptions, GridReadyEvent } from 'ag-grid-community';
import { Subject } from 'rxjs';

import {
	DataGridComponent,
	DataGridLoadingComponent,
	DataGridNoDataComponent,
	DataGridTruncatedTextTooltipCellComponent,
	SlptColDef
} from '@acme-priv/armada-angular/src/acme/angular/components/grid';
import { TranslateService } from '@acme-priv/armada-angular/src/acme/angular/l10n/translation';

import { FeatureFlagService } from '@acme-priv/ui-common/src/acme/angular/util';

import { ConfigHubBackupSummary, gridLoadingModel, gridNoDataModel } from '../../../shared/models';
import { ConfigHubObjectNameRendererComponent } from '../../create-backup-overlay/object-selection-grid/object-name-renderer/object-name-renderer.component';
import { FeatureFlags } from 'app/featureflags.enum';

/**
 * Configuration Hub Backup Summary Grid
 *
 * Displays details of the selected backup.
 */
@Component({
	selector: 'app-config-hub-backup-summary-grid',
	templateUrl: './backup-summary-grid.component.html',
	styleUrls: ['./backup-summary-grid.component.scss'],
	changeDetection: ChangeDetectionStrategy.OnPush
})
export class ConfigHubBackupSummaryGridComponent implements OnDestroy {
	/**
	 * Whether or not the PLT_UI_ADMIRAL_CONFIG_HUB_OBJECT_OPTIONS_DROPDOWN flag is enabled.
	 * TODO: Cleanup in https://acme.atlassian.net/browse/PLTCONFHUB-1039.
	 */
	public isObjectOptionsDropdownEnabled = this.featureFlagService.isEnabled(
		FeatureFlags.PLT_UI_ADMIRAL_CONFIG_HUB_OBJECT_OPTIONS_DROPDOWN
	);

	/**
	 * The backup job summary.
	 */
	@Input() backupSummary: ConfigHubBackupSummary;

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
		getRowId: data => data?.data?.objectType,
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
		onSortChanged: this.onGridSortChanged.bind(this)
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
	public rows: { objectType: string; totalCount: number }[];

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
		private translateService: TranslateService,
		private featureFlagService: FeatureFlagService
	) {}

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
	 * Listen to the grid sort event, in order to refresh the icon displayed for sorting.
	 */
	private onGridSortChanged() {
		this.changeDetectorRef.detectChanges();
	}

	/**
	 * Set the column definitions
	 */
	private setColumnDefs() {
		this.columnDefs = [
			{
				headerName: this.translateService.instant('CONFIG_HUB.OBJECT_TYPE'),
				field: 'objectType',
				sortable: true,
				sort: 'asc',
				cellStyle: { 'font-weight': 'bold' },
				cellRenderer: DataGridTruncatedTextTooltipCellComponent
			},
			{
				headerName: this.translateService.instant('CONFIG_HUB.COUNT'),
				field: 'totalCount',
				sortable: true,
				suppressSizeToFit: true,
				width: 120,
				maxWidth: 120
			}
		];

		if (this.isObjectOptionsDropdownEnabled) {
			this.columnDefs.push({
				headerName: this.translateService.instant('CONFIG_HUB.OBJECTS_BY_NAME'),
				field: 'names',
				sortable: false,
				wrapText: false,
				autoHeight: true,
				cellRenderer: ConfigHubObjectNameRendererComponent,
				cellRendererParams: {
					isReadOnly: true,
					objectOptions: this.backupSummary?.backupOptions?.objectOptions
				}
			});
		}
	}

	/**
	 * Updates the grid rows with information from the backup summary.
	 */
	private updateGridRows(): void {
		if (!this.backupSummary) {
			return;
		}

		this.setColumnDefs();

		this.rows = Object.entries(this.backupSummary.objectBreakdown).map(entry => ({
			objectType: entry[0],
			totalCount: entry[1]
		}));
		this.changeDetectorRef.detectChanges();
	}
}
