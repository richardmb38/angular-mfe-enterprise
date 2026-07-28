/*
 * Copyright (C) 2023 Acme Technologies, Inc.  All rights reserved.
 */
import { AbstractControl, AsyncValidatorFn, ValidationErrors } from '@angular/forms';

import { Observable, map, take } from 'rxjs';

import { FieldValidators } from '@acme-priv/armada-angular/src/acme/angular/components/form';
import { Message } from '@acme-priv/armada-angular/src/acme/angular/l10n/translation';

import { isValidJson } from './config-hub.utils';

export class ConfigHubFieldValidators extends FieldValidators {
	/**
	 * Error message for an invalid json expression.
	 */
	static readonly INVALID_JSON_MESSAGE = 'CONFIG_HUB.NOT_A_VALID_JSON_EXPRESSION';

	/**
	 * Error message for when the id doesn't match the original.
	 */
	static readonly ID_CHANGED_MESSAGE = 'CONFIG_HUB.OBJECT_ID_CANNOT_BE_EDITED_OR_REMOVED';

	/**
	 * Error message for when there's been a change outside the 'object' block
	 */
	static readonly CHANGES_OUTSIDE_OBJECT_MESSAGE = 'CONFIG_HUB.CHANGES_OUTSIDE_OBJECT_BLOCK_NOT_ALLOWED';

	/**
	 * Name of the identifier field to validate in the json objects.
	 */
	static readonly ID_FIELD_NAME = 'id';

	/**
	 * Validator that requires controls with a file input have a file containing valid JSON.
	 *
	 * @param control - The form control to validate.
	 * @param message - The translation key for the error message to show. Defaults to CONFIG_HUB.NOT_A_VALID_JSON_EXPRESSION.
	 * @returns {Promise} - A promise that resolves null if the control is valid, otherwise an object containing an error message.
	 */
	static enforceValidJson(
		control: AbstractControl,
		message: Message = ConfigHubFieldValidators.INVALID_JSON_MESSAGE
	): Promise<{ [key: string]: any }> {
		return new Promise(resolve => {
			const validationObject = {
				admiralValidJson: {
					message: message
				}
			};
			resolve(isValidJson(control.value) ? null : validationObject);
		});
	}

	/**
	 * Validator that checks if the id is the same as in the original json
	 *
	 * @param {Observable<string>} originalJson$ - An observable containing the original json.
	 * @param {string} property - The object property to which the validation will be applied
	 * @returns {AsyncValidatorFn} - The async validation function
	 */
	static enforceSameId(originalJson$: Observable<string>, property: string): AsyncValidatorFn {
		return (
			control: AbstractControl,
			message: Message = ConfigHubFieldValidators.ID_CHANGED_MESSAGE
		): Observable<ValidationErrors | null> => {
			const validationObject = {
				admiralValidJson: {
					message: message
				}
			};
			return originalJson$.pipe(
				take(1),
				map(json => {
					try {
						const oldJson = json ? JSON.parse(json) : null;
						const newJson = control.value ? JSON.parse(control.value) : null;

						const newJsonId = newJson?.[property]?.[ConfigHubFieldValidators.ID_FIELD_NAME];
						const oldJsonId = oldJson?.[property]?.[ConfigHubFieldValidators.ID_FIELD_NAME];

						if (oldJsonId && newJsonId) {
							// if oldJsonId and newJsonId exist and are equal, return null,
							// if both exist but are different, return an error
							return oldJsonId === newJsonId ? null : validationObject;
						} else {
							// if neither oldJsonId or newJsonId exist, return null,
							// otherwise return an error since one of them exists and the other doesn't
							return !oldJsonId && !newJsonId ? null : validationObject;
						}
					} catch (e) {
						// Skip validation if there's an error parsing the json
						return null;
					}
				})
			);
		};
	}

	/**
	 * Validator that checks if the id is the same as in the original json
	 *
	 * @param {Observable<string>} originalJson$ - An observable containing the original json.
	 * @returns {AsyncValidatorFn} - The async validation function
	 */
	static enforceOnlyObjectBlockChanges(originalJson$: Observable<string>): AsyncValidatorFn {
		return (
			control: AbstractControl,
			message: Message = ConfigHubFieldValidators.CHANGES_OUTSIDE_OBJECT_MESSAGE
		): Observable<ValidationErrors | null> => {
			const validationObject = {
				admiralValidJson: {
					message: message
				}
			};
			return originalJson$.pipe(
				take(1),
				map(json => {
					try {
						const oldJson = json ? JSON.parse(json) : null;
						const newJson = control.value ? JSON.parse(control.value) : null;

						delete oldJson?.object;
						delete newJson?.object;

						const newJsonString = JSON.stringify(oldJson);
						const oldJsonString = JSON.stringify(newJson);

						return newJsonString === oldJsonString ? null : validationObject;
					} catch (e) {
						// Skip validation if there's an error parsing the json
						return null;
					}
				})
			);
		};
	}
}
