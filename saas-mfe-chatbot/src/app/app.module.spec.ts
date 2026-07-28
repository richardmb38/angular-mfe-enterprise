/*
 * Copyright (C) 2024 Acme Technologies, Inc.  All rights reserved.
 */
import { TestBed } from '@angular/core/testing';

import { AppModule } from './app.module';
import { MarkdownModule } from 'ngx-markdown';

describe('AppModule', () => {
	let module: AppModule;

	beforeEach(() => {
		TestBed.configureTestingModule({
			imports: [MarkdownModule.forRoot()],
			providers: [[AppModule]]
		});
		module = TestBed.inject(AppModule);
	});
	it('should instantiate module', () => {
		expect(module).toBeTruthy();
	});
});
