/*
 * Copyright (C) 2023 Acme Technologies, Inc.  All rights reserved.
 */
import { Component, EventEmitter, HostListener, Input, OnDestroy, OnInit, Output, ViewChild } from '@angular/core';

import { CellValueChangedEvent, GridOptions, GridReadyEvent, RowNode } from 'ag-grid-community';
import { Subject, takeUntil } from 'rxjs';

import { AlertService } from '@acme-priv/armada-angular/src/acme/angular/components/alert';
import {
	CompositeDataGridComponent,
	DataGridColumnsFactoryService,
	DataGridLoadingComponent,
	DataGridNoDataComponent,
	SlptColDef
} from '@acme-priv/armada-angular/src/acme/angular/components/grid';
import { ModalService } from '@acme-priv/armada-angular/src/acme/angular/components/modal';
import { TranslateService } from '@acme-priv/armada-angular/src/acme/angular/l10n/translation';
import { Alignment } from '@acme-priv/armada-angular/src/acme/theme/typescript';

import { UserRightsService } from '@acme-priv/ui-common/src/acme/angular/util/user-rights';

import {
	ConfigHubObjectMapping,
	ConfigHubPatchOperations,
	ObjectMappingPatchDictionary,
	ObjectMappingsValidFields,
	getDeleteObjectMappingModalConfig,
	getDeleteObjectMappingSuccessAlertConfig,
	getObjectMappingGridColumnDefs,
	getObjectMappingSuccessAlertConfig,
	gridNoDataModel
} from '../../shared/models';
import { ConfigHubRoles } from '../../shared/models/config-hub.model';
import { ConfigHubObjectMappingService } from '../../shared/services/object-mappings/object-mappings.service';

@Component({
	selector: 'app-config-hub-object-mapping-grid',
	templateUrl: './object-mapping-grid.component.html',
	styleUrls: ['./object-mapping-grid.component.scss']
})
export class ConfigHubObjectMappingGridComponent implements OnInit, OnDestroy {
	/**
	 * Connections list input
	 */
	@Input() public objectMappingList: Array<ConfigHubObjectMapping>;

	/**
	 * Connections list input
	 */
	@Output() public objectMappingListChange = new EventEmitter<Array<ConfigHubObjectMapping>>();

	/**
	 * Currently selected tenant
	 */
	@Input() public selectedTenant: string;

	/**
	 * Column definitions for the Object Mapping grid.
	 */
	public columnDefs: SlptColDef[];

