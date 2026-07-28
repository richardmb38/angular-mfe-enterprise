/*
 * Copyright (C) 2024 Acme Technologies, Inc.  All rights reserved.
 */
import { TestBed } from '@angular/core/testing';

import * as rxjs from 'rxjs';

import { TranslateService } from '@acme-priv/armada-angular/src/acme/angular/l10n/translation';

import { REQUEST_CONTEXT_DI_TOKEN } from '@acme-priv/ui-common/src/acme/angular/util/app-shell';

import { MfeTranslateHelper } from './mfe-translate-helper.service';

describe('MfeTranslateHelper', () => {
	let useSpy: jest.SpyInstance;
	let resize$: rxjs.Subject<never>;
	let mfeTranslateHelper: MfeTranslateHelper;

	beforeEach(() => {
		const translateServiceMock = { setDefaultLang: () => {}, use: () => {} } as unknown as TranslateService;
		TestBed.configureTestingModule({
			providers: [
				[MfeTranslateHelper],
				{ provide: TranslateService, useValue: translateServiceMock },
				{ provide: REQUEST_CONTEXT_DI_TOKEN, useValue: {} }
			]
		}).compileComponents();
		useSpy = jest.spyOn(translateServiceMock, 'use');
		mfeTranslateHelper = TestBed.inject(MfeTranslateHelper);
		resize$ = new rxjs.Subject<never>();

		Object.defineProperty(rxjs, 'lastValueFrom', { get: () => jest.fn(() => resize$) });
		jest.spyOn(rxjs, 'lastValueFrom').mockReturnValue(resize$ as never);
	});

	describe('MfeLoginHelper', () => {
		it('should instantiate the component', () => {
			expect(mfeTranslateHelper).toBeTruthy();
		});
		it('should call method use', () => {
			mfeTranslateHelper.initialize();
			expect(useSpy).toHaveBeenCalled();
		});
	});
});
