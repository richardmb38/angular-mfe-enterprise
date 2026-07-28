/*
 * Copyright (C) 2023 Acme Technologies, Inc.  All rights reserved.
 */
import { Component } from '@angular/core';

import { ICellRendererAngularComp } from 'ag-grid-angular';

import { DataGridCellRendererParams } from '@acme-priv/armada-angular/src/acme/angular/components/grid';

@Component({
	selector: 'app-toggle-cell',
	templateUrl: './toggle-cell.component.html',
	styleUrls: ['./toggle-cell.component.scss']
})
export class ToggleCellComponent implements ICellRendererAngularComp {
	/**
	 * Whether or not the toggle is enabled
	 */
	public isEnabled: boolean;

	/**
	 * Wether user can update toggle
	 */
	public editable: boolean;

	/**
	 * The params from the grid node
	 */
	public params: DataGridCellRendererParams;

	/**
	 * Initialization of cell.
	 */
	public agInit(params: DataGridCellRendererParams): void {
		this.isEnabled = params.value;
		this.editable = params.editable;
		this.params = params;
	}

	/**
	 * Called when the cell refreshes.
	 */
	public refresh(): boolean {
		return false;
	}

	/**
	 * Handle toggle change
	 */
	public handleToggleChange(event): void {
		this.params?.toggleControl?.next({ target: this.params?.data.objectMappingId, value: event });
	}
}
