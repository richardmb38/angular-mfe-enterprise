/*
 * Copyright (C) 2021 Acme Technologies, Inc.  All rights reserved.
 */
'use strict';

const exec = require('../lib/exec.js');
const configUtils = require('../lib/configUtils');

/**
 * Script to run after publishing a NPM package. Reverses changes made to package.json.
 * This assumes that the "prePublishChecks.js" script ran before publishing,
 * which updates the version of the package.json file, but does not commit.
 */

const paths = configUtils.getVersionedPackagePaths();
paths.map(path => {
	return exec.easySync(`git checkout -- ${path}`);
});
