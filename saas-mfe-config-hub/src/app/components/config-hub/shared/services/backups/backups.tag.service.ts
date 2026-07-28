/*
 * Copyright (C) 2023 Acme Technologies, Inc.  All rights reserved.
 */
import { Injectable } from '@angular/core';
import { ValidationErrors } from '@angular/forms';

import { Observable, of } from 'rxjs';

import { TagService } from '@acme-priv/armada-angular/src/acme/angular/components/form';
import { Tag } from '@acme-priv/armada-angular/src/acme/angular/components/tag';

/**
 * @name BackupsTagService
 * @description Backups TagService
 */
@Injectable({ providedIn: 'root' })
export class BackupsTagService extends TagService {
	/**
	 * Validation error to return when tag value has whitespace
	 */
	public static readonly validateDuplicateError = {
		addDuplicateError: {
			message: 'CONFIG_HUB.ERROR_REPEATED_TAGS'
		}
	};

	/**
	 * Normalizes string if needed
	 * @param {string} value - The text input value to normalize
	 */
	public normalize(value: string): Observable<string> {
		return of(value);
	}

	/**
	 * Returns a validation error if the tag value has any
	 * @param {string} value - Tag to be added
	 * @param {Array<Tag>} tags - Array of current tags
	 */
	public validate(value: string, tags: Array<Tag> = []): Observable<ValidationErrors> {
		if (this.tagExists(value, tags)) {
			return of(BackupsTagService.validateDuplicateError);
		}

		return of({});
	}

	/**
	 * Returns a list of suggested tags
	 */
	public getSuggestions(): Observable<Array<Tag>> {
		return of();
	}

	/**
	 * Returns a tag object with the untranslated value
	 * @param {string} value - display value for the tag.
	 */
	public getNewTagObject(value: string): Tag {
		return {
			displayName: { untranslated: value },
			data: {
				value
			}
		};
	}

	/**
	 * Determines if the display name of some tag already exist according parameters sent
	 */
	private tagExists(value: string, tags: Array<Tag> = []): boolean {
		return tags.some(tag => tag.data.value === value);
	}
}
