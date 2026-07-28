/*
 * Copyright (C) 2023 Acme Technologies, Inc.  All rights reserved.
 */
import {
	MfeAuthContext,
	MfeContextData,
	MfeRequestContext,
	MfeTenantContext,
	MfeUserContext
} from '@acme-priv/ui-common/src/acme/angular/util/app-shell';

/**
 * Mock globals JSON from element #slpt-globals-json populated with ONLY the data used in Admiral
 */
export const mockSlptGlobalsJson = {
	baseUrl: 'https://test-org.identitysoon.com/ui/',
	orgScriptName: 'test-org',
	api: {
		baseUrl: 'https://test-org.api.cloud.acme.com'
	},
	locales: ['locale1', 'locale2']
};

const requestContext: MfeRequestContext = {
	locales: mockSlptGlobalsJson.locales,
	appShellBaseUrl: mockSlptGlobalsJson.baseUrl,
	devMode: true,
	languagePackage: '',
	brand: {
		name: '',
		productName: '',
		standardLogoURL: '',
		emailFromAddress: '',
		loginInformationalMessage: '',
		actionButtonColor: '',
		actionButtonLighterColor: '',
		actionButtonDarkerColor: '',
		activeLinkColor: '',
		activeLinkLighterColor: '',
		activeLinkDarkerColor: '',
		navigationColor: '',
		navigationLighterColor: '',
		navigationDarkerColor: ''
	}
} as MfeRequestContext;

const authContext: MfeAuthContext = {
	logoutUrl: '',
	apiUrl: {
		idn: mockSlptGlobalsJson.api.baseUrl
	},
	refreshUrl: '',
	loginUrl: '',
	forceAuthUrl: '',
	csrfToken: ''
};

const tenantContext: MfeTenantContext = {
	id: '',
	scriptName: mockSlptGlobalsJson.orgScriptName,
	org: ''
};

const userContext: MfeUserContext = {
	id: '',
	displayName: '',
	amsRights: []
} as MfeUserContext;

/**
 * Mock Readonly<MfeContextData> returned for MFE's with ONLY the data mapped that is used in Admiral.
 */
export const MockMfeContext: Readonly<MfeContextData> = {
	userContext,
	tenantContext,
	authContext,
	requestContext
};

/**
 * Mocks the GlobalService.get method to return mock settings
 * @param name The name of the GlobalService setting to get
 * @returns any type, the value of the requested setting
 */
export function mockGet(name: string): any {
	return mockSlptGlobalsJson[name];
}

/**
 * Mocks the AppShellWrapperService.getMfeContextV1 method
 * @returns A promise to resolve the mock MFE context data
 */
export function mockGetMfeContextV1(): Promise<Readonly<MfeContextData>> {
	return new Promise(resolve => {
		resolve(MockMfeContext);
	});
}
