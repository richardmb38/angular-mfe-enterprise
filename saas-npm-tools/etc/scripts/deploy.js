/*
 * Copyright (C) 2017 Acme Technologies, Inc. All rights reserved.
 */
'use strict';

const s3UploadService = require('../lib/util/s3UploadService.js');
const deployService = require('../lib/util/deployService.js');

let buildNumber = process.env.npm_config_buildNumber || process.env.npm_config_buildnumber;
let deployAs = process.env.npm_config_deployAs || process.env.npm_config_deployas;

if (['true', 'false', 'undefined', 'null', ''].includes(buildNumber)) {
	buildNumber = undefined;
}

if (['true', 'false', 'undefined', 'null', ''].includes(deployAs)) {
	deployAs = undefined;
}

if (!deployAs && process.argv.includes('deployAs=mfe')) {
	deployAs = 'mfe';
}

const buildTarget = process.env.npm_config_buildTarget || process.env.npm_config_buildtarget || 'dev';

/**
 * Separate methods for continuous vs manually deployed builds
 * Continuous builds will be uploaded to armada.acme bucket deployed builds to files.cloud.acme bucket
 */
const buildPromise =
	process.argv[3] === 'continuous'
		? s3UploadService.uploadBuild('continuous', deployAs)
		: deployService.deploy(buildNumber, buildTarget, deployAs);

buildPromise.catch(err => {
	console.error(err);
	process.exit(1);
});
