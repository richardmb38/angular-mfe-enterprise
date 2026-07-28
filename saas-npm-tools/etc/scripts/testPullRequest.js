/*
 * Copyright (C) 2021 Acme Technologies, Inc.  All rights reserved.
 */
'use strict';

const githubUtils = require('../lib/githubUtils.js');
const commandLineUtils = require('../lib/commandLineUtils.js');

/**
 * Test pull request titles.
 *
 * This is intended to be part of a pull request builder (PRB) to validate that pull request titles follow
 * our conventions. This script is expected to be run a package.json script. For example
 *
 * npm run test:pull-request --pullRequest=42
 */

// Regex to validate that the title includes a JIRA ticket, i.e. title starts with "JIRA-1234:"
const JIRA_REGEX = /^[A-Z]+-[0-9]+:/;

// Regex to validate that the PR title includes semver label, i.e. includes [MAJOR|MINOR|PATCH]" following
// the jira ticket
const SEMVER_REGEX = /^[A-Z]+-[0-9]+:\s*\[((MAJOR)|(MINOR)|(PATCH))\]/;

// Retrieve the command line arguments
const repoOwner = commandLineUtils.getRequiredArgument(
	'repoOwner',
	'Unable to validate the pull request because no repository owner was provided, Please provide --repoOwner=acme as an example.'
);
const repoName = commandLineUtils.getRequiredArgument(
	'repoName',
	'Unable to validate the pull request because no repository name was provided, Please provide --repoName=saas-npm-tools as an example.'
);
const prNumber = commandLineUtils.getRequiredArgument(
	'pullRequest',
	'Unable to validate the pull request because no pull request number was provided, Please provide --pullRequest=42 as an example.'
);
const requireSemver = commandLineUtils.getArgument('requireSemver');

// Retrieve the title for the pull request (top level await isn't supported in node as of version 14)
githubUtils
	.getPullRequestTitle(repoOwner, repoName, prNumber)
	// prTitle receive the pull request title and the title for the first commit when the pull request only have one commit
	.then(prTitles => {
		const prTitle = prTitles[0];
		const commitTitle = prTitles[1];
		if (!commitTitle) {
			validatePrTtitle(prTitle, true);
		} else {
			validatePrTtitle(prTitle, true);
			validatePrTtitle(commitTitle, false);
		}

		function validatePrTtitle(title, typeMessage) {
			if (!prTitle) {
				throw new Error(`Pull Request title not found for pull request ${prNumber}`);
			}
			// Validate that the pull request title includes a jira ticket.
			if (!title.match(JIRA_REGEX)) {
				if (typeMessage) {
					throw new Error(
						`The Pull Request title is missing a jira ticket.\n\nAll Pull Request  titles must start with a Jira ticket followed by a colon. For exmaple "JIRA-1234: Adds an awesome new feature". This was not found in the title "${title}".\n\nFollow Armada's guidelines for pull request:\n  https://armada.acme.com/index.html?path=/story/guides-pull-request-guidelines--page\n\n`
					);
				} else {
					throw new Error(
						`The Commit title is missing a jira ticket.\n\nWhen the Pull Request has only one Commit, the title of this  must start with a Jira ticket followed by a colon. For exmaple "JIRA-1234: Adds an awesome new feature". To fix it just do another commit.\n\nFollow Armada's guidelines for pull request:\n  https://armada.acme.com/index.html?path=/story/guides-pull-request-guidelines--page\n\n`
					);
				}
			}

			// Validate that the pull request title includes semver label.
			if (requireSemver && !title.match(SEMVER_REGEX)) {
				if (typeMessage) {
					throw new Error(
						`The Pull Request title is missing a semver version.\n\nPull Request titles must include a semver level after the jira ticket. For example "JIRA-1234: [MAJOR] Adds an awesome new backwards incompatable feature". This was not found in the title "${title}".\n\nFollow Armada's guidelines for semver versioning:\n  https://armada.acme.com/index.html?path=/story/guides-pull-request-guidelines--page\n\n`
					);
				} else {
					throw new Error(
						`The Commit title is missing a semver version\n\nWhen Pull Request has only one Commit, the title must include a semver level after the jira ticket. For example "JIRA-1234: [MAJOR] Adds an awesome new backwards incompatable feature". To fix it just do another commit.\n\nFollow Armada's guidelines for semver versioning:\n  https://armada.acme.com/index.html?path=/story/guides-pull-request-guidelines--page\n\n`
					);
				}
			}
		}

		// Log when all the checkes passed and help debug problems.
		console.log(`The pull request title "${prTitle}" is valid.`);
	})
	.catch(error => {
		console.error(error);
		process.exit(1);
	});
