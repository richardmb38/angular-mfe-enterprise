/*
 * Copyright (C) 2018 Acme Technologies, Inc.  All rights reserved.
 */
'use strict';

const slptConfig = require('../lib/configUtils');
const podInfo = require('../lib/util/podInfo.js');
const uiModuleService = require('../lib/util/uiModuleService.js');
const podNames = process.env.npm_config_pod;
const buildNumber = process.env.npm_config_buildNumber || process.env.npm_config_buildnumber;
const moduleName = buildNumber || process.env.npm_config_name;
const cache = process.env.npm_config_cache;
const autoDeploy = process.env.npm_config_autoDeploy || process.env.npm_config_autodeploy;
const isAutoDeployOperation = process.argv.includes('autoDeploy') || autoDeploy === 'true';
const validOperation =
	process.env.npm_config_list === 'true' ||
	process.env.npm_config_deploy === 'true' ||
	process.env.npm_config_delete === 'true' ||
	isAutoDeployOperation;
const CLOUDFRONT_DOMAIN = 'https://files.cloud.acme.com';

// check if the node version is > 10.7.0. timeLog method on console is added in node v10.7.0
// if yes then use console.table to display the list of modules.
// else display the modules as a list.
const nodeV107orHigher = typeof console.timeLog === 'function';

/**
 * List the all the UI modules installed on the pod.
 * If moduleName is provided the list will be filtered by the module name.
 *
 * @param {Object} options - Details about the ui module to list.
 * @param {String} podName - Name of the pod.
 * @param {String} podUrl - The full base url to the pod.
 * @param {String} podApiUser - The user to authenticate with.
 * @param {String} podApiKey - The api key to authenticate with.
 * @param {String} moduleName - The module name. - optional
 */
function listModules(options) {
	return uiModuleService.list(options).then(uiModules => {
		console.log('Total Count: ' + uiModules.length);
		if (nodeV107orHigher) {
			console.table(uiModules, ['type', 'name', 'id', 'url']);
		} else {
			uiModules.forEach((uiModule, index) => {
				console.log(
					`${index + 1}. ${uiModule.name} \n type: ${uiModule.type} \n id: ${uiModule.id} \n cache: ${
						uiModule.cache
					} \n url: ${uiModule.url}`
				);
			});
		}
	});
}

/**
 * Delete the specified ui module synchronously.
 *
 * @param {Object} options - Details about the ui module to delete.
 * @param {String} podName - Name of the pod.
 * @param {String} podUrl - The full base url to the pod.
 * @param {String} podApiUser - The user to authenticate with.
 * @param {String} podApiKey - The api key to authenticate with.
 * @param {String} moduleType - The module type (i.e. AUTH, RESET, LAUNCHPAD, etc...)
 * @param {String} moduleName - The module name.
 */
function deleteModule(options) {
	return uiModuleService
		.delete(options)
		.then(() => {
			console.log(
				`\nSuccessfully deleted ui module ${options.moduleType}-${options.moduleName} from pod ${options.podName}`
			);
		})
		.catch(error => {
			console.log(error);
		});
}

/**
 * Installs or updates the specified ui module on a pod.
 *
 * @param {Object} options - Details about the ui module to delete.
 * @param {String} podName - Name of the pod.
 * @param {String} podUrl - The full base url to the pod.
 * @param {String} podApiUser - The user to authenticate with.
 * @param {String} podApiKey - The api key to authenticate with.
 * @param {String} moduleType - The module type (i.e. AUTH, RESET, LAUNCHPAD, etc...)
 * @param {String} moduleName - The module name.
 */
function deployModule(options) {
	if (moduleName) {
		options['moduleUrl'] = `${CLOUDFRONT_DOMAIN}/${slptConfig
			.getDeployConfig()
			.destPath.replace('{buildNumber}', moduleName)}/index.html`;
		options['cache'] = cache === 'STATIC' ? cache : 'CONTINUOUS';
		return uiModuleService
			.installModule(options)
			.then(() => {
				console.log(
					`Successfully installed dev UI module on ${options.podName} as ?ui=${options.moduleName}...`
				);
			})
			.catch(error => {
				console.log(error);
			});
	} else {
		console.log(`Build Number or name is required.
Ex: npm run uiModule --deploy --buildNumber=newBuild --pod=megapod-useast1`);
	}
}

async function runUiModuleCommand() {
	if (!validOperation) {
		console.log(`Operation not specified. Supported operations [\'list\', \'delete\', \'deploy\', \'autoDeploy\'].
	Ex: npm run uiModule --list --pod=megapod-useast1
		npm run uiModule --delete --buildNumber=newBuild --pod=megapod-useast1
		npm run uiModule --delete --buildNumber=newBuild --pod=megapod-useast1,stradbroke
		npm run uiModule --deploy --buildNumber=newBuild --pod=megapod-useast1 --cache=STATIC`);
	} else {
		if (podNames) {
			const podNamesArray = podNames.split(',');

			for (let i = 0; i < podNamesArray.length; i++) {
				const podName = podNamesArray[i];

				console.log('\n\n');
				let operationFunction;
				if (process.env.npm_config_list === 'true') {
					console.log(
						`>>> Listing UI Modules on pod ${podName} ${
							moduleName ? 'with module name ' + moduleName : ''
						} <<<\n`
					);
					operationFunction = listModules;
				} else if (process.env.npm_config_delete === 'true') {
					console.log(`>>> Deleting UI Module ${moduleName} on pod ${podName} <<<\n`);
					operationFunction = deleteModule;
				} else if (process.env.npm_config_deploy === 'true' || isAutoDeployOperation) {
					console.log(`>>> Installing UI Module ${moduleName} on pod ${podName} <<<\n`);
					operationFunction = deployModule;
				}

				const podResponse = await podInfo.getByName(podName);
				const options = {
					podName,
					podUrl: podResponse.domain,
					podApiUser: podResponse.apiUser,
					podApiKey: podResponse.apiKey,
					moduleName,
					moduleType: slptConfig.getModuleType(),
					uninstallOnExit: false
				};

				await operationFunction(options);
			}
		} else if (!podNames && isAutoDeployOperation) {
			// Do nothing if the podName is not provided and the operation is autoDeploy.
		} else {
			console.log(`At least one pod name is required. Examples:
	npm run uiModule --list --pod=megapod-useast1
	npm run uiModule --list --pod=megapod-useast1,stradbroke
			`);
		}
	}
}

runUiModuleCommand();
