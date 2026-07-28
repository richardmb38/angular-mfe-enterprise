/*
 * Copyright (C) 2023 Acme Technologies, Inc.  All rights reserved.
 */
import { Component } from '@angular/core';

import { ICellRendererAngularComp } from 'ag-grid-angular';
import { ICellRendererParams } from 'ag-grid-community';

import { Alignment } from '@acme-priv/armada-angular/src/acme/theme/typescript';

@Component({
	selector: 'app-object-type-cell',
	templateUrl: './object-type-cell.component.html',
	styleUrls: ['./object-type-cell.component.scss']
})
export class ObjectTypeCellComponent implements ICellRendererAngularComp {
	/**
	 * Object type name.
	 */
	public objectType = '';

	/**
	 * Aligment used for the tooltip.
	 */
	public Alignment = Alignment;

	/**
	 * Initialization of cell.
	 */
	public agInit(params: ICellRendererParams): void {
		this.objectType = params.value;
	}

	/**
	 * Called when the cell refreshes.
	 */
	public refresh(): boolean {
		return false;
	}
}
