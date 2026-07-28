/*
 * Copyright (C) 2023 Acme Technologies, Inc.  All rights reserved.
 */
import { ApiUrls } from '../config-hub.mock';
import { mockConfigHubBackupJobSummary } from '../shared/models/config-hub-backup-job-summary.mock';
import { ConfigHubJobStatus } from '../shared/models/config-hub-job-status.model';
import { ConfigHubJobType } from '../shared/models/config-hub-job-type.model';
import { createMockConfigHubJobs } from '../shared/models/create-mock-config-hub-jobs.mock';
import { mockConfigHubObjectTypes } from '../shared/models/object-types.mock';
import { executeStoriesImageTests } from '@acme/armada/cypress';

const mockBackup = {
	...createMockConfigHubJobs(1, ConfigHubJobType.BACKUP, 'NOT_STARTED' as ConfigHubJobStatus)[0],
	name: 'New backup'
};

const completedBackup = {
	...mockBackup,
	status: 'COMPLETE' as ConfigHubJobStatus
};

describe('Config Hub Backup List', { testIsolation: true }, () => {
	const storiesCategory = 'configuration-hub-backup-list-stories';

	beforeEach(() => {
		cy.visitStorybook();
	});

	executeStoriesImageTests(storiesCategory, ['default', 'with-no-data-model'], { waitTime: 2000, threshold: 0.3 });

	describe('Create and delete backup job', () => {
		beforeEach(() => {
			cy.intercept({ url: `**/${ApiUrls.backups}`, method: 'POST' }, req => req.reply(mockBackup)).as(
				'createBackupJob'
			);
			cy.intercept({ url: `**/${ApiUrls.completedBackups}`, method: 'GET' }, [completedBackup]);
			cy.intercept(
				{
					url: `**/${ApiUrls.backups}/${mockBackup.jobId}`,
					method: 'GET'
				},
				{
					body: completedBackup,
					statusCode: 200
				}
			);
			cy.intercept(
				{
					url: `**/${ApiUrls.configObjects}`,
					method: 'GET'
				},
				{
					body: mockConfigHubObjectTypes,
					statusCode: 200
				}
			);
			cy.intercept(
				{ times: 1, method: 'GET', url: `**/${ApiUrls.backups}/${mockBackup.jobId}` },
				{
					body: {
						...mockBackup,
						status: 'IN_PROGRESS' as ConfigHubJobStatus
					},
					statusCode: 200
				}
			);
			cy.disableApiInterceptor();
			cy.loadStory(storiesCategory, 'with-no-data-model');
		});

		it('should create a backup and wait until its status is COMPLETE', () => {
			cy.findByText('Create Backup', { timeout: 20000 }).click();
			cy.findByLabelText('Backup Name').type(mockBackup.name);

			cy.get('slpt-checkbox-input input').eq(0).click({ force: true });

			cy.get('slpt-overlay-content').findByRole('button', { name: 'Create Backup' }).click();
			cy.wait('@createBackupJob');
			cy.findByText('Backup in Progress').as('inProgressAlert');

			cy.get('@inProgressAlert').should('be.visible');
			cy.wait(5000);
			cy.get('@inProgressAlert').should('not.exist');

			cy.findByText('Manual Backup Complete').parent().as('successAlert');
			cy.get('@successAlert').should('be.visible');
			cy.get('@successAlert').contains(mockBackup.name);

			cy.findByText(
				'This list includes both automated and manual configuration backups. 1 of your 10 available manual backups are in use.'
			).should('be.visible');
		});

		it('should delete the created backup', () => {
			cy.intercept(
				{
					url: `**/${ApiUrls.backups}/${mockBackup.jobId}`,
					method: 'DELETE'
				},
				{ statusCode: 200 }
			).as('deleteBackupJob');

			cy.findByLabelText('Open dropdown', { timeout: 20000 }).should('be.visible').click();
			cy.findByRole('menuitem', { name: 'Delete' }).click();
			cy.get('footer').findByRole('button', { name: 'Delete' }).click();
			cy.wait('@deleteBackupJob');

			cy.verifySuccessAlertExist();
			cy.findByText('Use the Create New button to initiate a backup for this tenant.').should('be.visible');
			cy.findByText(
				'This list includes both automated and manual configuration backups. 0 of your 10 available manual backups are in use.'
			).should('be.visible');
		});
	});

	describe('Maximum backups', () => {
		beforeEach(() => {
			const mockedBackups = createMockConfigHubJobs(15, ConfigHubJobType.BACKUP);
			cy.intercept({ url: `**/${ApiUrls.completedBackups}`, method: 'GET' }, mockedBackups);
			cy.disableApiInterceptor();
			cy.loadStory(storiesCategory, 'default');
		});

		it('should disable "Create New" button when list reached maximum number of backups', () => {
			cy.findByText('Create Backup', { timeout: 20000 }).parent().should('have.class', 'slpt-btn--disabled');
		});
	});

	describe('Backup Summary', () => {
		beforeEach(() => {
			cy.intercept({ url: `**/${ApiUrls.completedBackups}`, method: 'GET' }, [mockConfigHubBackupJobSummary]);
			cy.intercept(
				{ url: `**/${ApiUrls.backups}/${mockConfigHubBackupJobSummary.jobId}/summary` },
				mockConfigHubBackupJobSummary
			);
			cy.disableApiInterceptor();
			cy.loadStory(storiesCategory, 'with-no-data-model');
		});

		it('should display overlay with backup summary', () => {
			cy.findByLabelText('Open dropdown', { timeout: 20000 }).click();
			cy.findByRole('menuitem', { name: 'View Summary' }).click();
			cy.get('slpt-overlay')
				.should('be.visible')
				.should('include.text', mockConfigHubBackupJobSummary.name)
				.get('slpt-data-grid')
				.should('be.visible');
		});
	});
});
