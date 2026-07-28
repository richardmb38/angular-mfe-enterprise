/*
 * Copyright (C) 2023 Acme Technologies, Inc.  All rights reserved.
 */
'use strict';

const githubCommentService = require('../lib/util/githubCommentService.js');
const commandLineUtils = require('../lib/commandLineUtils.js');
const slptConfig = require('../lib/configUtils');

/**
 * Adds demo links to a pull request description.
 *
 * This is inteded to be part of a pull request builder (PRB) which will deploy the latest changes on this PR to commonly
 * used pods for manual testing. Once deployed, this script will update the PR with a comment containing links to orgs
 * with a build number that can be used for manual verification.
 *
 * This will ensure that developers always have a build link that is up to date with the latest changes on the PR.
 *
 * This script assumes:
 * - The provided buildNumber has already been deployed and installed on all orgs provided in the "demos" parameter.
 * - If no "demos" are provided, we default to snoopy on megapod-useast1.
 * - The provided repository's package.json "acme" section has a base url we can use to generate demos. Otherwise, no
 * links are added to the PR.
 *
 * Examples:
 * npm run pr:demo-links
 * 		--repoOwner=acme
 * 		--repoName=cloud-ui-auth
 * 		--pullRequest=42
 * 		--buildNumber=testBuild
 * 		--demos=megapod-useast1:snoopy,stradbroke:gov-ui-strad
 * 		--demoStorybook
 *
 * The above command will attempt to update pull request 42 in the cloud-ui-auth repository with demo links using `testBuild` and
 * the provided demo pod:org mappings. The resulting links on the PR would be as follows:
 * MEGAPOD-USEAST1: https://snoopy.identitysoon.com/login/login?ui=testBuild
 * STRADBROKE: https://gov-ui-strad.identitysoon.com/login/login?ui=testBuild
 *
 */

// Retrieve the command line arguments
const repoOwner = commandLineUtils.getRequiredArgument(
	'repoOwner',
	'Unable to add demo links to pull request because no repository owner was provided, Please provide --repoOwner=acme as an example.'
);
const repoName = commandLineUtils.getRequiredArgument(
	'repoName',
	'Unable to add demo links to pull request because no repository name was provided, Please provide --repoName=cloud-ui-auth as an example.'
);
const prNumber = commandLineUtils.getRequiredArgument(
	'pullRequest',
	'Unable to add demo links to pull request because no pull request number was provided, Please provide --pullRequest=42 as an example.'
);
const buildNumber = commandLineUtils.getRequiredArgument(
	'buildNumber',
	'Unable to add demo links to pull request because no demo buildNumber was provided, Please provide --buildNumber=IDNHUSKY1234 as an example.'
);

// If no demo pod/org information is provided, default to snoopy on megapod
const demos = commandLineUtils.getArgument('demos') || 'megapod-useast1:snoopy';
const demoStorybook = commandLineUtils.getArgument('demoStorybook');

async function addDemoLinksToPR() {
	console.log('>>> Adding Demo Links to PR <<<\n\n');
	let demoLinksContentString = '\n### Automated Demo Links\n';

	const demoUrlString = slptConfig.getModuleDemoUrl();
	if (!demoStorybook && !demoUrlString) {
		console.log(
			'No module demo url was found for this repo and `demoStorybook` option was not specified.\n\nNo demo links will be added to the PR.'
		);
		return;
	}

	if (demoUrlString) {
		const demosArray = demos.split(',');

		// Construct demo links for each pod:org provided
		for (let i = 0; i < demosArray.length; i++) {
			const podName = demosArray[i].split(':')[0];
			const orgName = demosArray[i].split(':')[1];
			const demoUrlForOrg = demoUrlString.replace('{orgName}', orgName).replace('{buildNumber}', buildNumber);
			demoLinksContentString += `${podName.toUpperCase()}: ${demoUrlForOrg}\n`;
		}
	} else {
		console.log('No module demo url found for this repo. Module demo links will not be added to PR.');
	}

	// Craft storybook demo link using deploy configs in package.json
	if (demoStorybook) {
		const deployConfig = slptConfig.getDeployConfig();
		const deployContinuousConfig = slptConfig.getDeployContinuousConfig();
		const endOfUrl = deployContinuousConfig.srcFolder.includes('storybook') ? 'storybook/index.html' : 'index.html';
		const storybookDemoUrl = `https://${deployConfig.bucket}/${deployConfig.destPath.replace(
			'{buildNumber}',
			buildNumber
		)}/${endOfUrl}`;
		demoLinksContentString += `STORYBOOK: ${storybookDemoUrl}\n`;
	} else {
		console.log('`demoStorybook` option was falsy. Storybook demo link will not be added to PR.');
	}

	// Add a timestamp to when the demo links were last updated.
	// This assumes this script was run directly after publishing and installing module builds
	const timestamp = new Date().toLocaleString('en-US', {
		timeZone: 'America/Chicago',
		dateStyle: 'short',
		timeStyle: 'long'
	});
	demoLinksContentString += `Updated At: ${timestamp}\n`;

	console.log(`PR Link: https://github.com/${repoOwner}/${repoName}/pull/${prNumber}\n`);
	console.log(`Content to put in demo link comment:\n${demoLinksContentString}`);
	console.log('\n> Adding content to PR...\n');

	const demoLinksCommentIdentifier = '<!-- PRB_DEMO_LINKS_IDENTIFIER -->';
	const commentContent = demoLinksCommentIdentifier + demoLinksContentString;

	await githubCommentService
		.updateIssueCommentByString(repoOwner, repoName, prNumber, commentContent, demoLinksCommentIdentifier)
		.catch(err => {
			console.log(err);
			process.exit(1);
		});

	console.log('Success! PR was updated with demo links.');
}

addDemoLinksToPR();
