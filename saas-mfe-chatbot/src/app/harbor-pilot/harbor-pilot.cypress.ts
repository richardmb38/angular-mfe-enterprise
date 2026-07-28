/*
 * Copyright (C) 2024 Acme Technologies, Inc.  All rights reserved.
 */
import '@angular/compiler';

describe('Harbor Pilot Component', () => {
	const storiesCategory = 'harbor-pilot';

	before(() => {
		cy.visitStorybook();
	});

	describe('Default', () => {
		before(() => {
			cy.loadStory(storiesCategory, 'default');
		});

		it('should match image snapshot', () => {
			cy.matchScreenshot();
		});
	});
});
