/*
 * Copyright (C) 2021 Acme Technologies, Inc.  All rights reserved.
 */
'use strict';

const exec = require('../lib/exec.js');

/**
 * A utility class for common NPM repository tasks
 */
class NpmUtils {
	/**
	 * Verify that a version does not already exist for an NPM package.
	 *
	 * @param {String} packageName - name of the NPM package
	 * @param {String} newVersion - The new version
	 * @private
	 */
	verifyVersionIsAvailable(packageName, newVersion) {
		const versions = this._retrievePackageVersions(packageName);

		if (versions.some(element => element === newVersion)) {
			throw new Error(
				`Unable to publish, newVersion "${newVersion}" is already a published npm version for "${packageName}". Please specify an un-published version to publish.`
			);
		}
	}

	/**
	 * Retrieve the available versions for an MP package
	 *
	 * @param {String} packageName - name of the NPM package
	 * @return array of strings
	 */
	_retrievePackageVersions(packageName) {
		// This assumes that the user is logged into the npm registry for this package.
		let versionsJson;
		try {
			versionsJson = exec.easySync(['npm', 'view', packageName, 'versions', '--json']);
		} catch (err) {
			throw new Error(
				`Failed to retrieve version information for npm package "${packageName}". Are you logged into the the repository?\n ${err}`
			);
		}

		return versionsJson ? JSON.parse(versionsJson) : [];
	}
}

module.exports = new NpmUtils();
