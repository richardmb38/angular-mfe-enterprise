/*
 * Copyright (C) 2022 Acme Technologies, Inc.  All rights reserved.
 */
'use strict';

const fs = require('fs');
const path = require('path');
const { S3Client, PutObjectCommand } = require('@aws-sdk/client-s3');
const ProgressBar = require('progress');
const mime = require('mime');
const glob = require('glob');

const configUtils = require('../configUtils.js');

const CLOUDFRONT_DOMAIN = 'https://files.cloud.acme.com';

/**
 * DeployService
 *
 * Service to automate creating a new release of a shared component.
 */
class S3UploadService {
	/**
	 * Uploads the build to s3. s3 and build configurations are set in package.json. Files that fail to upload are
	 * logged to the console.
	 *
	 * @param {String} buildNumber - The build number
	 * @param {String} deployAs - Which deployment configuration to use from package.json
	 * @returns {String} The deployed build url
	 * @private
	 */
	uploadBuild(buildNumber, deployAs) {
		const s3Client = new S3Client();

		let deployConfig = configUtils.getDeployConfig(deployAs);
		let hasStorybook = false;
		let isUiModule = false;

		if (buildNumber === 'continuous' && !!configUtils.getDeployContinuousConfig(deployAs)) {
			deployConfig = configUtils.getDeployContinuousConfig(deployAs);
		}

		const keyBase = deployConfig.destPath ? deployConfig.destPath.replace('{buildNumber}', buildNumber) + '/' : '';
		const srcPath = path.join(process.cwd(), deployConfig.srcFolder);

		const fileNames = this._readFileNames(srcPath);

		const progressBar = this._buildProgressBar(fileNames.length);

		// Create a promise for every file to upload. Needed to support concurrency.
		const uploadPromises = [];
		for (let i = 0; i < fileNames.length; i++) {
			const fileName = fileNames[i];
			const filePath = path.join(srcPath, fileName);

			if (filePath.indexOf('index.html') !== -1) {
				if (filePath.indexOf('storybook') !== -1) {
					hasStorybook = true;
				} else {
					isUiModule = true;
				}
			}
			uploadPromises.push(
				this._uploadFile({
					s3Client,
					srcPath,
					fileName,
					progressBar,
					baseAssetKey: keyBase,
					bucket: deployConfig.bucket,
					ACL: deployConfig.ACL
				})
			);
		}

		return this._waitForAllUploads(uploadPromises, () => {
			const url =
				deployConfig === 'deployContinuous'
					? `https://${deployConfig.bucket}/${deployConfig.destPath}`
					: `https://${deployConfig.bucket}/${keyBase}index.html`;

			if ((hasStorybook && !isUiModule) || isUiModule) {
				console.log(`\n> Deploy successful.\n\nYou can access the build at: ${url}\n`);
			}

			if (hasStorybook && isUiModule) {
				console.log(
					'You can access the storybook build at ' + `${CLOUDFRONT_DOMAIN}/${keyBase}storybook/index.html\n`
				);
			}

			return url;
		});
	}

	/**
	 * Logs out rejection errors for promises that failed to upload
	 *
	 * @param (Array<Promise>} completedPromises - array of completed promises mapped through _reflect()
	 * @private
	 */
	_listFailedUploads(completedPromises) {
		for (let i = 0; i < completedPromises.length; i++) {
			const p = completedPromises[i];
			if (p.status === 'rejected') {
				console.log(p.e);
			}
		}
	}

	/**
	 * Wraps the promise result with a status to suppress rejections. Use with .map to allow for Promise.all() to finish even if a promise fails.
	 * Credit: https://stackoverflow.com/questions/31424561/wait-until-all-es6-promises-complete-even-rejected-promises
	 *
	 * @param promise
	 * @private
	 */
	_reflect(promise) {
		return promise.then(
			function (v) {
				return { v: v, status: 'resolved' };
			},
			function (e) {
				return { e: e, status: 'rejected' };
			}
		);
	}

