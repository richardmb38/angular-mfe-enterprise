/*
 * Copyright (C) 2024 Acme Technologies, Inc.  All rights reserved.
 */

module.exports = {
	preset: 'jest-preset-angular',
	globalSetup: 'jest-preset-angular/global-setup',
	setupFiles: ['jest-canvas-mock'],
	setupFilesAfterEnv: ['<rootDir>/jest/index.ts'],
	maxWorkers: process.env.CI ? 4 : undefined,
	globals: {
		'ts-jest': {
			isolatedModules: true,
			tsconfig: './tsconfig.spec.json'
		}
	},
	roots: ['<rootDir>', '<rootDir>/src'],
	reporters: [
		'default',
		[
			'jest-junit',
			{
				suiteName: 'jest tests',
				suiteNameTemplate: '{filepath}',
				outputDirectory: './test-output/junit/',
				outputName: 'jest.xml',
				classNameTemplate: '{classname}-{title}',
				titleTemplate: '{title}',
				ancestorSeparator: ' › '
			}
		]
	],
	modulePaths: ['<rootDir>/src'],
	transform: {
		'^.+\\.ts': 'ts-jest'
	},
	coverageDirectory: 'test-output/jest-coverage',
	coverageReporters: ['text-summary', 'json', 'cobertura', 'html'],
	coveragePathIgnorePatterns: ['/dist/'],
	testPathIgnorePatterns: ['/node_modules/', '/dist/'],
	collectCoverageFrom: [
		'src/app',
		'src/**/*.*',
		'!src/**/*.html',
		'!src/main.ts',
		'!src/main.single-spa.ts',
		'!src/test.ts',
		'!src/polyfills.ts',
		'!src/**/*.json',
		'!src/**/index.ts',
		'!src/**/*.mock.ts',
		'!src/**/*.routes.ts',
		'!src/assets/*.*',
		'!src/environments/*.*',
		'!/node_modules/**',
		'!/e2e/**',
		'!/jest/',
		'!src/**/*.stories.ts',
		'!src/**/*.e2e.js',
		'!src/**/*.cypress.ts',
		'!src/**/__snapshots__/*.*'
	],
	coverageThreshold: {
		'src/app': {
			lines: 90
		},
		'src/**/*.*': {
			lines: 75
		}
	}
};
