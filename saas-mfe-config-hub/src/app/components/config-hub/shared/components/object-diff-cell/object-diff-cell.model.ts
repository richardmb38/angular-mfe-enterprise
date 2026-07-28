import { ICellRendererParams } from 'ag-grid-community';

import { ObjectDeltaTypeNames } from '../../models';

/**
 * An object containing CSS classes and rules for them
 */
export interface CellClassRules {
	[cssClass: string]: boolean;
}

/**
 * An interface that includes the operation type for the cell renderer params
 */
export interface ObjectDiffCellRendererParams extends ICellRendererParams {
	operation?: ObjectDeltaTypeNames;
}

/**
 * List of CSS classes that describe the state of the cell renderer
 */
export enum ObjectDiffCellClasses {
	FADED = 'object-diff-cell--faded',
	CLICKABLE = 'object-diff-cell--clickable',
	DISABLED = 'object-diff-cell--disabled',
	HIGHLIGHT = 'object-diff-cell__value-highlight'
}

/**
 * Returns a CSS class that applies operation-specific highlighting to a cell.
 * @param operation The operation type.
 * @param value The current value of the cell.
 * @returns {CellClassRules}
 */
export const getCellHighlightByOperation = (operation: ObjectDeltaTypeNames, value: number): CellClassRules => {
	return {
		[ObjectDiffCellClasses.HIGHLIGHT]: true,
		[`${ObjectDiffCellClasses.HIGHLIGHT}--${operation.toLocaleLowerCase()}`]: value > 0
	};
};