	/**
	 * Uploads a local directory of static objects
	 * The root folder is set by configuration in the package.json file of the client repo
	 * (under the key 'acme').
	 * Such config must contain:
	 * bucket: 		the name of the target s3 bucket
	 * destPath: 	the path within s3 where the objects will be put
	 * srcFolder:	the folder we read the files from
	 *
	 */
	uploadStatic() {
		const s3Client = new S3Client();
		// gets the configuration from the package.json, under the key 'acme'
		const deployConfig = configUtils.getDeployConfig('static');

		// read the content of the local directory set as the source folder
		const srcPath = path.join(process.cwd(), deployConfig.srcFolder);
		const fileNames = this._readFileNames(srcPath);

		// keep track of the upload advance
		const progressBar = this._buildProgressBar(fileNames.length);

		// determine where will these assets live inside S3
		const baseAssetKey = deployConfig.destPath ? deployConfig.destPath : '';

		const uploadPromises = fileNames.map(fileName => {
			return this._uploadFile({
				baseAssetKey,
				fileName,
				progressBar,
				s3Client,
				srcPath,
				ACL: deployConfig.ACL,
				bucket: deployConfig.bucket
			});
		});

		return this._waitForAllUploads(uploadPromises, () => {
			const url = `https://${deployConfig.bucket}/${baseAssetKey}`;
			console.log('Assets successfully saved at ' + url);
			return url;
		});
	}

	_readFileNames(srcPath) {
		return glob
			.sync(srcPath.replace(/\\/g, '/') + '**', { nodir: true })
			.map(filePath => filePath.replace(/\\/g, '/').replace(srcPath.split(path.sep).join('/'), ''));
	}

	_buildProgressBar(size) {
		return new ProgressBar('S3 Upload [:bar] :percent', {
			complete: '=',
			incomplete: ' ',
			width: 50,
			total: size
		});
	}

	/**
	 * Upload a single file to S3
	 * @param {Object} 	s3Client		- The client code to execute AWS commands
	 * @param {String} 	filename 		- Represents a simple file with no prefix path. E.g: picture.png
	 * @param {String} 	srcPath  		- Represents the local directory source of the file: E.g ~/AcmeUser/project/src
	 * @param {String}  bucket   		- Name of the bucket within S3
	 * @param {keyBase}	baseAssetKey  	- Represents the path (key) where the file will be stored within the s3 bucket
	 * @param {Object} 	progressBar		- Will help in visualizing how far are we in the process of uploading
	 * @private
	 */
	_uploadFile({ s3Client, fileName, srcPath, baseAssetKey, ACL, bucket, progressBar }) {
		return new Promise((resolve, reject) => {
			const filePath = path.join(srcPath, fileName);
			fs.readFile(filePath, (err, data) => {
				if (err) return reject(new Error(`Exception reading ${file}\n${err}. Deploy failed.`));
				const key = baseAssetKey.concat(fileName);

				const params = {
					Bucket: bucket,
					Body: data,
					Key: key,
					ContentType: mime.getType(filePath)
				};

				if (ACL) {
					// Only add the ACL parameter if it exists in the config.
					params.ACL = ACL;
				}

				s3Client.send(new PutObjectCommand(params)).then(
					// success
					() => {
						if (progressBar) {
							progressBar.tick();
						}
						resolve();
					},
					error => {
						reject(new Error(`Exception thrown trying to upload ${fileName} to s3.\n${error}`));
					}
				);
			});
		});
	}

	_waitForAllUploads(uploadPromises, onSuccessFn) {
		return Promise.all(uploadPromises.map(this._reflect)).then(results => {
			const totalFailedUploads = results.filter(x => x.status === 'rejected').length;
			if (totalFailedUploads > 0) {
				this._listFailedUploads(results);
				throw new Error(`${totalFailedUploads} file(s) failed to upload. Deploy failed.`);
			} else {
				return onSuccessFn();
			}
		});
	}
}

module.exports = new S3UploadService();
