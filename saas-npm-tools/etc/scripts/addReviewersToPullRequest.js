/*
 * Copyright (C) 2021 Acme Technologies, Inc.  All rights reserved.
 */
'use strict';

const githubUtils = require('../lib/githubUtils.js');
const commandLineUtils = require('../lib/commandLineUtils.js');

/**
 * Add reviwers to a pull request
 *
 * This is inteded to be part of a pull request builder (PRB) to add reviewers to a pull request
 * after certain validation is complete This script is expected to be run a package.json script.
 *
 * For example:
 *
 * npm run add-reviewers:pull-request
 *      --repoOwner=acme
 *      --repoName=cloud-ui-common
 *      --reviewers=andrew.ferguson (separate by commas for multiple)
 *      --teamReviewers=coe-ui-common-repos (separate by commas for multiple and should be the "slug")
 */

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

let reviewers = commandLineUtils.getArgument('reviewers'); // returns undefined if not found
let teamReviewers = commandLineUtils.getArgument('teamReviewers'); // returns undefined if not found

// Convert comma delimited list to an array for API call
reviewers = reviewers === undefined ? [] : reviewers.replace(/\s/g, '').split(',');

// Convert comma delimited list to an array for API call
teamReviewers = teamReviewers === undefined ? [] : teamReviewers.replace(/\s/g, '').split(',');

/**
 * If reviewers and/or teamReviewers are set to undefined, the default values within githubUtils.requestReviewers
 * will be assigned. There is logic within to not include them into the API call in this case
 */
githubUtils
	.requestReviewers(repoOwner, repoName, prNumber, reviewers, teamReviewers)
	.then(prData => {
		console.log(`------------------------------------------------------------------------\n`);
		console.log(`PR data: ${JSON.stringify(prData)} \n`);
		console.log(`------------------------------------------------------------------------\n`);

		const returnedReviewers = prData.hasOwnProperty('requested_reviewers')
			? prData.requested_reviewers.map(reveiwer => reveiwer.login.toLowerCase())
			: [];

		const returnedTeamReviewers = prData.hasOwnProperty('requested_teams')
			? prData.requested_teams.map(reveiwer => reveiwer.slug)
			: [];

		/**
		 * Check to ensure all reviewers added via the script are indeed returned by the Github API
		 * If a user is requested for a review more than once (duplicate) the Github API handles ignores the request
		 */
		const requestedReviewersMatch = reviewers.every(element => returnedReviewers.includes(element.toLowerCase()));
		const requestedTeamReviewersMatch = teamReviewers.every(element =>
			returnedTeamReviewers.includes(element.toLowerCase())
		);

		if (!requestedReviewersMatch) {
			throw new Error(
				`Something went wrong trying to assign reviewers to the pull request: ${prData.html_url}\n\n`
			);
		}
		if (!requestedTeamReviewersMatch) {
			throw new Error(
				`Something went wrong trying to assign team reviewers to the pull request: ${prData.html_url}\n\n`
			);
		}

		// Log when all the checkes passed and help debug problems.
		console.log(`Reviewers correctly added`);
	})
	.catch(error => {
		console.error(error);
		process.exit(1);
	});
