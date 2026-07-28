/*
 * Copyright (C) 2021 Acme Technologies, Inc.  All rights reserved.
 */
'use strict';

const fs = require('fs');

const exec = require('./exec.js');
const configUtils = require('./configUtils.js');

// The branches that we allow production versions to be created from
const PRODUCTION_BRANCHES = configUtils.getProductionBranches();

/**
 * A utility class for common git commands and versioning checks
 */
class GitUtils {
	/**
	 * Retrieve the current branch of the working copy. Jenkins builds on a detached HEAD, causing the
	 * "git symbolic-ref" command to return an error. Using the Jenkins GIT_BRANCH environment variable in that case.
	 *
	 * @returns {string} The current branch
	 */
	getCurrentBranch() {
		const currentBranchCmd = exec.spawnSync('git', ['symbolic-ref', '--short', 'HEAD'], { returnOnFailure: true });
		return currentBranchCmd.code === 0 ? currentBranchCmd.stdout.trim() : process.env.GIT_BRANCH;
	}

	/**
	 * Create a new annotated tag in git. We use annotated tags because git will keep track of the date it was
	 * created, along with what user created it. Git does not track lightweight tags, plus it works nicely with
	 * the --follow-tags command.
	 *
	 * @param {String} newVersion - The new version to tag.
	 */
	createAnnotatedTag(newVersion) {
		// since our tag name has a space we have to use the array syntax.
		exec.easySync(['git', 'tag', '-a', newVersion, '-m', `Version ${newVersion}`]);

		// push the new tag
		exec.easySync(`git push origin refs/tags/${newVersion}`);
	}

	/**
	 * Verify that there are no dirty files in the current working directory. We don't want to create
	 * releases where developers may have missed some dependencies.
	 */
	verifyCleanWorkingCopy() {
		if (exec.easySync('git status --porcelain').length > 0) {
			throw new Error('Unable to publish from a dirty working copy. Either commit or stash all dirty files.');
		}
	}

	/**
	 * If the currentBranch also exists on the origin, check that we are up-to-date with origin,
	 * both commits behind origin and commits ahead.
	 *
	 * @param {String} currentBranch - The name of the current branch
	 */
	verifyBranchStatus(currentBranch) {
		const heads = exec.easySync(`git ls-remote origin ${currentBranch} --heads`);
		if (heads.length > 0) {
			const logsRemoteAhead = exec.easySync(`git log HEAD..origin/${currentBranch} --oneline`);
			if (logsRemoteAhead.length > 0) {
				throw new Error(
					`Unable to release/publish from working copy that is out of date with origin. Do a "git pull origin ${currentBranch}".
					This can happen in our production release pipelines when two merges occur close together.
					In that case the first pipeline will fail, and the second one should procced as normal including both changes.
					Nothing additional needs to be done.
					If you are trying to get changes out quickly, manually monitor the pipeline.
					If you see that a new build is pending before the current build gets to the Publish Build step,
					then cancel the current build and let the new one proceed.`
				);
			}

			const logsLocalAhead = exec.easySync(`git log origin/${currentBranch}..HEAD --oneline`)?.trim();
			if (logsLocalAhead.length > 0) {
				const aheadCount = logsLocalAhead.split('\n').filter(text => text).length;
				throw new Error(
					`Unable to publish from working copy that is out of date with origin. Branch "${currentBranch}" is ahead of origin by ${aheadCount} commits.`
				);
			}
		}
	}

	/**
	 * Verify that the current branch is a production branch. We don't want dev's to create a release straight
	 * from their development branches. Production versions should only be made from the main line branch,
	 * typically 'master'
	 *
	 * @param {String} currentBranch - The current branch
	 */
	verifyProductionBranch(currentBranch) {
		const matched = PRODUCTION_BRANCHES.filter(productionBranch => {
			return new RegExp('^' + productionBranch + '$').test(currentBranch);
		});

		if (matched.length === 0) {
			throw new Error(`Unable to publish production version from a non-production branch: ${currentBranch}`);
		}
	}

	/**
	 * Verify that a git tag does not already exist for the version.
	 *
	 * @param {String} newVersion - The new version
	 * @private
	 */
	verifyVersionIsAvailable(newVersion) {
		const result = exec.easySync(`git tag -l ${newVersion}`);
		if (result.length > 0) {
			throw new Error(`Unable to publish, a git tag for version number "${newVersion}" already exists.`);
		}
	}

