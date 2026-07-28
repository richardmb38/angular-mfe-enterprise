/*
 * Copyright (C) 2017 Acme Technologies, Inc.  All rights reserved.
 */
'use strict';

const publishService = require('../lib/util/deployService');
const slptConfigService = require('../lib/configUtils');
const podInfo = require('../lib/util/podInfo.js');
const stagingService = require('../lib/util/stagingService.js');
const uiModuleService = require('../lib/util/uiModuleService.js');

const buildNumber = stagingService.generateBuildNumber();
const podName = process.env.npm_config_pod;
const moduleName = process.env.npm_config_name || process.env.USER || process.env.USERNAME || 'unknown';
moduleName.replace(/[^a-zA-Z0-9_]/g, '');

publishService
	.deploy(buildNumber, 'dev')
	.then(url => {
		if (!podName) {
			return;
		}

		console.log(`Installing dev UI module on ${podName} as ?ui=${moduleName}...`);
		return podInfo.getByName(podName).then(pInfo => {
			return uiModuleService
				.installModule({
					podUrl: pInfo.domain,
					podApiUser: pInfo.apiUser,
					podApiKey: pInfo.apiKey,
					moduleType: slptConfigService.getModuleType(),
					moduleName,
					moduleUrl: url,
					uninstallOnExit: false,
					ttl: 60 * 60 * 24 // 24 hours in seconds
				})
				.then(() => {
					console.log(`Successfully installed dev UI module on ${podName} as ?ui=${moduleName}...`);
				});
		});
	})
	.catch(err => {
		console.error(err);
		process.exit(1);
	});
