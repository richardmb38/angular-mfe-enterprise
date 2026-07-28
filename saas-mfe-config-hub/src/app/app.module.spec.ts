/*
 * Copyright (C) 2024 Acme Technologies, Inc.  All rights reserved.
 */
import { TestBed } from '@angular/core/testing';

import { AppModule } from './app.module';

describe('AppModule', () => {
	let module: AppModule;

	beforeEach(() => {
		TestBed.configureTestingModule({
			providers: [AppModule]
		});
		module = TestBed.inject(AppModule);
	});
	it('should instantiate module', () => {
		expect(module).toBeTruthy();
	});
});
