/*
 * Copyright (C) 2017 Acme Technologies, Inc.  All rights reserved.
 */

const axios = require('axios');
const FormData = require('form-data');
const { Buffer } = require('node:buffer');

/**
 * Utility class to install and uninstall ui modules on cloud commander.
 */
class UIModuleService {
	/**
	 * Install a development UI Module into cloud commander. In addition a shutdown hook will be installed to
	 * delete this module when this node process exits.
	 *
	 * @param {Object} options - Details about the module to install.
	 * @param {String} options.podUrl - The full base URL for the pod.
	 * @param {String} options.podApiUser - The user to authenticate with.
	 * @param {String} options.podApiKey - The api key to authenticate with.
	 * @param {String} options.moduleName - The name of the module to install, 'default' is not allowed.
	 * @param {String} options.moduleType - The module type (i.e. AUTH, RESET, LAUNCHPAD, etc...)
	 * @param {String} options.moduleUrl - The url to where the module is installed, typically localhost somewhere.
	 * @param {String} options.moduleTemplate - The full text of the template to install with the module.
	 * @param {Boolean} options.uninstallOnExit - If true, uninstall module on a node shutdown event.
	 * @returns {Promise} A promise for completion.
	 */
	installModule(options) {
		// Check our parameters
		if (!options.podUrl) {
			throw new Error('Unable to install ui module, missing podUrl');
		}
		if (!options.podApiUser || !options.podApiKey) {
			throw new Error('Unable to install ui module, missing podApiUser or podApiKey');
		}
		if (!options.moduleName) {
			throw new Error('Unable to install ui module, missing moduleName');
		}
		if (options.moduleName === 'default') {
			throw new Error('Unwilling to replace default ui module. Please choose a different module name.');
		}
		if (!options.moduleType) {
			throw new Error('Unable to install ui module, missing moduleType');
		}
		if (!options.moduleUrl) {
			throw new Error('Unable to install ui module, missing moduleUrl');
		}
		if (!options.hasOwnProperty('uninstallOnExit')) {
			options.uninstallOnExit = true;
		}
		const getUrl = `admin/api/uiModule/get/${options.moduleType}-${options.moduleName}`;
		const getModuleUrl = `${options.podUrl}${getUrl}`;
		console.log(`GET ${getModuleUrl}`);
		return axios({
			method: 'get',
			baseUrl: options.podUrl,
			url: getModuleUrl,
			auth: {
				username: options.podApiUser,
				password: options.podApiKey
			}
		})
			.then(response => {
				const exists = response.status === 200;
				if (exists) {
					console.log(JSON.stringify(response.data, null, '\t'));
					const updateUrl = 'admin/api/uiModule/update';
					const updatePostUrl = `${options.podUrl}${updateUrl}`;
					console.log(`POST ${updatePostUrl}`);

					return axios({
						method: 'post',
						url: updatePostUrl,
						auth: {
							username: options.podApiUser,
							password: options.podApiKey
						},
						data: this.generateModuleFormData(options, true)
					})
						.then(responseObj => {
							console.log(JSON.stringify(responseObj.data, null, '\t'));

							if (options.uninstallOnExit) {
								this.deleteOnExit(options);
							}
						})
						.catch(errorObj => {
							if (errorObj && errorObj.response && errorObj.response.status !== 200) {
								console.error(errorObj || errorObj.response.status + ' status code');
								return Promise.reject(new Error('Failure while updating the ui module.'));
							}
						});
				}
			})
			.catch(error => {
				if (error && error.response && error.response.status !== 200) {
					if (error.response.status === 404) {
						const createUrl = 'admin/api/uiModule/create';
						const createPostUrl = `${options.podUrl}${createUrl}`;
						console.log(`POST ${createPostUrl}`);

						return axios({
							method: 'post',
							url: createPostUrl,
							auth: {
								username: options.podApiUser,
								password: options.podApiKey
							},
							data: this.generateModuleFormData(options)
						})
							.then(responseObj => {
								console.log(JSON.stringify(responseObj.data, null, '\t'));

								if (options.uninstallOnExit) {
									this.deleteOnExit(options);
								}
							})
							.catch(errorObj => {
								if (errorObj && errorObj.response && errorObj.response.status !== 200) {
									console.error(errorObj || errorObj.response.status + ' status code');
									return Promise.reject(new Error('Failure while creating the ui module.'));
								}
							});
					} else {
						console.error(error);
						return Promise.reject(new Error('Failed to check whether the module already exists.'));
					}
				}
			});
	}

	/**
	 * Validates if all the required properties are provided for deleting a module.
	 *
	 * @param {Object} options - Details about the ui module to delete.
	 * @param {String} options.podUrl - The full base url to the pod.
	 * @param {String} options.podApiUser - The user to authenticate with.
	 * @param {String} options.podApiKey - The api key to authenticate with.
	 * @param {String} options.moduleType - The module type (i.e. AUTH, RESET, LAUNCHPAD, etc...)
	 * @param {String} options.moduleName - The module name.
	 */
	validateDeleteOptions(options) {
		if (!options.podUrl) {
			throw new Error('Unable to delete ui module, missing podUrl');
		}
		if (!options.podApiUser || !options.podApiKey) {
			throw new Error('Unable to delete ui module, missing podApiUser or podApiKey');
		}
		if (!options.moduleType) {
			throw new Error('Unable to delete ui module, missing moduleType');
		}
		if (!options.moduleName) {
			throw new Error('Unable to delete ui module, missing moduleName');
		}
		if (options.moduleName === 'default') {
			throw new Error('Unwilling to delete the default ui module.');
		}
	}

