/*
 * Copyright (C) 2024 Acme Technologies, Inc.  All rights reserved.
 */
import wp from '@cypress/webpack-preprocessor';
import { defineConfig } from 'cypress';
import getCompareSnapshotsPlugin from 'cypress-visual-regression/dist/plugin';
import { TsconfigPathsPlugin } from 'tsconfig-paths-webpack-plugin';

export default defineConfig({
	env: {
		ALWAYS_GENERATE_DIFF: false,
		ALLOW_VISUAL_REGRESSION_TO_FAIL: false,
		SNAPSHOT_DIFF_DIRECTORY: './cypress/snapshots/diff',
		CYPRESS_RECORD_KEY: '20148bd1-f194-417d-866f-4ace0e866003'
	},
	e2e: {
		baseUrl: 'http://localhost:6006',
		specPattern: ['**/*.cypress.ts'],
		retries: {
			runMode: 2,
			openMode: 0
		},
		projectId: 'ku25kv',
		fixturesFolder: './cypress/fixtures',
		defaultCommandTimeout: 10000,
		viewportWidth: 1920,
		viewportHeight: 1080,
		screenshotsFolder: './cypress/snapshots/actual',
		trashAssetsBeforeRuns: true,
		screenshotOnRunFailure: false,
		chromeWebSecurity: false,
		video: false,
		testIsolation: false, // This setting will be changed to 'true' under the jira - https://acme.atlassian.net/jira/software/c/projects/UITEST/issues/UITEST-4
		setupNodeEvents(on, config) {
			getCompareSnapshotsPlugin(on, config);
			const options = {
				webpackOptions: {
					// Watch for test file changes so tests will re-run when using cypress:open
					watch: true,
					resolve: {
						extensions: ['.ts', '.js'],
						plugins: [
							new TsconfigPathsPlugin({
								extensions: ['.ts', '.js'],
								configFile: './cypress/tsconfig.json'
							})
						]
					},
					module: {
						// These rules instruct webpack to transpile any .ts or .js files that are imported into
						// our cypress test files. This allows us to use the most recent TS and JS features in our test
						// code as supported by ts-loader and babel/preset-env versions.
						rules: [
							{
								test: /\.ts?$/,
								loader: 'ts-loader',
								options: {
									// Allows for faster test runs at the cost of removing type checking.
									transpileOnly: true
								}
							},
							{
								test: /\.js?$/,
								loader: 'babel-loader',
								options: {
									presets: ['@babel/preset-env']
								}
							}
						]
					}
				}
			};
			on('file:preprocessor', wp(options));
			on('before:browser:launch', (browser = {} as Cypress.Browser, launchOptions) => {
				// the browser width and height we want to get
				// our screenshots and videos will be of that resolution
				const width = 1920;
				const height = 1080;

				if (browser.name === 'chrome') {
					launchOptions.args.push(`--window-size=${width},${height}`);

					// force screen to be non-retina and just use our given resolution
					launchOptions.args.push('--force-device-scale-factor=1');
				}

				if (browser.name === 'electron') {
					// might not work on CI for some reason
					launchOptions.preferences.width = width;
					launchOptions.preferences.height = height;
				}

				if (browser.name === 'firefox') {
					launchOptions.args.push(`--width=${width}`);
					launchOptions.args.push(`--height=${height}`);
				}

				// IMPORTANT: return the updated browser launch options
				return launchOptions;
			});
		}
	}
});
