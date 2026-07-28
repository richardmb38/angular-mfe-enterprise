/*
 * Copyright (C) 2023 Acme Technologies, Inc.  All rights reserved.
 */
import { TestBed } from '@angular/core/testing';

import { BackupsTagService } from './backups.tag.service';

describe('BackupsTagService', () => {
	let service: BackupsTagService;

	beforeEach(() => {
		service = TestBed.inject(BackupsTagService);
	});

	it('should be created', () => {
		expect(service).toBeTruthy();
	});

	describe('validate', () => {
		it('should throw errors in duplicates', done => {
			const isValid = service.validate('test', [{ displayName: 'test', data: { value: 'test' } }]);
			isValid.pipe().subscribe(error => {
				expect(error.addDuplicateError.message).toEqual('CONFIG_HUB.ERROR_REPEATED_TAGS');
				done();
			});
		});

		it('should not throw errors on empty tags', done => {
			const isValid = service.validate('test', []);
			isValid.pipe().subscribe(error => {
				expect(error.addDuplicateError).not.toBeDefined();
				done();
			});
		});
	});

	describe('getNewTagObject', () => {
		it('should update values with untranslated and data value', () => {
			const newValue = 'test';
			const newObject = service.getNewTagObject(newValue);
			const mockObject = {
				displayName: { untranslated: newValue },
				data: {
					value: newValue
				}
			};

			expect(newObject).toEqual(mockObject);
		});
	});

	describe('normalize', () => {
		it('return same value', done => {
			const testValue = 'test';
			const isValid = service.normalize(testValue);
			isValid.pipe().subscribe(value => {
				expect(value).toEqual(testValue);
				done();
			});
		});
	});
});
