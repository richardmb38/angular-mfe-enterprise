/*
 * Copyright (C) 2024 Acme Technologies, Inc.  All rights reserved.
 */
import { TestBed } from '@angular/core/testing';

import { StoreModule } from './store.module';

describe('StoreModule', () => {
	let module: StoreModule;
	beforeEach(() => {
		module = TestBed.configureTestingModule({ providers: [StoreModule] });
	});
	it('should instantiate module', () => {
		expect(module).toBeTruthy();
	});
});
