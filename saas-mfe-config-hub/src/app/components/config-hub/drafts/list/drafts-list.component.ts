/*
 * Copyright (C) 2023 Acme Technologies, Inc.  All rights reserved.
 */
import { DatePipe } from '@angular/common';
import { ChangeDetectionStrategy, ChangeDetectorRef, Component, HostListener, OnInit } from '@angular/core';
import { Router } from '@angular/router';

import { CellClickedEvent, GridOptions, GridReadyEvent, RowNode } from 'ag-grid-community';
import { take } from 'rxjs';

import { AlertService } from '@acme-priv/armada-angular/src/acme/angular/components/alert';
import {
	DataGridActionsMenuDropdownModel,
	DataGridColumnsFactoryService,
	SlptColDef
} from '@acme-priv/armada-angular/src/acme/angular/components/grid';
import { ModalService } from '@acme-priv/armada-angular/src/acme/angular/components/modal';
import { TranslateService } from '@acme-priv/armada-angular/src/acme/angular/l10n/translation';

import { ApiListResponse } from '@acme-priv/ui-common/src/acme/angular/api';
import { FeatureFlagService } from '@acme-priv/ui-common/src/acme/angular/util';
import { UserRightsService } from '@acme-priv/ui-common/src/acme/angular/util/user-rights';

import { FeatureFlags } from '../../../../featureflags.enum';
import { getDeleteBackupSuccessAlertConfig, jobsGridOptions } from '../../backups/backup-list.model';
import { CONFIG_HUB_URL, ConfigHubChildRoutes } from '../../config-hub.model';
import {
	ConfigHubApprovalStatus,
	ConfigHubDraftJob,
	ConfigHubJobStatus,
	GRID_ACTION_COLUMN_ID,
	gridLoadingModel,
	gridNoDataModel
} from '../../shared/models';
import { ConfigHubRoles } from '../../shared/models/config-hub.model';
import { ConfigHubDraftsApiService } from '../../shared/services';
import { ApprovalStatusTranslations } from '../details/draft-details.model';
import { getDeleteDraftModalConfig, getJobsGridColumnDefs } from './drafts-list.model';

@Component({
	selector: 'app-config-hub-drafts-list',
	templateUrl: './drafts-list.component.html',
	styleUrls: ['./drafts-list.component.scss'],
	changeDetection: ChangeDetectionStrategy.OnPush
})
export class ConfigHubDraftsListComponent implements OnInit {
	/**
	 * Column definitions for the Backups grid.
	 */
	public columnDefs: SlptColDef[];

	/**
	 * The grid api.
	 */
	public gridApi: GridReadyEvent;

	/**
	 * The options for the grid.
	 */
	public gridOptions: GridOptions = { ...jobsGridOptions, onCellClicked: this.handleCellClicked.bind(this) };

	/**
	 * Model containing the empty state component when the grid has no data.
	 */
	public noDataModel = gridNoDataModel();

	/**
	 * Internal grid loading mask model - disabled by default.
	 */
	public loadingModel = gridLoadingModel;

	/**
	 * Whether the grid is currently loading new data.
	 */
	public loading = true;

	/**
	 * An array of drafts used to populate the grid.
	 */
	public rows: ConfigHubDraftJob[] = [];

	/**
	 * Number of total drafts.
	 */
	public totalDrafts!: number;

	/**
	 * Determines wether to check approval status
	 *
	 */
	private readonly isConfigHubApprovalStatusEnabled = this.featureFlagService.isEnabled(
		FeatureFlags.PLT_UI_ADMIRAL_CONFIG_HUB_DRAFTS_APPROVAL
	);

	constructor(
		private alertService: AlertService,
		private translateService: TranslateService,
		private datePipe: DatePipe,
		private columnsService: DataGridColumnsFactoryService,
		private configHubDraftService: ConfigHubDraftsApiService,
		private changeDetectorRef: ChangeDetectorRef,
		private modalService: ModalService,
		private router: Router,
		private userRightsService: UserRightsService,
		private featureFlagService: FeatureFlagService
	) {}

	/**
	 * Initializes component properties
	 */
	public async ngOnInit(): Promise<void> {
		this.initializeGridOptions();
	}

	/**
	 * Handle cell clicked.
	 * @param args - Arguments passed from cell click event.
	 */
	private handleCellClicked(args: CellClickedEvent<ConfigHubDraftJob>): void {
		const colId = args.column.getColId();
		const notClickableElements = [GRID_ACTION_COLUMN_ID];
		if (!notClickableElements.includes(colId)) {
			this.handleViewEditDraft(args.data);
		}
	}

	/**
	 * Asks for confirmation and deletes draft.
	 */
	private handleDeleteDraft({ name, jobId }: ConfigHubDraftJob): void {
		this.destroyExistingAlerts();
		this.modalService.open(getDeleteDraftModalConfig(name)).then(confirm => {
			if (!confirm) {
				return;
			}
			this.deleteDraft(name, jobId);
		});
	}

