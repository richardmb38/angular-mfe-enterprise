/*
 * Copyright (C) 2023 Acme Technologies, Inc.  All rights reserved.
 */
import { Component } from '@angular/core';

import { ICellRendererAngularComp } from 'ag-grid-angular';
import { ICellRendererParams } from 'ag-grid-community';

import {
	CellClassRules,
	ObjectDiffCellClasses,
	ObjectDiffCellRendererParams,
	getCellHighlightByOperation
} from './object-diff-cell.model';

@Component({
	selector: 'app-object-diff-cell',
	templateUrl: './object-diff-cell.component.html',
	styleUrls: ['./object-diff-cell.component.scss']
})
export class ObjectDiffCellComponent implements ICellRendererAngularComp {
	public params!: ObjectDiffCellRendererParams;

	/**
	 * Initialization of cell.
	 * @param {ICellRendererParams} params the cell params
	 */
	agInit(params: ICellRendererParams): void {
		this.params = params;
	}

	/**
	 * Called when the cell refreshes.
	 * @param {ICellRendererParams} params the cell params
	 * @returns {boolean}
	 */
	refresh(params: ICellRendererParams): boolean {
		this.params = params;
		return true;
	}

	/**
	 * Returns the classes for the cell renderer based on the cell params
	 * @returns {CellClassRules}
	 */
	public getCellCssClasses(): CellClassRules {
		return {
			[ObjectDiffCellClasses.FADED]: !this.params?.node?.isSelected() || this.params?.value <= 0,
			[ObjectDiffCellClasses.CLICKABLE]: this.params?.node?.isSelected() && this.params?.value > 0,
			[ObjectDiffCellClasses.DISABLED]: !this.params?.node?.isSelected()
		};
	}

	/**
	 * Returns the classes for the cell renderer highlight based on the cell params
	 * @returns {CellClassRules}
	 */
	public getCellHighlightCssClass(): CellClassRules {
		return getCellHighlightByOperation(this.params.operation, this.params.value);
	}
}
