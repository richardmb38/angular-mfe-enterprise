/*
 * Copyright (C) 2023 Acme Technologies, Inc.  All rights reserved.
 */
import {
	DataGridLoadingModel,
	DataGridNoDataModel
} from '@acme-priv/armada-angular/src/acme/angular/components/grid';
import { Message } from '@acme-priv/armada-angular/src/acme/angular/l10n/translation';

/**
 * Model containing the empty state component when the grid has no data.
 * @param subTile - The string used as the subtitle.
 * @returns {DataGridNoDataModel}
 */
export const gridNoDataModel = (subTitle?: Message): DataGridNoDataModel => ({
	title: 'CONFIG_HUB.THERES_NOTHING_TO_SEE_HERE',
	subTitle,
	iconName: 'empty',
	iconFill: 'g3',
	iconSize: '100px',
	iconType: 'regular'
});

/**
 * Internal grid loading mask model - disabled by default.
 */
export const gridLoadingModel: DataGridLoadingModel = { isLoadingInUse: false };
