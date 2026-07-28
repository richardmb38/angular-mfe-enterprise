/*
 * Copyright (C) 2025 Acme Technologies, Inc.  All rights reserved.
 */
import { addons } from '@storybook/manager-api';

import acmeTheme from './theme';

addons.setConfig({
	theme: acmeTheme
});
