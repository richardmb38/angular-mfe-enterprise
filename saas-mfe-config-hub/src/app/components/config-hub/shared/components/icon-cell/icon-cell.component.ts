/*
 * Copyright (C) 2023 Acme Technologies, Inc.  All rights reserved.
 */
import { Component } from '@angular/core';

import { ICellRendererAngularComp } from 'ag-grid-angular';

import { IconCellRendererParams } from './icon-cell.model';

@Component({
	selector: 'app-icon-cell',
	templateUrl: './icon-cell.component.html',
	styleUrls: ['./icon-cell.component.scss']
})
export class IconCellComponent implements ICellRendererAngularComp {
	/**
	 * IconCell available params
	 */
	public params: IconCellRendererParams;

	/**
	 * Initialization of cell.
	 * @param {IconCellRendererParams} params the cell params
	 */
	agInit(params: IconCellRendererParams): void {
		this.params = params;
	}

	/**
	 * Called when the cell refreshes.
	 * @param {ICellRendererParams} params the cell params
	 * @returns {boolean}
	 */
	refresh(params: IconCellRendererParams): boolean {
		this.params = params;
		return true;
	}
}
