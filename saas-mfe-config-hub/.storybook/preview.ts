/*
 * Copyright (C) 2024 Acme Technologies, Inc.  All rights reserved.
 */
import '@angular/localize/init';

import { setCompodocJson } from '@storybook/addon-docs/angular';
import { Preview, componentWrapperDecorator } from '@storybook/angular';

import {
	LOCALE_GLOBAL_TYPES,
	addStoryBookFunctionsToWindow,
	registerWebComponents
} from '@acme-priv/armada-angular/src/acme/storybook';

import docJson from '../documentation.json';
import { translations } from './translations';

window['slptLanguagePackages'] = { ...translations };

registerWebComponents();
setCompodocJson(docJson);
addStoryBookFunctionsToWindow();

export const globalTypes = {
	...LOCALE_GLOBAL_TYPES
};

/**
 * Set the global parameters for the stories
 */
const parameters: Preview = {
	parameters: {
		controls: {
			expanded: true,
			matchers: {
				color: /(background|color)$/i,
				date: /Date$/i
			}
		},
		layout: 'centered',
		docs: {
			page: null
		},
		previewTabs: {
			'storybook/docs/panel': {
				hidden: true
			}
		},
		fetchMock: {
			mocks: []
		}
	}
};

export default parameters;

export const decorators = [
	componentWrapperDecorator(story => `<div style="width: 1536px; height: 960px">${story}</div>`)
];
