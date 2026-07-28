/*
 * Copyright (C) 2023 Acme Technologies, Inc.  All rights reserved.
 */
import { Injectable } from '@angular/core';

import { GlobalService } from '@acme-priv/ui-common/src/acme/angular/util';
import { AppShellWrapperService, MfeContextData } from '@acme-priv/ui-common/src/acme/angular/util/app-shell';

import { GlobalValue } from './globals.models';

/**
 * An adapter to provide backwards compatibility and an easy to change shim layer for GlobalService migration
 * to MFE's. Note that we do not implement GlobalService because this is intended as an read-only, source agnostic, data
 * source for global values, regardless of where those global values may reside.
 * @deprecated Use `AppShellWrapperService.getMfeContextV1` instead to access global values.
 */
@Injectable({ providedIn: 'root' })
export class LegacyGlobalServiceAdapter {
	private isMFE: boolean;

	private mfeContext: Readonly<MfeContextData>;

	private contextMap = new Map<string, () => any>([
		[GlobalValue.BaseUrl, this.getBaseUrl],
		[GlobalValue.OrgScriptName, this.getOrgScriptName],
		[GlobalValue.Locales, this.getLocales],
		[GlobalValue.ApiBaseUrl, this.getApiBaseUrl]
	]);

	constructor(
		private appShellWrapperService: AppShellWrapperService,
		private globalService: GlobalService
	) {
		this.init();
	}

	/**
	 * Initialize the LegacyGlobalServiceAdapter to load it's asynchronous MFE context.
	 * The service is initialized when constructed, but this provides a promise for initialization
	 * to be awaited if needed by consumers.
	 */
	public async init() {
		if (this.appShellWrapperService.isMFE()) {
			this.isMFE = true;
			if (!this.mfeContext) {
				this.mfeContext = await this.appShellWrapperService.getMfeContextV1();
			}
		}
	}

	/**
	 * Get a global setting from either the UI Module GlobalService or the MFE context,
	 * depending on which configuration the app is running in.
	 * `get` is intended to be an adapter provided to existing GlobalService implementations
	 * for backwards compatibility.
	 * @param name The name of the global setting to get
	 * @returns T, any type, value of the global setting
	 * @deprecated Use `AppShellWrapperService.getMfeContextV1` instead to access global values. See migration notes here:
	 * https://acme.atlassian.net/wiki/spaces/PLAT/pages/2000063759/How-to+migrate+UI+modules+to+MFE+world#Replace-all-GlobalService-usages
	 */
	public get<T>(name: string | GlobalValue): T {
		const fn = this.contextMap.get(name);

		if (!fn) {
			throw new Error(`Attempted to get value ${name}, but a mapping does not exist for that value.`);
		}

		return fn.bind(this)();
	}

	/**
	 * Serves the appropriate global value for baseUrl
	 * @returns The baseUrl of the Admiral MFE module
	 */
	private getBaseUrl(): string {
		if (this.isMFE) {
			return this.mfeContext.requestContext.appShellBaseUrl;
		}

		return this.globalService.get(GlobalValue.BaseUrl);
	}

	/**
	 * Serves the appropriate global value for orgScriptName
	 * @returns orgScriptName
	 */
	private getOrgScriptName(): string {
		if (this.isMFE) {
			return this.mfeContext.tenantContext.scriptName;
		}

		return this.globalService.get(GlobalValue.OrgScriptName);
	}

	/**
	 * Serves the appropriate global value for locales
	 * @returns locales
	 */
	private getLocales(): string[] {
		if (this.isMFE) {
			return this.mfeContext.requestContext.locales;
		}

		return this.globalService.get(GlobalValue.Locales);
	}

	/**
	 * Serves the appropriate global value for api.baseUrl
	 * Note that this is NOT a replacement for GlobalService.get('api')
	 * @returns IDN api url
	 */
	private getApiBaseUrl(): string {
		if (this.isMFE) {
			return this.mfeContext.authContext.apiUrl.idn;
		}

		return this.globalService.get('api').baseUrl;
	}
}
