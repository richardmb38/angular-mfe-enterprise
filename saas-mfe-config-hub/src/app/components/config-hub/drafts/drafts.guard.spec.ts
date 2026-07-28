/*
 * Copyright (C) 2023 Acme Technologies, Inc.  All rights reserved.
 */
import { TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';

import { TranslateModule } from '@acme-priv/armada-angular/src/acme/angular/l10n/translation';
import { UnsavedChangesWarningService } from '@acme-priv/armada-angular/src/acme/angular/util/unsaved-changes-warning';

import { ConfigHubDraftsComponent } from './drafts.component';
import { ConfigHubDraftsGuard } from './drafts.guard';

const mockUnsavedChangesWarningService = {
	promptToAbandonUnsavedChanges: () => {}
};

describe('ConfigHubDraftsGuard', () => {
	let configHubDraftsGuard: ConfigHubDraftsGuard;
	let unsavedChangesWarningService: UnsavedChangesWarningService;

	beforeEach(() => {
		TestBed.configureTestingModule({
			imports: [RouterTestingModule, TranslateModule.forRoot()],
			providers: [{ provide: UnsavedChangesWarningService, useValue: mockUnsavedChangesWarningService }]
		}).compileComponents();

		configHubDraftsGuard = TestBed.inject(ConfigHubDraftsGuard);
		unsavedChangesWarningService = TestBed.inject(UnsavedChangesWarningService);
	});

	describe('canDeactivate()', () => {
		it('should call promptToAbandonUnsavedChanges', () => {
			const promptToAbandonUnsavedChangesSpy = jest.spyOn(
				unsavedChangesWarningService,
				'promptToAbandonUnsavedChanges'
			);
			configHubDraftsGuard.canDeactivate();

			expect(promptToAbandonUnsavedChangesSpy).toHaveBeenCalledWith(ConfigHubDraftsComponent);
		});
	});
});
