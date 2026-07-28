/*
 * Copyright (C) 2021 Acme Technologies, Inc.  All rights reserved.
 */
'use strict';

// Regexes to match production & development versions
const PROD_REGEX = /^(\d+\.\d+\.)(\d+)$/;
const DEV_REGEX = /^(\d+\.\d+\.)(\d+)-?\w*/;
const AUTO_RELEASE_TAG = '-autoRelease';

/**
 * A utility class for verifying npm package versions.
 */
class VersionUtils {
	/**
	 * Is the version for production?
	 *
	 * @param {String} version - The version to check.
	 * @returns {boolean} true if the version is a production version, otherwise false.
	 */
	isProductionVersion(version) {
		return PROD_REGEX.test(version);
	}

	/**
	 * Is the version for development?
	 *
	 * @param {String} version - The version to check.
	 * @returns {boolean} true if the version is a development version, otherwise false.
	 */
	isDevelopmentVersion(version) {
		return DEV_REGEX.test(version);
	}

	/**
	 * Is the version valid?
	 *
	 * @param {String} version - The version to check.
	 * @returns {boolean} true if the version is a development or production version, otherwise false.
	 */
	isValidVersion(version) {
		return this.isProductionVersion(version) || this.isDevelopmentVersion(version);
	}

	/**
	 * Is the version an automated release
	 *
	 * @param {String} version - The version to check for autoRelease tag
	 * @returns {boolean}
	 */
	isNewVersionAutoRelease(version) {
		return version.includes(AUTO_RELEASE_TAG);
	}

	/**
	 * Verify that the proposed version number is valid, and if it is not then display a pretty error message
	 * telling the dev how version numbers work.
	 *
	 * @param {String} newVersion - The new version
	 */
	verifyVersionIsValid(newVersion) {
		if (!newVersion) {
			throw new Error(
				'Unable to publish, missing newVersion. Please specify the version to publish by using the --newVersion=parameter.'
			);
		}

		if (!this.isValidVersion(newVersion)) {
			// If we're not a production version && and we're not a valid development version, then we're invalid:
			console.error(`
Acme node version numbers are based upon the semantics provided by npm package management systems.
They both rely on the semver.org numbering scheme. At the heart of the format is major.minor.patch;
where:

	Major - Incremented when there are incompatible changes to the public API.
	Minor - Incremented when new features are introduced into the public API.
	Patch - Incremented when bug fixes or other minor improvements are introduced.

Production version numbers are final versions that can be used in production releases. These numbers
consist solely along the format major.minor.patch. These versions may only be created off of designated
branches such as master, or release depending upon the project's setup.

Development version numbers are what is used to denote the version of a package used only
for development. These version numbers are of the format major.minor.patch-whatever.
`);

			throw new Error(`Unable to publish, the version number "${newVersion}" is in an invalid format.`);
		}
	}
}

module.exports = new VersionUtils();
