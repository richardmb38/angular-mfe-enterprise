/*
 * Copyright (C) 2023 Acme Technologies, Inc.  All rights reserved.
 */
import { TestBed } from '@angular/core/testing';

import { GlobalService } from '@acme-priv/ui-common/src/acme/angular/util';
import { AppShellWrapperService } from '@acme-priv/ui-common/src/acme/angular/util/app-shell';

import { GlobalValue } from './globals.models';
import { mockGet, mockGetMfeContextV1, mockSlptGlobalsJson } from './legacy-global-service-adapter.mocks';
import { LegacyGlobalServiceAdapter } from './legacy-global-service-adapter.service';

const globals = [
	{
		key: GlobalValue.BaseUrl,
		expectedValue: mockSlptGlobalsJson.baseUrl
	},
	{
		key: GlobalValue.OrgScriptName,
		expectedValue: mockSlptGlobalsJson.orgScriptName
	},
	{
		key: GlobalValue.ApiBaseUrl,
		expectedValue: mockSlptGlobalsJson.api.baseUrl
	},
	{
		key: GlobalValue.Locales,
		expectedValue: mockSlptGlobalsJson.locales
	}
];

describe('GlobalsServiceAdapter', () => {
	let service: LegacyGlobalServiceAdapter;
	let globalService: GlobalService;
	let appShellWrapperService: AppShellWrapperService;

	const validateGlobals = () => {
		for (const global of globals) {
			const value = service.get(global.key);
			expect(value).toEqual(global.expectedValue);
		}
	};

	beforeEach(async () => {
		globalService = TestBed.inject(GlobalService);
		appShellWrapperService = TestBed.inject(AppShellWrapperService);
		service = TestBed.inject(LegacyGlobalServiceAdapter);

		jest.spyOn(globalService, 'get').mockImplementation(mockGet);
		jest.spyOn(appShellWrapperService, 'getMfeContextV1').mockImplementation(mockGetMfeContextV1);
	});

	it('should be created', () => {
		expect(service).toBeTruthy();
	});

	it('should return correct values as UI Module', async () => {
		// Ensure that the correct globals are returned for UI modules.
		jest.spyOn(appShellWrapperService, 'isMFE').mockImplementation(() => false);
		service = new LegacyGlobalServiceAdapter(appShellWrapperService, globalService);
		await service.init();

		validateGlobals();

		// Ensure that the values all asserted values in validateGlobals came from GlobalService
		expect(globalService.get).toHaveBeenCalledTimes(globals.length);
	});

	it('should return correct values as MFE', async () => {
		// Ensure that the correct globals are returned for MFE's.
		jest.spyOn(appShellWrapperService, 'isMFE').mockImplementation(() => true);
		service = new LegacyGlobalServiceAdapter(appShellWrapperService, globalService);
		await service.init();

		validateGlobals();

		// Ensure that the values did not come from GlobalService
		expect(globalService.get).not.toHaveBeenCalled();
	});
});
