/*
 * Copyright (C) 2023 Acme Technologies, Inc.  All rights reserved.
 */
import { ICellRendererParams } from 'ag-grid-community';

/**
 * An interface that includes the icon options for the cell renderer params
 */
export interface IconCellRendererParams extends ICellRendererParams {
	iconName: string;
	useText: boolean;
	editable?: boolean;
}

export enum IconCellIcons {
	pencil = 'pencil'
}
