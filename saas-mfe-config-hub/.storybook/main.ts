import { StorybookConfig } from '@storybook/angular';

const storybookConfig: StorybookConfig = {
	stories: ['../src/**/*.@(mdx|stories.@(ts))', '../.storybook/stories/**/*.@(mdx|stories.@(ts))'],
	addons: ['@storybook/addon-essentials', '@storybook/addon-a11y', 'storybook-addon-fetch-mock'],
	staticDirs: ['../src/assets/images/', '../node_modules/tinymce/'],
	framework: {
		name: '@storybook/angular',
		options: {}
	},
	core: {
		disableTelemetry: true
	},
	docs: {
		autodocs: 'tag',
		defaultName: 'Documentation'
	}
};

export default storybookConfig;
