/*
 * Copyright (C) 2024 Acme Technologies, Inc.  All rights reserved.
 */
import { APP_BASE_HREF } from '@angular/common';
import { APP_INITIALIZER, Injector } from '@angular/core';
import { TestBed } from '@angular/core/testing';

import { TranslateLoader, TranslateModule } from '@ngx-translate/core';

import { TranslateHttpLoader } from '@acme-priv/armada-angular/src/acme/angular/l10n/translate-http-loader';
import { TranslateStaticLoader } from '@acme-priv/armada-angular/src/acme/angular/l10n/translate-static-loader';

import { MfeInfoService } from '@acme-priv/ui-common/src/acme/angular/util/app-shell';

import { AppInitializerFactory, AppMfeModule, BaseRefFactory, TranslateHttpLoaderFactory } from './app-mfe.module';
import { MfeTranslateHelper } from './shared/services/translate/mfe-translate-helper.service';

describe('AppMfeModule', () => {
	let module: AppMfeModule;
	let initializeSpy: jest.SpyInstance;

	beforeEach(() => {
		const mfeTranslateHelperMock = { initialize: () => {} } as unknown as MfeTranslateHelper;
		initializeSpy = jest.spyOn(mfeTranslateHelperMock, 'initialize');
		TestBed.configureTestingModule({
			imports: [
				TranslateModule.forRoot({
					loader: {
						provide: TranslateLoader,
						useClass: TranslateStaticLoader
					}
				})
			],
			providers: [
				[AppMfeModule],
				{
					provide: APP_BASE_HREF,
					useValue: '/'
				},
				{
					provide: MfeTranslateHelper,
					useValue: mfeTranslateHelperMock
				},

				{
					provide: APP_INITIALIZER,
					useFactory: AppInitializerFactory,
					deps: [MfeTranslateHelper],
					multi: true
				}
			]
		});
		module = TestBed.inject(AppMfeModule);
	});
	it('should instantiate module', () => {
		expect(module).toBeTruthy();
	});

	it('should call the initialize method from mfeTranslateHelper ', () => {
		expect(initializeSpy).toHaveBeenCalled();
	});

	describe('TranslateHttpLoaderFactory', () => {
		it('should create a TranslateHttpLoader instance', () => {
			const injectorMock = {} as Injector;
			const mfeInfoServiceMock = {
				makeAssetUrl: jest.fn().mockReturnValue('language-package{lang}.json')
			} as unknown as MfeInfoService;
			const translateHttpLoader = TranslateHttpLoaderFactory(injectorMock, mfeInfoServiceMock);
			expect(translateHttpLoader).toBeInstanceOf(TranslateHttpLoader);
			expect(mfeInfoServiceMock.makeAssetUrl).toHaveBeenCalledWith('language-package{lang}.json', '');
		});
	});
	describe('BaseRefFactory', () => {
		it('should return the base reference URL', () => {
			const mfeInfoServiceMock = {
				trimSlashes: jest.fn().mockReturnValue('mfe-route'),
				route: 'mfe-route'
			} as unknown as MfeInfoService;
			const baseRef = BaseRefFactory(mfeInfoServiceMock);
			expect(baseRef).toBe('/mfe-route/');
			expect(mfeInfoServiceMock.trimSlashes).toHaveBeenCalledWith('mfe-route');
		});
	});
});
