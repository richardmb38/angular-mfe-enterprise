/* eslint-disable @typescript-eslint/no-unused-vars */

/*
 * Copyright (C) 2023 Acme Technologies, Inc.  All rights reserved.
 */
import { DatePipe } from '@angular/common';
import { Component, OnInit, ViewChild } from '@angular/core';

import { Store } from '@ngrx/store';
import { GridOptions, GridReadyEvent, RowNode } from 'ag-grid-community';

import { AlertService } from '@acme-priv/armada-angular/src/acme/angular/components/alert';
import {
	DataGridColumnsFactoryService,
	DataGridComponent,
	SlptColDef
} from '@acme-priv/armada-angular/src/acme/angular/components/grid';
import { ModalService } from '@acme-priv/armada-angular/src/acme/angular/components/modal';
import { TranslateService } from '@acme-priv/armada-angular/src/acme/angular/l10n/translation';

import { UserRightsService } from '@acme-priv/ui-common/src/acme/angular/util/user-rights';

import { tenantConnectionsApiActions, tenantConnectionsPageActions } from './store/actions';
import { fromTenantConnections } from './store/selectors';

import {
	ConfigHubTenantConnection,
	getDeleteConnectionModalConfig,
	getDeleteConnectionSuccessAlertConfig,
	getTenantConnectionGridColumnDefs,
	gridLoadingModel,
	gridNoDataModel
} from '../shared/models';
import { ConfigHubRoles } from '../shared/models/config-hub.model';
import { ConfigHubTenantConnectionsService } from '../shared/services';

@Component({
	selector: 'app-tenant-connections-log',
	templateUrl: './tenant-connections.component.html',
	styleUrls: ['./tenant-connections.component.scss']
})
export class ConfigHubTenantConnectionsComponent implements OnInit {
	/**
	 * Column definitions for the TenantConnections grid.
	 */
	public columnDefs: SlptColDef[];

	/**
	 * The connection creation is in progress
	 */
	public isCreateTenantConnectionModalOpen = false;

	/**
	 * The grid options
	 */
	public gridOptions: GridOptions;

	/**
	 * The model for when the grid has no data
	 */
	public noDataModel = gridNoDataModel('CONFIG_HUB.CREATE_A_TENANT_CONNECTION_TO_DEPLOY_BACKUPS');

	/**
	 * Internal grid loading mask model - disabled by default.
	 */
	public loadingModel = gridLoadingModel;

	/**
	 * A reference to the grid component
	 */
	@ViewChild('slptGrid', { static: true })
	public slptGrid: DataGridComponent;

	/**
	 * Grid API
	 */
	public gridApi: GridReadyEvent;

	/**
	 * The list of tenant connections for the current tenant
	 */
	public tenantConnections$ = this.store.select(fromTenantConnections.getTenantConnectionsSelectors().selectAll);

	/**
	 * Whether the tenant connection list is loading
	 */
	public loading$ = this.store.select(fromTenantConnections.getTenantConnectionsSelectors().selectIsLoading);

	/**
	 * Local loading indicator for the component
	 */
	public loading = false;

	/**
	 * Defines if user can see create button
	 */
	public canUserCreateConnection$: Promise<Boolean>;

	/**
	 * Defines if user can see delete connection
	 */
	public canUserDeleteConnection$: Promise<Boolean>;

	constructor(
		private columnsService: DataGridColumnsFactoryService,
		private translateService: TranslateService,
		private store: Store,
		private configHubTenantConnectionsService: ConfigHubTenantConnectionsService,
		private datePipe: DatePipe,
		private modalService: ModalService,
		private alertService: AlertService,
		private userRightsService: UserRightsService
	) {
		this.canUserCreateConnection$ = this.userRightsService.hasRight(ConfigHubRoles.CONNECTION_CREATE);
		this.canUserDeleteConnection$ = this.userRightsService.hasRight(ConfigHubRoles.CONNECTION_DELETE);
	}

	/**
	 * on mounting the component it should load the grid with the right columns
	 */
	public ngOnInit(): void {
		this.store.dispatch(tenantConnectionsPageActions.tenantConnectionsPageEnter());
		this.initializeGridOptions();
	}

	/**
	 * Getting the right column definitions
	 */
	private async initializeGridOptions(): Promise<void> {
		this.canUserDeleteConnection$.then(hasRight => {
			const actionsColumn = {
				colId: 'delete',
				...this.columnsService.createActionsColumnWithDropdown(
					[
						{
							label: 'CONFIG_HUB.DELETE',
							slptIconName: 'delete',
							preventFocusedMenuOnClick: true,
							clickHandle: ({ data }: RowNode<ConfigHubTenantConnection>) => {
								this.handleDeleteTenantConnection(data);
							},
							disabled: this.loading
						}
					],
					this.translateService.instant('CONFIG_HUB.ACTIONS'),
					120
				),
				headerClass: 'tenant-connections-grid__actions-header',
				cellStyle: {
					marginTop: '-2px'
				}
			};

			const baseColumnDefs = getTenantConnectionGridColumnDefs(this.translateService, this.datePipe);
			this.columnDefs = hasRight ? [...baseColumnDefs, actionsColumn] : baseColumnDefs;
		});
	}

	/**
	 * Deletes a tenant connection and updates the grid by using reducer.
	 */
	handleDeleteTenantConnection({ sourceTenant }: ConfigHubTenantConnection): void {
		this.modalService.open(getDeleteConnectionModalConfig(sourceTenant)).then(confirm => {
			if (!confirm) {
				return;
			}
			this.loading = true;
			this.configHubTenantConnectionsService.deleteTenantConnection(sourceTenant).subscribe({
				next: () => {
					this.store.dispatch(
						tenantConnectionsApiActions.tenantConnectionDeleteSuccess({ tenantConnection: sourceTenant })
					);
					this.alertService.open(
						getDeleteConnectionSuccessAlertConfig(
							sourceTenant,
							this.translateService,
							'CONFIG_HUB.SUCCESS_TENANT_CONNECTION_HAS_BEEN_DELETED'
						)
					);
					this.loading = false;
				},
				error: error => {
					this.store.dispatch(
						tenantConnectionsApiActions.tenantConnectionDeleteFailure({ errorMessage: error })
					);
					this.loading = false;
				}
			});
		});
	}

	/**
	 * Handles the gridReady event when the grid loads and initiates loading TenantConnections.
	 * @param event - The grid ready event emitted by ag-grid.
	 */
	public onGridReady(event?: GridReadyEvent): void {
		if (!this.gridApi) {
			this.gridApi = event;
		}
	}

	/**
	 * Opens the Create Tenant Connection Modal when Connection
	 * button is clicked.
	 */
	public handleCreateTenantConnectionClicked(): void {
		this.isCreateTenantConnectionModalOpen = true;
	}

	/**
	 * Closes the Create Tenant Modal and initiates a Tenant job if a name is supplied.
	 */
	public handleCreateTenantConnectionModalDismiss(tenantConnection?: ConfigHubTenantConnection): void {
		this.isCreateTenantConnectionModalOpen = false;

		if (tenantConnection) {
			this.store.dispatch(tenantConnectionsApiActions.tenantConnectionsLoadList());
		}
	}
}
