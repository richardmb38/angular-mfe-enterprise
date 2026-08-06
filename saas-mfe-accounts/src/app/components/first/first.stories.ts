/*
 * Copyright (C) 2024 Acme Technologies, Inc.  All rights reserved.
 */
import { Meta, StoryFn } from '@storybook/angular';

import { FirstComponent } from './first.component';

export default {
	title: 'Components/First',
	component: FirstComponent,
	decorators: []
} as Meta;

/**
 * Template for stories
 */
const Template: StoryFn<FirstComponent> = args => ({
	props: { ...args }
});

export const Default = {
	render: Template
};
