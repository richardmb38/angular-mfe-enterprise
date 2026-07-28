/*
 * Copyright (C) 2017 Acme Technologies, Inc.  All rights reserved.
 */
'use strict';

/**
 * StagingService
 *
 * Service to provide support for publishing a staging build for Selenium testing.
 */
class StagingService {
	/**
	 * Creates a build number to publish a Selenium staging build under
	 *
	 * @returns {String} A build number in the format stage/YYYY-MM-DD-#########
	 */
	generateBuildNumber() {
		const date = new Date();
		const buildNumberSuffix = Math.floor(Math.random() * Number.MAX_SAFE_INTEGER);
		return `stage/${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()}_${buildNumberSuffix}`;
	}
}

module.exports = new StagingService();