	/**
	 * Handles delete request to API, if success shows confirmation
	 * @param jobId Draft id to delete
	 */
	private deleteDraft(name: string, jobId: string): void {
		this.loading = true;
		this.configHubDraftService
			.delete(jobId)
			.pipe(take(1))
			.subscribe({
				next: () => {
					this.alertService.open(
						getDeleteBackupSuccessAlertConfig(
							name,
							this.translateService,
							'CONFIG_HUB.SUCCESS_DRAFT_DELETED'
						)
					);
					this.rows = this.rows.filter(row => row.jobId !== jobId);
					this.totalDrafts = this.rows.length;
					this.loading = false;
					this.changeDetectorRef.detectChanges();
				},
				error: () => (this.loading = false)
			});
	}

	/**
	 * Returns actions buttons based on roles
	 */
	private async getActionsButtons(): Promise<DataGridActionsMenuDropdownModel[]> {
		const editAction: DataGridActionsMenuDropdownModel = {
			slptIconName: '',
			preventFocusedMenuOnClick: true,
			clickHandle: ({ data }: RowNode<ConfigHubDraftJob>) => {
				this.handleViewEditDraft(data);
			},
			label: null,
			labelGetter: ({ data }: RowNode<ConfigHubDraftJob>) => {
				if (!this.isConfigHubApprovalStatusEnabled) {
					return 'CONFIG_HUB.EDIT';
				}
				const status = data?.approvalStatus ?? null;
				switch (status) {
					case ConfigHubApprovalStatus.APPROVED:
					case ConfigHubApprovalStatus.DENIED:
						return 'CONFIG_HUB.EDIT_AND_RESUBMIT';
					case ConfigHubApprovalStatus.PENDING_FOR_APPROVAL:
						return 'CONFIG_HUB.CANCEL_REQUEST';
					default:
						return 'CONFIG_HUB.EDIT';
				}
			}
		};
		const deleteAction: DataGridActionsMenuDropdownModel = {
			slptIconName: '',
			label: 'CONFIG_HUB.DELETE',
			preventFocusedMenuOnClick: true,
			clickHandle: ({ data }: RowNode<ConfigHubDraftJob>) => this.handleDeleteDraft(data)
		};
		const viewAction: DataGridActionsMenuDropdownModel = {
			slptIconName: '',
			label: this.translateService.instant('CONFIG_HUB.VIEW'),
			preventFocusedMenuOnClick: true,
			clickHandle: ({ data }: RowNode<ConfigHubDraftJob>) => {
				this.handleViewEditDraft(data);
			}
		};

		const canUserEditDrafts = await this.userRightsService.hasRight(ConfigHubRoles.DRAFT_UPDATE);
		const actionsButtons: DataGridActionsMenuDropdownModel[] = [];

		if (canUserEditDrafts) {
			actionsButtons.push(editAction);
		} else {
			actionsButtons.push(viewAction);
		}

		const canUserDeleteDrafts = await this.userRightsService.hasRight(ConfigHubRoles.DRAFT_DELETE);
		if (canUserDeleteDrafts) {
			actionsButtons.push(deleteAction);
		}

		return actionsButtons;
	}

	/**
	 * Initialize the grid options.
	 */
	private async initializeGridOptions(): Promise<void> {
		const actionsButtons: DataGridActionsMenuDropdownModel[] = await this.getActionsButtons();
		this.columnDefs = getJobsGridColumnDefs(this.translateService, this.datePipe);
		const actionsColumn = {
			...this.columnsService.createActionsColumnWithDropdown(
				actionsButtons,
				this.translateService.instant('CONFIG_HUB.ACTIONS'),
				120
			),
			headerClass: 'draft-list__actions-header'
		};

		if (this.isConfigHubApprovalStatusEnabled) {
			const approvalStatusColumn: SlptColDef = {
				headerName: this.translateService.instant('CONFIG_HUB.APPROVAL_STATUS'),
				field: 'approvalStatus',
				sortable: false,
				valueGetter: ({ data }) => {
					const status = data?.approvalStatus ?? null;
					return this.translateService.instant(ApprovalStatusTranslations[status]);
				}
			};
			this.columnDefs.splice(1, 0, approvalStatusColumn);
		}
		actionsColumn.colId = GRID_ACTION_COLUMN_ID;
		this.columnDefs.push(actionsColumn);
	}

	/**
	 * Handles the View/Edit click event
	 * @param data draft job to be edited
	 */
	private handleViewEditDraft(data: ConfigHubDraftJob): void {
		this.router.navigate([CONFIG_HUB_URL, ConfigHubChildRoutes.DRAFTS.route, data.jobId]);
	}

	/**
	 * Handles the gridReady event when the grid loads and initiates loading drafts.
	 * @param event - The grid ready event emitted by ag-grid.
	 */
	public onGridReady(event?: GridReadyEvent): void {
		if (!this.gridApi) {
			this.gridApi = event;
		}
		this.loadDrafts();
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
	 * Loads the Configuration Hub drafts.
	 */
	private loadDrafts(): void {
		this.loading = true;
		this.configHubDraftService
			.loadCompletedDraftJobs()
			.pipe(take(1))
			.subscribe({
				next: ({ items }: ApiListResponse<ConfigHubDraftJob>) => {
					this.rows = items;
					this.totalDrafts = items.length;
					this.loading = false;
					this.changeDetectorRef.detectChanges();
				},
				error: () => (this.loading = false)
			});
	}

	/**
	 * Destroy both static and alerts with id.
	 */
	private destroyExistingAlerts(): void {
		this.alertService.destroy();
		Object.values(ConfigHubJobStatus).forEach(status => {
			this.alertService.destroy(status);
		});
	}
}
