/*
 * Copyright (C) 2023 Acme Technologies, Inc.  All rights reserved.
 */
import { Component } from '@angular/core';

import { ICellRendererAngularComp } from 'ag-grid-angular';
import { ICellRendererParams } from 'ag-grid-community';

import { Alignment } from '@acme-priv/armada-angular/src/acme/theme/typescript';

import { ObjectDetails } from 'app/components/config-hub/shared/models';

/**
 * Configuration Hub Object Warning Cell
 *
 * Displays an object warning icon indicating deployment issues with the object.
 */
@Component({
	selector: 'app-object-warning-cell',
	templateUrl: './object-warning-cell.component.html',
	styleUrls: ['./object-warning-cell.component.scss']
})
export class ObjectWarningCellComponent implements ICellRendererAngularComp {
	/**
	 * Whether the object has deploy issues.
	 */
	public hasDeployIssues = false;

	/**
	 * Aligment used for the tooltip.
	 */
	public Alignment = Alignment;

	/**
	 * Initialization of cell
	 */
	public agInit({ data }: ICellRendererParams<ObjectDetails>): void {
		this.hasDeployIssues = data.hasErrors;
	}

	/**
	 * Called when the cell refreshes.
	 */
	public refresh(): boolean {
		return false;
	}
}
