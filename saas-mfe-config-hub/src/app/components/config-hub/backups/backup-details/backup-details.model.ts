import { IconConfig } from '@acme-priv/armada-angular/src/acme/angular/components/icons';

/*
 * Copyright (C) 2023 Acme Technologies, Inc.  All rights reserved.
 */

export const enum Icons {
	ARROW_LEFT,
	ARROW_RIGHT,
	ARROW_LEFT_ALT
}

export interface BackupDetailsSelectedObjectType {
	type: string;
	totalCount: number;
}

/**
 *	Returns the config needed to render a specific icon.
 *	@param icon - The icon to be displayed in the UI
 *	@returns the configuration for the icon passed to the function.
 */
export function getIconConfig(icon: Icons): IconConfig {
	switch (icon) {
		case Icons.ARROW_LEFT:
			return { name: 'arrowLeft', type: 'light' };
		case Icons.ARROW_RIGHT:
			return { name: 'arrowRight', type: 'light' };
		case Icons.ARROW_LEFT_ALT:
			return { name: 'arrowLeftAlt', type: 'light' };
	}
}
