/*
 * Copyright (C) 2022 Acme Technologies, Inc.  All rights reserved.
 */
'use strict';

const mfeDeployService = require('../lib/util/mfeDeployService');
const slptConfig = require('../lib/configUtils');
const buildNumber = process.env.npm_config_buildNumber || process.env.npm_config_buildnumber;
const deployAsDefaultBuild = process.env.npm_config_deployAsDefaultBuild || process.env.npm_config_deployasdefaultbuild;
const name = deployAsDefaultBuild ? undefined : process.env.npm_config_name || buildNumber;

const CLOUDFRONT_DOMAIN = 'https://assets-dev.acme.com';
const PUBLISH_TTL = 1000 * 60 * 60 * 24 * 30; // 30 days in milliseconds

if (deployAsDefaultBuild !== undefined && deployAsDefaultBuild !== 'onlyRunInReleasePipeline') {
	throw new Error(
		'--deployAsDefaultBuild must be the set to "onlyRunInReleasePipeline" specificaly to avoid engineers from accedentally calling this command locally.'
	);
}

/**
 * Auto deploy the micro front-end whenever a build is deployed. This script is expected to be run
 * after a build has been deployed in order to deploy the mfe into dev. The build will be
 * automatically un-deployed after 30 days.
 *
 * Example Usage:
 * - npm run deploy --buildNumber=whatever
 * - npm run deploy --buildNumber=whatever --name=whatever
 *
 * The dev MFE instance will be deployed for the specific build number. If a name is provided then
 * the MFE will be deployed under that name, otherwise the buildNumber will be used.
 *
 * Alternatively, this same script can be used to deploy a build across all of development. This
 * should never be called locally, but instead from a jenkins pipeline. For this case use the
 * --deployAsDefaultBuild=onlyRunInReleasePipeline. Hopefully this will prevent engineers from
 * accedentally running the command locally. For example:
 * - npm run deploy --buildNumber=build123 --deployAsDefaultBuild=onlyRunInReleasePipeline
 */
if (buildNumber) {
	const app = slptConfig.getMfeAppShell();
	const mfe = slptConfig.getMfeName();

	mfeDeployService
		.deploy({
			app,
			mfe,
			name,
			build: buildNumber,
			builtAt: new Date(),
			url: `${CLOUDFRONT_DOMAIN}/${mfe}/${buildNumber}/`,
			ttl: deployAsDefaultBuild ? undefined : new Date(new Date().getTime() + PUBLISH_TTL)
		})
		.then(() => {
			if (deployAsDefaultBuild) {
				console.log(`Successfully deployed mfe ${mfe} as the default build`);
			} else {
				console.log(`Successfully deployed mfe ${mfe} as ?ui=${name}...`);
			}
		});
} else {
	// Exit with out error, just a warning
	console.warn(
		'The --buildNumber parameter is required for deploying. \n Ex: npm run deploy --buildNumber=something'
	);
}
