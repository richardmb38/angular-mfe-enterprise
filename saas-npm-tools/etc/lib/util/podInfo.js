/*
 * Copyright (C) 2017 Acme Technologies, Inc.  All rights reserved.
 */

const { DynamoDBClient, GetItemCommand } = require('@aws-sdk/client-dynamodb');
const awsService = require('./awsService.js');

// The dynamo table where all the pod info lives.
const API_INFO_TABLE_NAME = 'api_info';

// In order to limit the number of lookups we cache the
// pod information.
const podInfoCache = {
	dev: {
		region: undefined,
		domain: 'http://dev.cloud.acme.com:8080/',
		type: 'local',
		apiUser: '39xU32x5hT21',
		apiKey: '4582c8dkT2x839sypaPtke3'
	}
};

/**
 * Retrieve IdentityNow pod Information.
 */
class PodInfo {
	/**
	 * Construct a new PodInfo object.
	 */
	constructor() {
		this._dynamodb = new DynamoDBClient();
	}

	/**
	 * Retrieve information about a pod by name. The data returned is:
	 * {
	 *   region:  // The AWS region of the pod
	 *   domain:  // The full url to the domain of the pod.
	 *   type:    // The pod type, dev or prod.
	 *   apiUser: // The admin api user, not logged
	 *   apiKey:  // The admin api key, not logged
	 * }
	 *
	 * @param {String} podName - The name of the pod
	 * @returns {Promise} For an object with information about the pod.
	 */
	getByName(podName) {
		if (podInfoCache[podName]) {
			return this._cacheLookup(podName);
		} else {
			return this._dynamodbLookup(podName);
		}
	}

	/**
	 * Lookup the pod info in the local cache.
	 *
	 * @param {String} podName - The name of the pod.
	 * @returns {Promise} For the pod information.
	 * @private
	 */
	_cacheLookup(podName) {
		return new Promise(resolve => {
			console.log(`Retrieving pod info from the cache for "${podName}":`);
			const podInfo = podInfoCache[podName];
			console.log(JSON.stringify(podInfo['region'], null, '\t'));
			console.log(JSON.stringify(podInfo['domain'], null, '\t'));
			console.log(JSON.stringify(podInfo['type'], null, '\t'));
			resolve(podInfo);
		});
	}

	/**
	 * Lookup the pod info in the dynamodb table.
	 *
	 * @param {String} podName - The name of the pod.
	 * @returns {Promise} A promise for the pod information.
	 * @private
	 */
	async _dynamodbLookup(podName) {
		await awsService.checkConnection();
		console.log(`Retrieving pod info from dynamodb for "${podName}":`);

		let data;
		try {
			data = await this._dynamodb.send(
				new GetItemCommand({
					Key: {
						_pod: {
							S: podName
						}
					},
					TableName: API_INFO_TABLE_NAME
				})
			);
		} catch (error) {
			throw new Error(`Failed to load pod information from DynamoDB because: ${error}`);
		}

		if (!data || !data.Item) {
			throw new Error(`Did not find any pod by the name '${podName}', are you sure it exists?`);
		}

		if (
			!data.Item.POD_DOMAIN ||
			!data.Item.TYPE ||
			!data.Item.API_USER ||
			!data.Item.API_KEY ||
			!data.Item.REGION
		) {
			console.error('Pod data received: ', data);
			throw new Error('Missing required pod information.');
		}

		const podInfo = {
			region: data.Item.REGION.S,
			domain: data.Item.POD_DOMAIN.S,
			type: data.Item.TYPE.S,
			apiUser: data.Item.API_USER.S,
			apiKey: data.Item.API_KEY.S
		};
		podInfoCache[podName] = podInfo;
		console.log(JSON.stringify(podInfo['region'], null, '\t'));
		console.log(JSON.stringify(podInfo['domain'], null, '\t'));
		console.log(JSON.stringify(podInfo['type'], null, '\t'));

		return podInfo;
	}
}

module.exports = new PodInfo();
