/*
 * Copyright (C) 2025 Acme Technologies, Inc.  All rights reserved.
 */
import { TestBed } from '@angular/core/testing';

import { FirstModule } from './first.module';

describe('FirstModule', () => {
	let module: FirstModule;

	beforeEach(() => {
		TestBed.configureTestingModule({
			providers: [FirstModule]
		});
		module = TestBed.inject(FirstModule);
	});

	it('should instantiate module', () => {
		expect(module).toBeTruthy();
	});
});