	/**
	 * Run all the checks to verify that current production branch is ready for publication.
	 * This only applies to production branches.
	 *
	 * @param {String} newVersion - The new version to check
	 */
	verifyProductionBranchVersion(newVersion) {
		exec.easySync('git remote update');
		const currentBranch = this.getCurrentBranch();
		this.verifyProductionBranch(currentBranch);
		this.verifyCleanWorkingCopy();
		this.verifyBranchStatus(currentBranch);
		this.verifyVersionIsAvailable(newVersion);
	}

	/**
	 * Clone the wiki for the current repository to a temporary directory, then change to the temporary directory.
	 * This assumes the current process is in the directory of the package repository.
	 *
	 * @param {String} wikiDirectory - directory to contain the cloned wiki repo
	 * @returns {String} - the URL of the wiki repo that was cloned. This can be used to confirm
	 * that that the correct repo is contained in the new directory.
	 */
	cloneWiki(wikiDirectory) {
		// Calculate the url of the wiki repository.
		const projUrl = exec.easySync('git config --get remote.origin.url').trim();
		const wikiUrl = projUrl.replace('.git', '.wiki.git');

		// Clone the wiki repository.
		console.log(`Cloning the "${wikiUrl}" wiki repository into the "${wikiDirectory}" directory.`);
		exec.easySync(['git', 'clone', wikiUrl, wikiDirectory]);

		// Verify that the expected directory exists.
		if (!fs.existsSync(wikiDirectory)) {
			throw new Error(
				`Failed to find the "${wikiDirectory}" directory, which should contain the cloned "${wikiUrl}" wiki repository.`
			);
		}

		return wikiUrl;
	}

	/**
	 *	Add file contents to the git index, commit the changes, then push to origin.
	 *
	 * @param {String} pathSpec - git specification for files to include in what will be committed.
	 * @param {String} message - commit message
	 * @param {String} currentBranch - optional git branch name, defaults to current branch.
	 */
	addCommitPush(pathSpec, message, currentBranch) {
		const commitBranch = currentBranch || this.getCurrentBranch();

		exec.easySync(`git add ${pathSpec}`);

		// Since our commit message has spaces we have to use the array syntax.
		exec.easySync(['git', 'commit', '-m', message]);

		exec.easySync(`git push origin ${commitBranch}`);
	}

	/**
	 *	Get the last version tag
	 * @returns {String} - the last version tag that matches the format of x.x.x
	 */
	getLastProductionVersion() {
		return exec.easySync(['git', 'describe', '--match', '[0-9]*.[0-9]*.[0-9]*', '--abbrev=0', 'HEAD'])?.trim();
	}

	/**
	 *	Determine the next semantic version
	 * @returns {String} - the next version as determined by the most recent merges semantic version and the last version
	 */
	getNextVersion() {
		const lastVersion = this.getLastProductionVersion();

		let commitMessage = exec.easySync(['git', 'log', `${lastVersion}..HEAD`, '--oneline'])?.trim();
		commitMessage = commitMessage.toUpperCase();

		const nextVersionMutable = lastVersion.split('.');

		let semVer = [];

		if (commitMessage && commitMessage.length > 0) {
			semVer = [...commitMessage.match(/(\[MINOR])|(\[MAJOR])|(\[PATCH])/g)];
		}

		if (!semVer[0]) {
			console.log(
				'No semantic version indicator found in last commit, hopefully youre doing this on purpose. Next version will default to a patch.'
			);
			nextVersionMutable[2]++;
		} else {
			let nextSemVer = '';
			semVer.forEach(semVer => {
				if (semVer === '[MAJOR]') {
					nextSemVer = '[MAJOR]';
				} else if (semVer === '[MINOR]' && nextSemVer !== '[MAJOR]') {
					nextSemVer = '[MINOR]';
				} else if (semVer === '[PATCH]' && nextSemVer !== '[MINOR]' && nextSemVer !== '[MAJOR]') {
					nextSemVer = '[PATCH]';
				}
			});

			if (nextSemVer === '[MAJOR]') {
				nextVersionMutable[0]++;
				nextVersionMutable[1] = 0;
				nextVersionMutable[2] = 0;
			}

			if (nextSemVer === '[MINOR]') {
				nextVersionMutable[1]++;
				nextVersionMutable[2] = 0;
			}

			if (nextSemVer === '[PATCH]') {
				nextVersionMutable[2]++;
			}
		}

		const finalReleaseVersion = nextVersionMutable.join('.');
		console.log(`Next Version:  ${finalReleaseVersion}`);

		return finalReleaseVersion;
	}
}

module.exports = new GitUtils();
