/*
 * Copyright (C) 2023 Acme Technologies, Inc.  All rights reserved.
 */
import { Component, EventEmitter } from '@angular/core';

import { ICellRendererAngularComp } from 'ag-grid-angular';
import { Observable, of } from 'rxjs';

import { TypeaheadOption } from '@acme-priv/armada-angular/src/acme/angular/components/form';

import { DropdownCellRendererParams } from './dropdown-cell.model';

@Component({
	selector: 'app-dropdown-cell',
	templateUrl: './dropdown-cell.component.html',
	styleUrls: ['./dropdown-cell.component.scss']
})
export class DropdownCellComponent implements ICellRendererAngularComp {
	/**
	 * Submitted attempt
	 */
	public submitAttempted: EventEmitter<boolean>;

	/**
	 * Select component initial value
	 */
	public initialSelection$: Observable<string | TypeaheadOption>;

	/**
	 * Renderer params
	 */
	public params: DropdownCellRendererParams;

	/**
	 * Initialization of cell.
	 * @param {DropdownCellRendererParams} params the cell params
	 */
	agInit(params: DropdownCellRendererParams): void {
		this.params = params;

		this.params.options$.subscribe(options => {
			const found = options.find(option => option.displayName === this.params.value);
			if (found) {
				this.initialSelection$ = of(found);
			}
		});
	}

	/**
	 * Called when the cell refreshes.
	 * @returns {boolean}
	 */
	refresh(): boolean {
		return false;
	}

	/**
	 * Triggers on select change
	 * @param $event selected value event
	 */
	public handleChangeType(event: string | TypeaheadOption): void {
		if (typeof event === 'string') {
			this.params.setValue(event);
		} else {
			this.params.setValue(event.displayName);
		}
	}
}
