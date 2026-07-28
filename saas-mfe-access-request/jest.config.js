/*
 * Copyright (C) 2025 Acme Technologies, Inc.  All rights reserved.
 */

module.exports = {
	preset: 'jest-preset-angular',
	setupFiles: ['jest-canvas-mock', '<rootDir>/jest/jest-preset-angular-config.ts'],
	setupFilesAfterEnv: ['<rootDir>/jest/index.ts'],
	maxWorkers: process.env.CI ? 4 : undefined,
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
		'^.+\\.ts': [
			'ts-jest',
			{
				isolatedModules: true,
				tsconfig: './tsconfig.spec.json'
			}
		]
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
			lines: 89
		},
		'src/**/*.*': {
			lines: 75
		}
	}
};
