/*
 * Copyright (C) 2024 Acme Technologies, Inc.  All rights reserved.
 */
import { create } from '@storybook/theming/create';

export default create({
	base: 'light',
	brandTitle: 'Acme',
	brandImage: 'acme_logo_color.png',
	brandUrl: './index.html',

	// Typography
	fontBase: '"Source Sans Pro", sans-serif',
	fontCode: 'monospace'
});
