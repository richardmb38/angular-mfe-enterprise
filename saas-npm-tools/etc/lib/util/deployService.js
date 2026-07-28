/*
 * Copyright (C) 2022 Acme Technologies, Inc.  All rights reserved.
 */
'use strict';

const { S3Client, ListObjectsV2Command } = require('@aws-sdk/client-s3');

const gitUtils = require('../gitUtils.js');
const configUtils = require('../configUtils.js');
const s3UploadService = require('./s3UploadService.js');
const awsService = require('./awsService.js');

// Regex to match production build number format
const PROD_BUILD_REGEX = /^\d+$|^build\d+$/;

// Regex to match production version
const PROD_REGEX = /^(\d+\.\d+\.)(\d+)$/;

// Regex to detect semver syntax and isolate it from the version semantics.
const SEMVER = /^(semver:)?(<|<=|>|>=|=|~|\^)?(.*)$/;

/**
 * DeployService
 *
 * Service to automate creating a new release of a shared component.
 */
class DeployService {
	/**
	 * Deploy function to copy the build to S3
	 *
	 * @param {String} buildNumber - The user specified build number
	 * @param {String} buildTarget - The build target (i.e. dev or prod)
	 * @param {String} deployAs - String to indicate which deployment configuration to use from package.json. If undefined then the default deploy config will be used, otherwise the deploy config specified by the parameter will be used.
	 */
	async deploy(buildNumber, buildTarget, deployAs) {
		console.log('\n> Starting S3 deploy...\n');
		console.log(`\n> buildNumber: ${buildNumber}, buildTarget: ${buildTarget}, deployAs: ${deployAs} \n`);

		if (!buildNumber) {
			throw new Error('Build number was not specified. Deploy failed.');
		}
		if (buildNumber.toLowerCase() === 'continuous') {
			throw new Error(
				'Continuous builds will be deployed exclusively by the continuous Jenkins job. Deploy failed.'
			);
		}
		if (!buildTarget) {
			throw new Error('Build target was not specified. Deploy failed.');
		}

		await awsService.checkConnection();

		const currentBranch = gitUtils.getCurrentBranch();
		const prodEnabled = this.isProductionBuild(buildNumber);

		if (prodEnabled && buildTarget !== 'prod') {
			throw new Error('Unable to build a production build unless the target is prod.');
		}
		if (!prodEnabled && buildTarget === 'prod') {
			console.log(
				`Warning: Build number "${buildNumber}" is in an invalid production format. Deploying a development build number with the 'prod' build target.`
			);
		}

		console.log(
			`\nBuild Number: ${buildNumber} (${
				prodEnabled ? 'prod' : 'dev'
			})\nCurrent Branch: ${currentBranch}\nBuild Target: ${buildTarget}\n`
		);

		// Verify integrity of git workspace, dependencies, and s3
		if (prodEnabled) {
			await this._verifyWorkSpace(currentBranch, buildNumber, deployAs);
		}
		// push build to S3
		return s3UploadService.uploadBuild(buildNumber, deployAs);
	}

	/**
	 * Determine if this is a production build via the buildNumber.
	 *
	 * @param {String} buildNumber - The build number
	 * @returns {boolean|*}
	 */
	isProductionBuild(buildNumber) {
		return PROD_BUILD_REGEX.test(buildNumber);
	}

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
	 * Verify the integrity of the workspace and of the s3 bucket to push to
	 *
	 * @param {String} currentBranch - The current branch
	 * @param {String} buildNumber - The build number
	 * @param {String} deployAs - Which deployment configuration to use from package.json
	 * @returns Promise that resolve upon completion or error of verifying the s3 bucket integrity
	 * @private
	 */
	_verifyWorkSpace(currentBranch, buildNumber, deployAs) {
		gitUtils.verifyBranchStatus(currentBranch);
		gitUtils.verifyCleanWorkingCopy();
		gitUtils.verifyProductionBranch(currentBranch);
		this._verifyProductionDependencies();
		return this._verifyNewBucket(buildNumber, deployAs);
	}

	/**
	 * Checks if a bucket's key (aka the destination path) already exists
	 *
	 * @param {String} buildNumber - The build number
	 * @param {String} deployAs - Which deployment configuration to use from package.json
	 * @returns Promise that resolve upon completion of the s3 api or rejects with an error.
	 * @private
	 */
	_verifyNewBucket(buildNumber, deployAs) {
		const s3Client = new S3Client();
		const deployConfig = configUtils.getDeployConfig(deployAs);
		const aggregatedPrefix = deployConfig.destPath.replace('{buildNumber}', buildNumber) + '/';
		const params = {
			Bucket: deployConfig.bucket,
			Prefix: aggregatedPrefix
		};

		return new Promise((resolve, reject) => {
			s3Client.send(new ListObjectsV2Command(params)).then(
				data => {
					if (data.KeyCount >= 1) {
						return reject(
							new Error(`${buildNumber} already exists as a production build. Deploy canceled.`)
						);
					}
					resolve();
				},
				error => {
					return reject(
						new Error(
							`Failed to retrieve and verify keys for bucket ${params.Bucket} with key prefix ${params.Prefix}.\nDeploy failed.`
						)
					);
				}
			);
		});
	}

	/**
	 * Verify that all the dependencies in package.json are production versions. We don't want someone
	 * to accidentally create a reference to a development version of a shared library from a production
	 * release because this could cause us to pull in un-reviewed code into a release.
	 */
	_verifyProductionDependencies() {
		// List of approved npm dependencies for which we don't need to verify the NPM version.
		let WHITELISTED_DEPS = configUtils.getWhileListedDeps();
		if (WHITELISTED_DEPS === null || WHITELISTED_DEPS === undefined) {
			console.log("Please update your package.json to include 'whiteListedDeps'.");
			// Fall back to default list
			WHITELISTED_DEPS = ['crypto-js'];
		}
		const badDependencies = configUtils.readDependencies().filter(dependency => {
			if (!WHITELISTED_DEPS.includes(dependency.name)) {
				let version = dependency.version;

				// Strip any of the semver syntax
				version = version.match(SEMVER)[3];

				return !this.isProductionVersion(version);
			}
			return false;
		});
		if (badDependencies.length > 0) {
			throw new Error(
				'Unable to release/publish, non production dependencies are included in the package.json: ' +
					badDependencies
						.map(dep => {
							return dep.name;
						})
						.join(', ')
			);
		}
	}
}

module.exports = new DeployService();
