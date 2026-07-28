/*
 * Copyright (C) 2023 Acme Technologies, Inc.  All rights reserved.
 */
import { FormControl } from '@angular/forms';

import { Observable, of } from 'rxjs';

import { mockBaseObject, mockImportObject } from '../models';
import { ConfigHubFieldValidators } from './config-hub-field-validators';

describe('ConfigHubFieldValidators', () => {
	describe('enforceValidJson', () => {
		const error = { admiralValidJson: { message: ConfigHubFieldValidators.INVALID_JSON_MESSAGE } };

		it('should return null for valid JSON', done => {
			const formControl = new FormControl(JSON.stringify(mockBaseObject));

			ConfigHubFieldValidators.enforceValidJson(formControl).then(resp => {
				expect(resp).toBeNull();
				done();
			});
		});

		it('should return an error for invalid JSON', done => {
			const formControl = new FormControl(JSON.stringify('invalid JSON string'));

			ConfigHubFieldValidators.enforceValidJson(formControl).then(resp => {
				expect(resp).toEqual(error);
				done();
			});
		});
	});

	describe('enforceOnlyObjectBlockChanges', () => {
		const error = { admiralValidJson: { message: ConfigHubFieldValidators.CHANGES_OUTSIDE_OBJECT_MESSAGE } };
		const jsonObject = JSON.stringify(mockImportObject);

		it('should return null when both JSONs are the same', done => {
			const formControl = new FormControl(jsonObject);
			const jsonObservable = of(jsonObject);

			const objectValidator = ConfigHubFieldValidators.enforceOnlyObjectBlockChanges(jsonObservable);

			(objectValidator(formControl) as Observable<any>).subscribe(resp => {
				expect(resp).toBeNull();
				done();
			});
		});

		it('should return null if changes are made to the object block only', done => {
			const formControl = new FormControl(jsonObject);
			const jsonObservable = of(
				JSON.stringify({ ...mockImportObject, object: { ...mockBaseObject, description: 'new description' } })
			);

			const objectValidator = ConfigHubFieldValidators.enforceOnlyObjectBlockChanges(jsonObservable);

			(objectValidator(formControl) as Observable<any>).subscribe(resp => {
				expect(resp).toBeNull();
				done();
			});
		});

		it('should return an error when changes are made outside the object block', done => {
			const formControl = new FormControl(jsonObject);
			const jsonObservable = of(JSON.stringify({ ...mockImportObject, version: 2 }));

			const objectValidator = ConfigHubFieldValidators.enforceOnlyObjectBlockChanges(jsonObservable);

			(objectValidator(formControl) as Observable<any>).subscribe(resp => {
				expect(resp).toEqual(error);
				done();
			});
		});
	});

	describe('enforceSameId', () => {
		const error = { admiralValidJson: { message: ConfigHubFieldValidators.ID_CHANGED_MESSAGE } };
		const jsonObject = JSON.stringify(mockImportObject);

		it('should return null when both ids have the same value', done => {
			const formControl = new FormControl(jsonObject);
			const jsonObservable = of(jsonObject);

			const objectValidator = ConfigHubFieldValidators.enforceSameId(jsonObservable, 'object');

			(objectValidator(formControl) as Observable<any>).subscribe(resp => {
				expect(resp).toBeNull();
				done();
			});
		});

		it('should return an error when both ids have different values', done => {
			const formControl = new FormControl(jsonObject);
			const jsonObservable = of(
				JSON.stringify({ ...mockImportObject, object: { ...mockBaseObject, id: 'other-id' } })
			);

			const objectValidator = ConfigHubFieldValidators.enforceSameId(jsonObservable, 'object');

			(objectValidator(formControl) as Observable<any>).subscribe(resp => {
				expect(resp).toEqual(error);
				done();
			});
		});

		it('should return an error if the id is removed', done => {
			// eslint-disable-next-line @typescript-eslint/no-unused-vars
			const { id, ...rest } = mockBaseObject;
			const formControl = new FormControl(jsonObject);
			const jsonObservable = of(JSON.stringify({ ...mockImportObject, object: { ...rest } }));

			const objectValidator = ConfigHubFieldValidators.enforceSameId(jsonObservable, 'object');

			(objectValidator(formControl) as Observable<any>).subscribe(resp => {
				expect(resp).toEqual(error);
				done();
			});
		});

		it('should return an error if the id is added', done => {
			// eslint-disable-next-line @typescript-eslint/no-unused-vars
			const { id, ...rest } = mockBaseObject;
			const formControl = new FormControl(JSON.stringify({ ...mockImportObject, object: { ...rest } }));
			const jsonObservable = of(jsonObject);

			const objectValidator = ConfigHubFieldValidators.enforceSameId(jsonObservable, 'object');

			(objectValidator(formControl) as Observable<any>).subscribe(resp => {
				expect(resp).toEqual(error);
				done();
			});
		});
	});
});
