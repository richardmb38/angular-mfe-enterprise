/*
 * Copyright (C) 2023 Acme Technologies, Inc.  All rights reserved.
 */
'use strict';

const fs = require('fs');
const path = require('path');
const rimRaf = require('rimraf');

const configUtils = require('./configUtils.js');
const gitUtils = require('../lib/gitUtils.js');
const exec = require('./exec.js');

/**
 * Service that updates the change long stored in the wiki of the package's GitHub repository.
 * This updates and/or creates the change log file, which is named in the package.json.
 * This is run as part of the pre-publish script.
 */
class ChangeLogUtils {
	/**
	 * Dynamically creates a change log from the previous tag and the new version that consists of the commit history
	 * (including the body of squashed PRs). If the new version is not in production format (#.#.#), then a change log is not generated.
	 * The change log file is stored in the package repository's wiki.
	 * @param {String} previousVersion - the most recent version tag before this new version
	 * @param {String} newVersion - the new version for the package
	 */
	generateChangeLog(previousVersion, newVersion) {
		// Get the name of the directory into which to clone the wiki.
		const wikiDirectory = this._calcWikiDirectory();
		const wikiAlreadyExists = fs.existsSync(wikiDirectory);
		try {
			// If the wiki directory exists, delete it
			this._deleteDirectory(wikiDirectory, `Deleting "${wikiDirectory}" directory in order to clone wiki repo.`);

			// Generate the text for commits in the version range.
			const changelogText = this._generateText(previousVersion, newVersion);

			// Clone the project's wiki repo, store the URL of the wiki repo.
			const wikiUrl = gitUtils.cloneWiki(wikiDirectory);

			// Define a message for the change log commit.
			const commitMessage = `[Automated-Release] Updating change log version from ${previousVersion} to ${newVersion}`;

			// The current branch name will be used to name the change log file.
			const currentBranch = gitUtils.getCurrentBranch();

			this._writeChangeLog(wikiDirectory, wikiUrl, currentBranch, changelogText, commitMessage);
		} finally {
			if (!wikiAlreadyExists) {
				// If the wiki directory was not there before, and it sill exists, clean up by deleting it.
				this._deleteDirectory(
					wikiDirectory,
					`Cleaning up the temporary wiki repo directory "${wikiDirectory}".`
				);
			}
		}
	}

