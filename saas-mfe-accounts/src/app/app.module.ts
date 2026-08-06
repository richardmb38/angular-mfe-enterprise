/*
 * Copyright (C) 2024 Acme Technologies, Inc.  All rights reserved.
 */
import { APP_BASE_HREF } from '@angular/common';
import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { RouterModule } from '@angular/router';

// import { TranslateHttpLoader } from '@acme-priv/armada-angular/src/acme/angular/l10n/translate-http-loader';
import { MfeInfoService } from '@acme-priv/ui-common/src/acme/angular/util/app-shell';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { FirstComponent } from './components/first/first.component';
import { MfeTranslateHelper } from './shared/services/translate/mfe-translate-helper.service';

// import { MfeTranslateHelper } from './shared/services/translate/mfe-translate-helper.service';

/**
 * Makes a valid URL string, resolving double and missing slashed delimiting the path segments according to the parameters provided
 */
// function TranslateHttpLoaderFactory(injector: Injector, mfeInfoService: MfeInfoService) {
// 	return new TranslateHttpLoader(injector, [mfeInfoService.makeAssetUrl('language-package{lang}.json', '')], '_');
// }

/**
 * Initialize app translations
 */
export function AppInitializerFactory(mfeTranslateHelper: MfeTranslateHelper) {
	return async () => await mfeTranslateHelper.initialize();
}

/**
 * calls the utility function to trim leading and trailing slashes according to the MFE service provided
 */
function BaseRefFactory(mfeInfoService: MfeInfoService) {
	const mfeRoute = mfeInfoService.trimSlashes(mfeInfoService.route) || '';
	return `/${mfeRoute}/`;
}

@NgModule({
	declarations: [AppComponent, FirstComponent],
	imports: [BrowserModule, RouterModule, AppRoutingModule],
	providers: [
		{
			provide: APP_BASE_HREF,
			useFactory: BaseRefFactory,
			deps: [MfeInfoService]
		}
	],
	bootstrap: [AppComponent]
})
export class AppModule {}