	/**
	 * Control for the toggle cell in the grid
	 */
	public toggleControl = new Subject<{ target: string; value: boolean }>();

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
		singleClickEdit: true,
		colResizeDefault: 'shift',
		domLayout: 'normal',
		components: {
			customLoadingOverlay: DataGridLoadingComponent,
			customNoRowsOverlay: DataGridNoDataComponent
		},
		onCellValueChanged: ({ data, newValue, oldValue }: CellValueChangedEvent) => {
			this.handleBulkUpdateObjectMapping(
				data.objectMappingId,
				newValue,
				oldValue,
				ObjectMappingsValidFields.TARGET_VALUE
			);
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
	 * Loading indicator
	 */
	public loading = false;

	/**
	 * Check wether user can delete object mappings
	 */
	private canUserUpdateObjectMapping$: Promise<boolean>;

	/**
	 * Check wether user can delete object mappings
	 */
	private canUserDeleteObjectMapping$: Promise<boolean>;

	/**
	 * Subject to unsubscribe on destroy.
	 */
	private unsubscribe$ = new Subject<void>();

	constructor(
		private translateService: TranslateService,
		private columnsService: DataGridColumnsFactoryService,
		private modalService: ModalService,
		private configHubObjectMappingService: ConfigHubObjectMappingService,
		private alertService: AlertService,
		private userRightsService: UserRightsService
	) {
		this.canUserUpdateObjectMapping$ = this.userRightsService.hasRight(ConfigHubRoles.OBJECT_MAPPING_UPDATE);
		this.canUserDeleteObjectMapping$ = this.userRightsService.hasRight(ConfigHubRoles.OBJECT_MAPPING_DELETE);
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
	 * Initialize component
	 */
	async ngOnInit(): Promise<void> {
		this.columnDefs = [
			...getObjectMappingGridColumnDefs(
				this.translateService,
				this.toggleControl,
				await this.canUserUpdateObjectMapping$
			)
		];

		const actionsColumn = this.createActionsColumn();
		if (await this.canUserDeleteObjectMapping$) {
			this.columnDefs.push(actionsColumn);
		}
	}

	/**
	 * Returns the actions column
	 */
	private createActionsColumn(): SlptColDef {
		return {
			...this.columnsService.createActionsColumnWithDropdown(
				[
					{
						label: 'CONFIG_HUB.DELETE',
						slptIconName: 'edit',
						clickHandle: ({ data }: RowNode<ConfigHubObjectMapping>) => {
							this.handleDeleteObjectMapping(data);
						},
						disabled: this.loading
					}
				],
				this.translateService.instant('CONFIG_HUB.ACTIONS'),
				180,
				Alignment.RightCenter
			),
			headerClass: 'object-mapping-grid__actions-header'
		};
	}

	/**
	 * Handle delete action for object connection
	 * @param objectMappingList - The object selected for deletion
	 */
	public handleDeleteObjectMapping(objectMapping: ConfigHubObjectMapping): void {
		this.modalService.open(getDeleteObjectMappingModalConfig(objectMapping, this.selectedTenant)).then(confirm => {
			if (!confirm) {
				return;
			}
			this.loading = true;
			this.configHubObjectMappingService
				.deleteObjectMapping(this.selectedTenant, objectMapping.objectMappingId)
				.subscribe({
					next: () => {
						this.objectMappingList = this.objectMappingList.filter(
							({ objectMappingId }) => objectMappingId !== objectMapping.objectMappingId
						);
						this.objectMappingListChange.emit(this.objectMappingList);

						this.alertService.open(
							getDeleteObjectMappingSuccessAlertConfig(
								objectMapping,
								this.translateService,
								'CONFIG_HUB.OBJECT_MAPPING_HAS_BEEN_DELETED'
							)
						);
						this.loading = false;
					},
					error: () => {
						this.loading = false;
					}
				});
		});
	}

	/**
	 * Initialize the subscription to the toggle cells
	 */
	private initToggleSubscription(): void {
		this.toggleControl.pipe(takeUntil(this.unsubscribe$)).subscribe(({ value, target }) => {
			this.handleBulkUpdateObjectMapping(target, value, !value, ObjectMappingsValidFields.ENABLED);
		});
	}

	/**
	 * Handle when an object mapping updates on data change
	 * @param objectMappingId - The id of the object mapping that was changed
	 * @param replaceValue - The value to be replaced
	 * @param oldValue - The value to be reverted on error
	 * @param field - to be updated
	 */
	private handleBulkUpdateObjectMapping(
		objectMappingId: string,
		replaceValue: string | boolean,
		oldValue: string | boolean,
		field: string
	): void {
		const index = this.objectMappingList.findIndex(item => item.objectMappingId === objectMappingId);
		this.updateFieldValue(index, field, replaceValue);

		this.configHubObjectMappingService
			.bulkPatchObjectMappings(
				this.selectedTenant,
				this.getPatchOperationPayload(objectMappingId, field, replaceValue)
			)
			.subscribe({
				next: () => {
					this.alertService.open(
						getObjectMappingSuccessAlertConfig(
							this.translateService,
							'CONFIG_HUB.OBJECT_MAPPINGS_HAS_BEEN_UPDATED_SUCCESSFULLY'
						)
					);
				},
				error: () => {
					this.updateFieldValue(index, field, oldValue);
				}
			});
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
			this.initToggleSubscription();
		}
	}

	/**
	 * Updates grid field value and emits
	 * @param {number} index row to be updated
	 * @param {string} field to be updated
	 * @param {string | boolean} value to be replaced
	 */
	private updateFieldValue(index: number, field: string, value: string | boolean): void {
		this.objectMappingList[index][field] = value;
		this.gridApi.api.applyTransaction({
			update: this.objectMappingList
		});
		this.objectMappingListChange.emit(this.objectMappingList);
	}

	/**
	 * Gets formatted payload
	 * @param {string} objectMappingId object Id
	 * @param {string} field to be updated
	 * @param {string | boolean} replaceValue to be replaced
	 */
	private getPatchOperationPayload(
		objectMappingId: string,
		field: string,
		replaceValue: string | boolean
	): ObjectMappingPatchDictionary {
		return {
			[objectMappingId]: [
				{
					op: ConfigHubPatchOperations.REPLACE,
					path: `/${field}`,
					value: replaceValue
				}
			]
		};
	}
}
