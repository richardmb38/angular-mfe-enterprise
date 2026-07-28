import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';

import { TypeaheadFieldModule } from '@acme-priv/armada-angular/src/acme/angular/components/form';

import { DropdownCellComponent } from './dropdown-cell.component';

/**
 * The module exporting DropdownCellComponent.
 */

@NgModule({
	declarations: [DropdownCellComponent],
	imports: [CommonModule, TypeaheadFieldModule],
	exports: [DropdownCellComponent]
})
export class DropdownCellModule {}
