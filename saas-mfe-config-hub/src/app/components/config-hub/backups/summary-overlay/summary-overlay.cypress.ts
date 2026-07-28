/*
 * Copyright (C) 2023 Acme Technologies, Inc.  All rights reserved.
 */
import { ApiUrls } from '../../config-hub.mock';
import { mockConfigHubBackupJobSummary } from '../../shared/models/config-hub-backup-job-summary.mock';

// This test will be fixed and re-eanbled by jira - https://acme.atlassian.net/browse/UITEST-243
// Enable in https://acme.atlassian.net/browse/PLTIN-4784
describe('Config Hub Summary Overlay', () => {
	const storiesCategory = 'configuration-hub-summary-overlay-stories';

	before(() => {
		cy.visitStorybook();
	});

	// TODO: Need to fix flaky test in PLTUIFEAT-917
	// executeStoriesImageTests(storiesCategory, ['default']);

	describe('Summary grid', () => {
		before(() => {
			cy.loadStory(storiesCategory, 'default');
			cy.disableApiInterceptor();
			cy.intercept(
				{
					method: 'GET',
					url: `**/${ApiUrls.backupSummary(mockConfigHubBackupJobSummary.jobId)}`
				},
				mockConfigHubBackupJobSummary
			);
		});

		// This test will be fixed and re-eanbled by jira -
		it.skip('should display backup summary', () => {
			cy.get('slpt-overlay-header')
				.findByText(mockConfigHubBackupJobSummary.name)
				.should('be.visible')
				.should('have.css', 'font-weight', '700');
			cy.get('slpt-overlay-header')
				.findByText(mockConfigHubBackupJobSummary.totalObjectCount)
				.should('be.visible')
				.parent()
				.findByText('Total Objects:')
				.should('be.visible');
			const summaryGrid = cy.get('app-config-hub-backup-summary-grid');
			summaryGrid.get('.ag-header-cell').eq(0).findByText('Object').should('be.visible');
			summaryGrid.get('.ag-header-cell').eq(1).findByText('Count').should('be.visible');

			Object.keys(mockConfigHubBackupJobSummary.objectBreakdown).forEach(key => {
				summaryGrid
					.get(`[row-id="${key}"]`)
					.should('contain', key)
					.and('contain', mockConfigHubBackupJobSummary.objectBreakdown[key]);
			});
		});
	});
});
