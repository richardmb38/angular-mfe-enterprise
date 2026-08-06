/*
 * Copyright (C) 2024 Acme Technologies, Inc.  All rights reserved.
 */
import { APP_BASE_HREF } from '@angular/common';
import { APP_INITIALIZER, Injector, LOCALE_ID, NgModule } from '@angular/core';

import { TranslateLoader } from '@ngx-translate/core';

import { TranslateHttpLoader } from '@acme-priv/armada-angular/src/acme/angular/l10n/translate-http-loader';
import { TranslateModule } from '@acme-priv/armada-angular/src/acme/angular/l10n/translation';

import { MFEBaseModule } from '@acme-priv/ui-common/src/acme/angular';
import {
	MfeInfoService,
	MfeRequestContext,
	REQUEST_CONTEXT_DI_TOKEN
} from '@acme-priv/ui-common/src/acme/angular/util/app-shell';

import { AppComponent } from './app.component';
import { MfeTranslateHelper } from './shared/services/translate/mfe-translate-helper.service';

/**
 * Makes a valid URL string, resolving double and missing slashed delimiting the path segments according to the parameters provided
 */
export function TranslateHttpLoaderFactory(injector: Injector, mfeInfoService: MfeInfoService) {
	return new TranslateHttpLoader(injector, [mfeInfoService.makeAssetUrl('language-package{lang}.json', '')], '_');
}

/**
 * calls the utility function to trim leading and trailing slashes according to the MFE service provided
 */
export function BaseRefFactory(mfeInfoService: MfeInfoService) {
	const mfeRoute = mfeInfoService.trimSlashes(mfeInfoService.route) || '';
	return `/${mfeRoute}/`;
}

/**
 * Initialize app translations
 */
export function AppInitializerFactory(mfeTranslateHelper: MfeTranslateHelper) {
	return async () => await mfeTranslateHelper.initialize();
}

/**
 * Initialize app locale
 */
function LocaleIdFactory(injector: Injector) {
	return (injector.get(REQUEST_CONTEXT_DI_TOKEN) as MfeRequestContext).angularLocale;
}

@NgModule({
	imports: [
		MFEBaseModule,
		TranslateModule.forRoot({
			loader: {
				provide: TranslateLoader,
				useFactory: TranslateHttpLoaderFactory,
				deps: [Injector, MfeInfoService]
			}
		})
	],
	providers: [
		{
			provide: APP_BASE_HREF,
			useFactory: BaseRefFactory,
			deps: [MfeInfoService]
		},
		{
			provide: APP_INITIALIZER,
			useFactory: AppInitializerFactory,
			deps: [MfeTranslateHelper],
			multi: true
		},
		{ provide: LOCALE_ID, useFactory: LocaleIdFactory, deps: [Injector] }
	],
	bootstrap: [AppComponent]
})
export class AppMfeModule {}
