/*
 * Copyright (C) 2025 Acme Technologies, Inc.  All rights reserved.
 */
import '@angular/compiler';

describe('First Component', () => {
	const storiesCategory = 'components-first';

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

		it('should pass a test', () => {
			cy.get('p').should('exist');
		});
	});
});
