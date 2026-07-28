/*
 * Copyright (C) 2021 Acme Technologies, Inc.  All rights reserved.
 */
'use strict';

const changeLogUtils = require('../lib/changelogUtils.js');
const gitUtils = require('../lib/gitUtils.js');
const npmUtils = require('../lib/npmUtils.js');
const configUtils = require('../lib/configUtils.js');
const versionUtils = require('../lib/versionUtils.js');
const fs = require('fs');

/**
 * Script to run before publishing a NPM package. Runs a series of checks,
 * then updates package.json file the new version.
 */

// Get user specified new version to publish.
let newVersion = process.env.npm_config_newVersion || process.env.npm_config_newversion;
const newVersionFilePath = process.env.npm_config_newVersionFilePath || process.env.npm_config_newversionfilepath;
const firstVersion = process.env.npm_config_firstVersion || process.env.npm_config_firstversion || false;

const isNewVersionAutoRelease = versionUtils.isNewVersionAutoRelease(newVersion);

// checks for auto release tag, otherwise assumes manual path
if (isNewVersionAutoRelease) {
	// automatically sets next version to next semver based on the latest merged commits title
	newVersion = gitUtils.getNextVersion();
}

// Verify that the new version has valid format.
versionUtils.verifyVersionIsValid(newVersion);

// Determine if this is a production release, as determined by the new version.
const isProdVersion = versionUtils.isProductionVersion(newVersion);

if (isProdVersion) {
	// Run checks for a production release.
	gitUtils.verifyProductionBranchVersion(newVersion);
}

// Check if there is already a published version of this NPM package.
if (!firstVersion) {
	npmUtils.verifyVersionIsAvailable(configUtils.getPackageName(), newVersion);
}

if (isProdVersion && !firstVersion) {
	// Get the last version tag before creating the new tag, which will then become the last tag.
	// The change log process needs two tags to limit the range of commits.
	const lastVersion = gitUtils.getLastProductionVersion();

	// Add a git tag for this production release.
	gitUtils.createAnnotatedTag(newVersion);

	// Update the change log for this release.
	changeLogUtils.generateChangeLog(lastVersion, newVersion);
} else if (isProdVersion && firstVersion) {
	// Add a git tag for this first production release without a changelog.
	gitUtils.createAnnotatedTag(newVersion);
}

// Set the new version in the package.json. The npm publish process
// will use this new version for the published package. This change is not
// committed, to be reverted after the publication.
configUtils.setVersion(newVersion);

// creates output file to write the new version to, used by Slack automation in library pipelines
if (newVersionFilePath) {
	fs.writeFileSync(newVersionFilePath, newVersion);
}
