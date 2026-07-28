/*
 * Copyright (C) 2023 Acme Technologies, Inc.  All rights reserved.
 */
import { ICellRendererParams } from 'ag-grid-community';
import { Observable } from 'rxjs';

import { TypeaheadOption } from '@acme-priv/armada-angular/src/acme/angular/components/form';

/**
 * An interface that includes the operation types for the cell renderer params
 */
export interface DropdownCellRendererParams extends ICellRendererParams {
	options$: Observable<TypeaheadOption[]>;
	placeholder: string;
}
