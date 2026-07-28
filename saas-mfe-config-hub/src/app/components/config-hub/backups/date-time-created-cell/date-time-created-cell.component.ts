/*
 * Copyright (C) 2023 Acme Technologies, Inc.  All rights reserved.
 */
import { Component } from '@angular/core';

import { ICellRendererAngularComp } from 'ag-grid-angular';
import { ICellRendererParams } from 'ag-grid-community';
import { Subject, takeUntil } from 'rxjs';

@Component({
	selector: 'app-date-time-created-cell',
	templateUrl: './date-time-created-cell.component.html',
	styleUrls: ['./date-time-created-cell.component.scss']
})
export class DateTimeCreatedCellComponent implements ICellRendererAngularComp {
	/**
	 * Formatted date when the backup job was completed.
	 */
	public completedDate!: string;

	/**
	 * Whether the backup job is the latest with `COMPLETED` status.
	 */
	public isLatestCompleted = false;

	private unsubscribe$ = new Subject();

	/**
	 * Initialization of cell
	 */
	public agInit(params: ICellRendererParams | any): void {
		this.completedDate = params.value;
		params.latestCompletedJobId$.pipe(takeUntil(this.unsubscribe$)).subscribe(id => {
			this.isLatestCompleted = this.isLatestCompletedBackup(params, id);
		});
	}

	/**
	 * Called when the cell refreshes.
	 */
	public refresh(): boolean {
		return false;
	}

	/**
	 * Determines whether the backup job was the latest to be completed, based on grid context.
	 * @param {ICellRendererParams} params - params from current cell.
	 * @param {string} id - id of the latest completed backup job
	 * @return {boolean} - if the jobId matches with the latest completed jobId
	 */
	private isLatestCompletedBackup(params: ICellRendererParams, id: string): boolean {
		return id ? id === params.data.jobId : false;
	}

	/**
	 * Gets called once by grid after rendering is finished
	 */
	destroy(): void {
		this.unsubscribe$.complete();
	}
}
