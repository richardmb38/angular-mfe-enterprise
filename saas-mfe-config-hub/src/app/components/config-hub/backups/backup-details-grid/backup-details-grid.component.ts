/*
 * Copyright (C) 2023 Acme Technologies, Inc.  All rights reserved.
 */
import { ChangeDetectorRef, Component, HostListener, Input, ViewChild } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

import { GridOptions, GridReadyEvent, RowNode } from 'ag-grid-community';
import { take } from 'rxjs';

import {
	CompositeDataGridComponent,
	DataGridColumnsFactoryService,
	DataGridLoadingComponent,
	DataGridNoDataComponent,
	DataGridTruncatedTextTooltipCellComponent,
	SlptColDef
} from '@acme-priv/armada-angular/src/acme/angular/components/grid';
import { TranslateService } from '@acme-priv/armada-angular/src/acme/angular/l10n/translation';

import {
	CONFIG_HUB_DEFAULT_PAGE_SIZE,
	CONFIG_HUB_PAGE_SIZE_OPTIONS,
	ObjectDetails,
	gridNoDataModel
} from '../../shared/models';
import { ConfigHubBackupsApiService } from '../../shared/services';
import { BackupDetailsSelectedObjectType } from '../backup-details/backup-details.model';

@Component({
	selector: 'app-config-hub-backup-details-grid',
	templateUrl: './backup-details-grid.component.html',
	styleUrls: ['./backup-details-grid.component.scss']
})
export class ConfigHubBackupDetailsGridComponent {
	/**
	 * Input fo current object selection
	 * @param objectType Selected object type
	 */
	@Input() public set selectedObjectType(selectedObject: BackupDetailsSelectedObjectType) {
		if (selectedObject) {
			this.cleanup();
			this._objectType = selectedObject.type;
			this._totalItems = selectedObject.totalCount;
			this.totalPages = Math.ceil(this.totalItems / this.pageSize);
			this.loadObjectDetails();
		}
	}

	/**
	 * Object type getter
	 */
	public get objectType(): string {
		return this._objectType;
	}

	/**
	 * Total items getter
	 */
	public get totalItems(): number {
		return this._totalItems || 0;
	}

	/**
	 * The list of objects
	 */
	public objectList: Array<ObjectDetails>;

	/**
	 * Next token
	 */
	public lastEvaluatedKey: string;

	/**
	 * Current Job Id
	 */
	public jobId: string;

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
	 * Column definitions for the Backup Details grid.
	 */
	public columnDefs: SlptColDef[] = [
		{
			headerName: this.translateService.instant('CONFIG_HUB.NAME'),
			field: 'objectName',
			colId: 'name',
			suppressSizeToFit: true,
			resizable: true,
			sortable: false,
			sort: 'asc',
			cellRenderer: DataGridTruncatedTextTooltipCellComponent
		},
		{
			headerName: this.translateService.instant('CONFIG_HUB.ID'),
			field: 'objectId',
			colId: 'id',
			suppressSizeToFit: true,
			resizable: true,
			sortable: false,
			cellRenderer: DataGridTruncatedTextTooltipCellComponent
		},
		{
			...this.columnService.createActionsColumnWithDropdown(
				[
					{
						label: 'CONFIG_HUB.VIEW',
						clickHandle: ({ data }: RowNode<ObjectDetails>) => this.viewObjectDetails(data),
						slptIconName: 'edit'
					}
				],
				this.translateService.instant('CONFIG_HUB.ACTIONS'),
				180
			),
			headerClass: 'backup-details-grid__header--align-center'
		}
	];

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
	 * Loading Indicator
	 */
	public loading = false;

	/**
	 * Page Size Indicator
	 */
	public pageSize = CONFIG_HUB_DEFAULT_PAGE_SIZE;

	/**
	 * Available page sized
	 */
	public pageSizeOptions = CONFIG_HUB_PAGE_SIZE_OPTIONS;

	/**
	 * Currently selected page
	 */
	public currentPage = 1;

	/**
	 * Selected object to view details
	 */
	public selectedObject: string | null;

	/**
	 * Selected object name
	 */
	public selectedObjectName: string | null;

	/**
	 * Total number of pages
	 */
	public totalPages: number;

	/**
	 * Search query for the  grid search bar
	 */
	public searchQuery: string;

	/**
	 * Object type
	 */
	private _objectType: string;

	/**
	 * Total items
	 */
	private _totalItems: number;

	constructor(
		private translateService: TranslateService,
		private columnService: DataGridColumnsFactoryService,
		private route: ActivatedRoute,
		private configHubBackupsApiService: ConfigHubBackupsApiService,
		private changeDetectorRef: ChangeDetectorRef
	) {
		this.jobId = this.route.snapshot.paramMap.get('id');
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
	 * Handles the gridReady event when the grid loads and initiates updating rows.
	 * @param event - The grid ready event emitted by ag-grid.
	 */
	public onGridReady(event?: GridReadyEvent): void {
		if (!this.gridApi) {
			this.gridApi = event;
		}
	}

	/**
	 * Cleanup
	 */
	private cleanup(): void {
		this.lastEvaluatedKey = null;
		this.searchQuery = '';
		this.currentPage = 1;
	}

	/**
	 * Loads object details by object type
	 */
	private loadObjectDetails(): void {
		this.loading = true;
		this.configHubBackupsApiService
			.getObjectsByType(
				this.jobId,
				this.objectType,
				this.lastEvaluatedKey,
				this.pageSize,
				this.getOffset(),
				this.searchQuery
			)
			.pipe(take(1))
			.subscribe(data => {
				this.objectList = data.items;
				if (data.nextToken) {
					this.lastEvaluatedKey = data.nextToken;
				} else {
					this.lastEvaluatedKey = null;
				}
				this.loading = false;
			});
	}

	/**
	 * Calculate offsets
	 */
	private getOffset(): number {
		const calculatedOffset = this.pageSize * (this.currentPage - 1);
		return calculatedOffset > this.totalItems ? this.totalItems : calculatedOffset;
	}

	/**
	 * Format the value of a property un the changelog
	 */
	private viewObjectDetails(objectDetails: ObjectDetails): void {
		this.selectedObject = objectDetails.object as unknown as string;
		this.selectedObjectName = objectDetails.objectName;
		// To avoid ExpressionChangedAfterItHasBeenCheckedError
		this.changeDetectorRef.detectChanges();
	}

	/**
	 * Handle the close scenario for the details overlay
	 */
	public handleOverlayClose(): void {
		this.selectedObject = null;
	}

	/**
	 * Handle page size changed
	 * @param pageSize Number of items to show at the time
	 */
	public handlePageSizeChanged(pageSize: number): void {
		this.pageSize = pageSize;
		this.currentPage = 1;
		this.lastEvaluatedKey = null;
		this.totalPages = Math.ceil(this.totalItems / pageSize);
		this.loadObjectDetails();
	}

	/**
	 * Handle page size
	 * @param pageNumber At what page we are at
	 */
	public handlePageChanged(pageNumber: number): void {
		this.currentPage = pageNumber;
		this.loadObjectDetails();
	}

	/**
	 * Handle search input change
	 * @param searchQuery Query to search for
	 */
	public handleSearchInputChange(searchQuery: string): void {
		this.searchQuery = searchQuery;
		this.lastEvaluatedKey = null;
		this.currentPage = 1;
		this.loadObjectDetails();
	}
}
