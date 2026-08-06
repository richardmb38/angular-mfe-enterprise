/*
 * Copyright (C) 2024 Acme Technologies, Inc.  All rights reserved.
 */
import { APP_BASE_HREF } from '@angular/common';
import { APP_INITIALIZER } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { RouterModule } from '@angular/router';

import { TranslateLoader, TranslateModule } from '@ngx-translate/core';

import { TranslateStaticLoader } from '@acme-priv/armada-angular/src/acme/angular/l10n/translate-static-loader';

import { AppRoutingModule } from './app-routing.module';
import { AppInitializerFactory, AppModule } from './app.module';
import { MfeTranslateHelper } from './shared/services/translate/mfe-translate-helper.service';

describe('AppModule', () => {
	let module: AppModule;
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
				}),
				RouterModule,
				AppRoutingModule
			],
			providers: [
				[AppModule],
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
		module = TestBed.inject(AppModule);
	});
	it('should instantiate module', () => {
		expect(module).toBeTruthy();
	});
	it('should call the initialize method from mfeTranslateHelper ', () => {
		expect(initializeSpy).toHaveBeenCalled();
	});
});
