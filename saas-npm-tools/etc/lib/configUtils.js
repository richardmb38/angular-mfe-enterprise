/*
 * Copyright (C) 2021 Acme Technologies, Inc.  All rights reserved.
 */
'use strict';

const fs = require('fs');
const PATH = require('path');

/**
 * A utility class for reading and writing configuration information
 */
class ConfigUtils {
	/**
	 * ConfigUtils constructor. Loads the package.json object during initialization
	 * and caches it to a property.
	 *
	 * @constructor
	 */
	constructor() {
		this.npmPackage = this._readNpmPackage() || {};
		this.mfeJson = this._readNpmPackage('mfe.json') || {};
	}

	/**
	 * Method to get deploy config from the package.json
	 *
	 * @param {String} [deployAs] - Optional string to indicate which deployment configuration to use from package.json. If undefined then the default deploy config will be used, otherwise the deploy config specified by the parameter will be used.
	 *
	 * @returns {
	 * 	bucket: string - The S3 bucket where files will be deployed into.
	 * 	destPath: string - The path within the S3 bucket where files will be deployed into.
	 * 	ACL: string - The AWS ACL permissions (read/write,etc) for the files that are uploaded.
	 * 	srcFolder: string - The directory on the local file system that should be copied up to s3.
	 * }
	 */
	getDeployConfig(deployAs = undefined) {
		if (deployAs?.toLowerCase() === 'mfe') {
			return this.npmPackage?.acme?.mfeDeploy;
		} else if (deployAs?.toLowerCase() === 'static') {
			return this.npmPackage?.acme?.uploadStatic;
		}

		return this.npmPackage?.acme?.deploy;
	}

	/**
	 * Method to get deployContinuos config from the package.json
	 *
	 * @param {String} [deployAs] - Optional string to indicate which deployment configuration to use from package.json. If undefined then the deployContinuos config will be used, otherwise the deploy config specified by the parameter will be used.
	 *
	 * @returns {
	 * 	bucket: string - The S3 bucket where files will be deployed into.
	 * 	destPath: string - The path within the S3 bucket where files will be deployed into.
	 * 	ACL: string - The AWS ACL permissions (read/write,etc) for the files that are uploaded.
	 * 	srcFolder: string - The directory on the local file system that should be copied up to s3.
	 * }
	 */
	getDeployContinuousConfig(deployAs = undefined) {
		if (deployAs?.toLowerCase() === 'mfe') {
			return this.npmPackage?.acme?.mfeDeploy;
		} else if (deployAs?.toLowerCase() === 'static') {
			return this.npmPackage?.acme?.uploadStatic;
		}

		return this.npmPackage?.acme?.deployContinuous;
	}

	/**
	 * Method to get the app shell this MFE is deployed into from the package.json
	 *
	 * @returns appShell
	 */
	getMfeAppShell() {
		return this.mfeJson?.app;
	}

	/**
	 * Method to get the MFE name from the package.json
	 *
	 * @returns mfeName
	 */
	getMfeName() {
		return this.mfeJson?.name;
	}

	/**
	 * Method to get the path to the MFE entry file relative to the dist directory from the package.json
	 *
	 * @returns entryFile
	 */
	getMfeEntryFile() {
		return this.mfeJson?.entryFile;
	}

	/**
	 * Method to get whiteListedDeps config from the package.json
	 *
	 * @returns whitListedDeps
	 */
	getWhileListedDeps() {
		return this.npmPackage?.acme?.whiteListedDeps;
	}

	/**
	 * Method to get moduleType config from the package.json
	 *
	 * @returns moduleType
	 */
	getModuleType() {
		return this.npmPackage?.acme?.moduleType;
	}

	/**
	 * Method to get moduleDemoUrl config from the package.json
	 *
	 * @returns {string|null} moduleDemoUrl
	 */
	getModuleDemoUrl() {
		return this.npmPackage?.acme?.moduleDemoUrl;
	}

	/**
	 * Method to get languagePackageSources config from the package.json
	 *
	 * @returns moduleType
	 */
	getLanguagePackageSources() {
		return this.npmPackage?.acme?.languagePackageSources;
	}

	/**
	 * Method to get port number from the package.json
	 *
	 * @returns moduleType
	 */
	getPort() {
		return this.npmPackage?.acme?.port;
	}

	/**
	 * Get the name for the NPM package
	 */
	getPackageName() {
		return this.npmPackage.name;
	}

	/**
	 * Update the package.json file with a new version.
	 *
	 * @param {String} version - the new version to update
	 */
	setVersion(version) {
		const versionedPackagePaths = this.getVersionedPackagePaths();

		versionedPackagePaths.map(path => {
			const versionedPackage = this._readNpmPackage(path);
			const updatedPackage = { ...versionedPackage, version };
			return this._writeNpmPackage(path, updatedPackage);
		});
	}

	/**
	 * Get the url of the git repository.
	 */
	getRepositoryUrl() {
		return this.npmPackage.repository?.url;
	}

	/**
	 * @returns the path of package.json that will be published to the npm registroy
	 */
	getVersionedPackagePaths() {
		return this.npmPackage.acme?.versionedPackagePaths || ['package.json'];
	}

	/**
	 * Get a list of the names of git branches that can be used for production releases.
	 */
	getProductionBranches() {
		return this.npmPackage.acme?.prodBranches || [];
	}

	/**
	 * Read the dependencies of a npm package.json package. The following properties are
	 * returned for each dependency:
	 *
	 * {
	 *     name: The name of the dependency
	 *     version: The version actual version component ignoring any url paths.
	 *     fullVersion: The full version as listed in the package.json.
	 * }
	 *
	 * @returns {Object[]} An array of dependency objects.
	 */
	readDependencies() {
		return [].concat(
			this._extractDependencies(this.npmPackage, 'dependencies'),
			this._extractDependencies(this.npmPackage, 'devDependencies'),
			this._extractDependencies(this.npmPackage, 'peerDependencies')
		);
	}

	/**
	 * Read the package.json file and return an object.
	 * @param path path of the package to read and default is root's package.json
	 * @returns an object version of the package.json
	 */
	_readNpmPackage(path) {
		path = path || 'package.json';
		const absolutePath = PATH.join(process.env.PWD || process.env.INIT_CWD, path);
		return fs.existsSync(absolutePath) ? JSON.parse(fs.readFileSync(absolutePath, 'utf8')) : null;
	}

	/**
	 * Replace the current package.json file with a JSON stringified
	 * version of the object argument.
	 * @param path path of the package to read and default is root's package.json
	 * @param {Object} npmPackage
	 */
	_writeNpmPackage(path, npmPackage) {
		path = path || 'package.json';
		fs.writeFileSync(path, JSON.stringify(npmPackage, null, '\t'));
	}

	/**
	 * Extract a particular type of dependencies from a json object.
	 *
	 * @param {Object} json - A package.json as a full js object.
	 * @param {String} property - The property to look for dependencies (i.e. dependencies, devDependencies,
	 *     or peerDependencies)
	 * @returns {Array} An array of dependencies, see readDependencies() for docs on the properties.
	 * @private
	 */
	_extractDependencies(json, property) {
		// Return an empty list if the dependency list isn't available.
		if (!json || !json[property]) {
			return [];
		}

		return Object.keys(json[property]).map(name => {
			let version = json[property][name];
			if (version.indexOf('#') >= 0) {
				version = version.substring(version.indexOf('#') + 1);
			}

			return {
				name: name,
				version: version,
				fullVersion: json[property][name]
			};
		});
	}
}

module.exports = new ConfigUtils();