	/**
	 * Creates the content that will be added to the change log using the provided versions.
	 *
	 * @param previousVersion - Lower version boundary for comparison
	 * @param newVersion - Upper version boundary for comparison
	 * @returns {string} - content to be added to change log
	 * @private
	 */
	_generateText(previousVersion, newVersion) {
		// Regexes for parsing

		// Regex pattern to match commit comments: IDNSCRUM-number: description (#PR)
		// Only messages that start with a Jira ticket number will be included.
		// The trailing parenthetical PR number is optional, but will be matched in the third capturing group.
		// (The second capturing group will capture any text between the ticket# and the PR.)
		const JIRA_PR_PATTERN = /^(\w+-\d+):(.*?)?(?:\((#\d+)\))?$/;

		const now = new Date();
		let content = '';
		let commits = '';

		const repoUrl = configUtils.getRepositoryUrl();
		if (!repoUrl) {
			throw new Error('Unable to generate a change log, the project does not have a repository url defined.');
		}

		if (previousVersion) {
			// Add link to code comparison for the previous version and master (which will be always have the latest code)
			const compareLink = `${repoUrl}/compare/${previousVersion}...${newVersion}`;
			content = `# [Release ${newVersion}](${compareLink}) (${now.getFullYear()}-${
				now.getMonth() + 1
			}-${now.getDate()})\n### Commits\n`;
			commits = exec.easySync(`git log --pretty=%B ${previousVersion}..${newVersion}`).split('\n');
		} else {
			content = `# Release ${newVersion} (${now.getFullYear()}-${
				now.getMonth() + 1
			}-${now.getDate()})\n### Commits\n`;
			commits = exec.easySync(`git log --pretty=%B ${newVersion}`).split('\n');
		}

		// Parse the commits and replace jira ids with links to jira and the PR
		const jiraIds = new Set();
		commits.forEach(entry => {
			const matchResult = entry.match(JIRA_PR_PATTERN);
			if (matchResult && !jiraIds.has(matchResult[1])) {
				const id = matchResult[1];
				const pr = matchResult[3]; // Get the PR number if there was a match.
				const prNumberOnly = pr && pr.replace('#', '');

				const jiraLink = `[${id}](https://acme.atlassian.net/browse/${id})`;
				let formattedCommit = entry.replace(id, jiraLink);

				if (prNumberOnly) {
					const prLink = `[${pr}](${repoUrl}/pull/${prNumberOnly})`;
					formattedCommit = formattedCommit.replace(pr, prLink);
				}

				jiraIds.add(id);
				content += formattedCommit + '\n\n';
			}
		});
		if (jiraIds.size === 0) {
			// We detected no PRs in this change.
			content += 'No JIRA issues were identified in this release.\n\n';
		}

		const currentDiffLink = `### [Upgrade comparison to master](${repoUrl}/compare/${newVersion}...master)\n\n`;
		content += currentDiffLink;

		return content + '--- \n\n';
	}

	/**
	 * Generate a directory specification for temporarily hosting the wiki repository.
	 * The name is based on the URL of the current git repo.
	 *
	 * @returns {String} The calculated directory name
	 */
	_calcWikiDirectory() {
		// Generate the name of the temporary directory for cloning the wiki repository.
		const curDir = process.env.PWD || process.env.INIT_CWD;
		const parentDir = path.dirname(curDir);

		const repoUrl = exec.easySync('git config --get remote.origin.url').trim();
		const repoName = path.basename(repoUrl, '.git');

		return path.join(parentDir, 'temp-wiki', repoName);
	}

	/**
	 * Create or update the change log file. A unique change log file is maintained
	 * for each production branch, so the branch name is used to calculate the name
	 * of the change log file. This function changes to the wiki directory, updates the file,
	 * then commit and push to the wiki repo. Finally, it changes back to the original working directory.
	 *
	 * @param {String} wikiDirectory - directory containing the wiki repo
	 * @param {String} wikiUrl - the URL of the wiki repo, used to confirm the correct repo
	 * @param {String} currentBranch - then name of the current git branch. Used to calculate the change log file name.
	 * @param {String} changelogText - the text to add to the change log file
	 */
	_writeChangeLog(wikiDirectory, wikiUrl, currentBranch, changelogText, commitMessage) {
		// We use forward slash in git repo names, which cannot be used for a file name.
		// Replace with a backslash.
		const branchPrefix = currentBranch.replace(/\//g, '\\');

		const changeLogFile = `${branchPrefix}.CHANGELOG.md`;
		const originalDir = process.env.PWD || process.env.INIT_CWD;
		try {
			// Verify that the expected directory exists.
			if (!fs.existsSync(wikiDirectory)) {
				throw new Error(
					`Failed to find the "${wikiDirectory}" directory, which should contain the cloned "${wikiUrl}" wiki repository.`
				);
			}

			console.log(`Changing to the "${wikiDirectory}" directory.`);
			process.chdir(wikiDirectory);

			// Verify that we are in the expected git repository.
			const foundGitUrl = exec.easySync('git config --get remote.origin.url').trim();
			if (foundGitUrl !== wikiUrl) {
				throw new Error(`The current git repo url "${foundGitUrl}" should match "${wikiUrl}" but does not.`);
			}

			if (!fs.existsSync(changeLogFile)) {
				console.log(`Creating a new change log file "${changeLogFile}"`);
				fs.writeFileSync(changeLogFile, '');
			}

			// Update the change log file.
			const oldContent = fs.readFileSync(changeLogFile);
			fs.writeFileSync(changeLogFile, changelogText + oldContent, 'utf8');

			// Update the wiki repo with the edited change log file.
			gitUtils.addCommitPush(changeLogFile, commitMessage);
		} finally {
			process.chdir(originalDir);
		}
	}

	/**
	 * Delete a directory from the file system.
	 */
	_deleteDirectory(directory, deleteMessage) {
		// If the file already exists, delete it.
		if (fs.existsSync(directory)) {
			console.log(deleteMessage);
			// Cross platform
			rimRaf.rimrafSync(directory);
		}
	}
}

module.exports = new ChangeLogUtils();