	/**
	 * Delete the specified ui module Asynchronously.
	 *
	 * @param {Object} options - Details about the ui module to delete.
	 * @param {String} options.podName - Name of the pod.
	 * @param {String} options.podUrl - The full base url to the pod.
	 * @param {String} options.podApiUser - The user to authenticate with.
	 * @param {String} options.podApiKey - The api key to authenticate with.
	 * @param {String} options.moduleType - The module type (i.e. AUTH, RESET, LAUNCHPAD, etc...)
	 * @param {String} options.moduleName - The module name.
	 * @returns {Promise} A promise for completion.
	 */
	delete(options) {
		try {
			this.validateDeleteOptions(options);
			const deleteUrl = `admin/api/uiModule/delete/${options.moduleType}-${options.moduleName}`;
			const postUrl = `${options.podUrl}${deleteUrl}`;
			console.log(`\nDeleting ui module ${options.moduleType}-${options.moduleName}`);
			console.log(`POST ${postUrl}`);

			return axios({
				method: 'post',
				baseUrl: options.podUrl,
				url: postUrl,
				auth: {
					username: options.podApiUser,
					password: options.podApiKey
				}
			}).catch(error => {
				if (error && error.response && error.response.status !== 200) {
					console.error(error.response.data.exception_message);
					return Promise.reject(
						new Error(`Failed to delete module ${options.moduleName} on ${options.podName}`)
					);
				}
			});
		} catch (error) {
			return error;
		}
	}

	/**
	 * List the all the UI modules installed on the pod.
	 *
	 * @param {Object} options - Details about the ui module to list.
	 * @param {String} options.podName - Name of the pod.
	 * @param {String} options.podUrl - The full base url to the pod.
	 * @param {String} options.podApiUser - The user to authenticate with.
	 * @param {String} options.podApiKey - The api key to authenticate with.
	 * @param {String} options.moduleType - The module type (i.e. AUTH, RESET, LAUNCHPAD, etc...)
	 * @param {String} options.moduleName - The module name.
	 * @returns {Promise} A promise for completion.
	 */
	list(options) {
		if (!options.podUrl) {
			throw new Error('Unable to retrieve installed modules, missing podUrl');
		}
		if (!options.podApiUser || !options.podApiKey) {
			throw new Error('Unable to retrieve installed modules, missing podApiUser or podApiKey');
		}

		const listUrl = 'admin/api/uiModule/list/';
		const getUrl = `${options.podUrl}${listUrl}`;
		console.log(`\nRetrieving list of installed modules on ${options.podName}`);
		console.log(`GET ${getUrl}`);

		return axios({
			method: 'get',
			baseUrl: options.podUrl,
			url: getUrl,
			auth: {
				username: options.podApiUser,
				password: options.podApiKey
			}
		})
			.then(response => {
				let uiModules = response.data;
				if (options.moduleName) {
					uiModules = uiModules.filter(uiModule => uiModule.name === options.moduleName);
				}
				return uiModules;
			})
			.catch(error => {
				if (error && error.response && error.response.status !== 200) {
					console.error(error || error.response.status + ' status code');
					return Promise.reject(new Error('Failed to retrieve installed modules.'));
				}
			});
	}

	/**
	 * Generate form data for creating or updating a module based on options passed in.
	 *
	 * @param {Object} options - Details about the ui module to delete.
	 * @param {String} options.moduleType - The module type (i.e. AUTH, RESET, LAUNCHPAD, etc...)
	 * @param {String} options.moduleName - The module name.
	 * @param {String} options.moduleUrl - The url to where the module is installed, typically localhost somewhere.
	 * @param {String} options.moduleTemplate - The full text of the template to install with the module.
	 * @param {boolean} isUpdateOperation - A flag used for indicating the update operation to send "id" parameter in the request data
	 * @returns {Object} An object representing the form data for the request.
	 * @private
	 */
	generateModuleFormData(options, isUpdateOperation = false) {
		const formData = new FormData();
		formData.append('type', options.moduleType);
		formData.append('name', options.moduleName);
		formData.append('cache', options.cache ? options.cache : 'STATIC');
		formData.append('url', options.moduleUrl);
		formData.append('ttl', options.ttl ? options.ttl : -1);
		if (options.moduleTemplate) {
			formData.append('template', Buffer.from(options.moduleTemplate, 'utf8'), 'index.html');
		}
		if (isUpdateOperation) {
			formData.append('id', `${options.moduleType}-${options.moduleName}`);
		}
		return formData;
	}

	/**
	 * Deletes installed module during a node shutdown event.
	 *
	 * @param {Object} options - Details about the ui module to delete.
	 * @private
	 */
	deleteOnExit(options) {
		// Catch to make sure we only delete the ui module once on exit
		const deleteOnExit = async () => {
			if (!this.deletePromise) {
				this.deletePromise = this.delete(options);
			}
			await this.deletePromise;

			process.exit();
		};

		// Attach a listener to delete the ui module on exit.
		process.on('SIGINT', deleteOnExit);
		process.on('SIGTERM', deleteOnExit);
		process.on('SIGQUIT', deleteOnExit);
		process.on('exit', deleteOnExit);
	}
}

module.exports = new UIModuleService();
