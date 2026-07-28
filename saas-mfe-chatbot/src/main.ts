/*
 * Copyright (C) 2024 Acme Technologies, Inc.  All rights reserved.
 */
import { NgZone, enableProdMode } from '@angular/core';
import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';
import { NavigationStart, Router } from '@angular/router';

import { CURRENT_BRANDING_DI_TOKEN } from '@acme-priv/armada-angular/src/acme/angular/util/branding';

import {
	APP_SHELL_SERVICE_DI_TOKEN,
	APP_SHELL_SERVICE_NAME,
	FEATURE_FLAG_SERVICE_DI_TOKEN,
	MFE_INFO_DI_TOKEN,
	MFE_INFO_NAME,
	REQUEST_CONTEXT_DI_TOKEN,
	USER_CONTEXT_DI_TOKEN
} from '@acme-priv/ui-common/src/acme/angular/util/app-shell';

import { AppModule } from './app/app.module';
import { environment } from './environments/environment';
import { getSingleSpaExtraProviders, singleSpaAngular } from 'single-spa-angular';

if (environment.production) {
	enableProdMode();
}

const lifecycles = singleSpaAngular({
	bootstrapFunction: async singleSpaProps => {
		return platformBrowserDynamic([
			...getSingleSpaExtraProviders(),
			{ provide: APP_SHELL_SERVICE_DI_TOKEN, useValue: singleSpaProps[APP_SHELL_SERVICE_NAME] },
			{
				provide: FEATURE_FLAG_SERVICE_DI_TOKEN,
				useValue: await singleSpaProps[APP_SHELL_SERVICE_NAME].getFeatureFlagProvider()
			},
			{
				provide: CURRENT_BRANDING_DI_TOKEN,
				useValue: (await singleSpaProps[APP_SHELL_SERVICE_NAME].getRequestContextV1()).brand
			},
			{
				provide: REQUEST_CONTEXT_DI_TOKEN,
				useValue: await singleSpaProps[APP_SHELL_SERVICE_NAME].getRequestContextV1()
			},
			{
				provide: USER_CONTEXT_DI_TOKEN,
				useValue: await singleSpaProps[APP_SHELL_SERVICE_NAME].getUserContextV1()
			},
			{ provide: MFE_INFO_DI_TOKEN, useValue: singleSpaProps[MFE_INFO_NAME] }
		]).bootstrapModule(AppModule);
	},
	template: '<app-root />',
	Router,
	NavigationStart,
	NgZone
});

export const bootstrap = lifecycles.bootstrap;
export const mount = lifecycles.mount;
export const unmount = lifecycles.unmount;
