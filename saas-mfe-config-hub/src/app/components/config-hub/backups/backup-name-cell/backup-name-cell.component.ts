/*
 * Copyright (C) 2023 Acme Technologies, Inc.  All rights reserved.
 */
import { Component } from '@angular/core';

import { ICellRendererAngularComp } from 'ag-grid-angular';
import { ICellRendererParams } from 'ag-grid-community';

import { HydrationStatuses } from '../../shared/models';

@Component({
	selector: 'app-backup-name-cell',
	templateUrl: './backup-name-cell.component.html',
	styleUrls: ['./backup-name-cell.component.scss']
})
export class BackupNameCellComponent implements ICellRendererAngularComp {
	/**
	 * The name of the backup
	 */
	public backupName!: string;

	/**
	 * Whether the backup job is a partial backup
	 */
	public isPartial = false;

	/**
	 * Whether the backup is currently hydrating (objects are being written to dynamodb)
	 */
	public isHydrating = false;

	/**
	 * Initialization of cell
	 */
	public agInit(params: ICellRendererParams): void {
		this.backupName = params.data.name;
		this.isPartial = params.data.isPartial;
		this.isHydrating = params.data.hydrationStatus === HydrationStatuses.HYDRATING;
	}

	/**
	 * Called when the cell refreshes.
	 */
	public refresh(): boolean {
		return false;
	}
}
