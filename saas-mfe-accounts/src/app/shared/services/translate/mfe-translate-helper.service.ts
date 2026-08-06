/*
 * Copyright (C) 2022 Acme Technologies, Inc.  All rights reserved.
 */
import { Injectable, Injector } from '@angular/core';

import { lastValueFrom } from 'rxjs';

import { TranslateService } from '@acme-priv/armada-angular/src/acme/angular/l10n/translation';

import {
	MfeRequestContext,
	REQUEST_CONTEXT_DI_TOKEN
} from '@acme-priv/ui-common/src/acme/angular/util/app-shell';

@Injectable({
	providedIn: 'root'
})
export class MfeTranslateHelper {
	private mfeRequestContext: MfeRequestContext;

	constructor(
		private translateService: TranslateService,
		private injector: Injector
	) {
		this.mfeRequestContext = injector.get(REQUEST_CONTEXT_DI_TOKEN) || ({} as MfeRequestContext);
	}

	/**
	 * Before Angular initialize the default language with the method .use
	 * in order to load properly the file language-package{lang}.json
	 */
	async initialize() {
		return await lastValueFrom(this.translateService.use(this.mfeRequestContext.languagePackage));
	}
}
