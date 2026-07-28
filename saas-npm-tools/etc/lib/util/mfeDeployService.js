/*
 * Copyright (C) 2022 Acme Technologies, Inc.  All rights reserved.
 */

const { DynamoDBClient, PutItemCommand, DeleteItemCommand } = require('@aws-sdk/client-dynamodb');
const awsService = require('./awsService.js');

// The deployment table where MFEs deployments are recorded.
const DEPLOYMENT_TABLE = 'micro-frontend-deployments';

/**
 * Dynamo expects a specific payload representing a value type
 * @param {*} value
 * @returns Dynamo's representation of the value in the final payload to the PUT command
 */
const getDynamoValue = value => {
	if (value instanceof Date) {
		// DynamoDB's Date is the number of seconds since since the epic 1970.
		return { N: '' + Math.floor(value / 1000) };
	}
	// for the moment, it only supports dates. Act as the identity function otherwise as fail-safe
	return value;
};

/**
 * Utility class to install and uninstall ui modules on cloud commander.
 */
class MfeDeployService {
	/**
	 * Setup AWS and the dynamodb client.
	 */
	constructor() {
		this.dynamoDBEast = new DynamoDBClient({ region: 'us-east-1' });
		this.dynamoDBWest = new DynamoDBClient({ region: 'us-west-2' });
	}

	/**
	 * Deploy an mfe build
	 *
	 * @param {Object} options - An object of properties for the build to deploy.
	 * @param {String} options.app - The app to deploy the mfe into. (ie. sp:home)
	 * @param {String} options.mfe - The mfe to deploy (ie. saas-sp-app-switcher)
	 * @param {String} options.build - The build identifier (ie build1234)
	 * @param {string} options.name - The name of the specific mfe build to deploy (ie. PLTUI-1234)
	 * @param {string} options.url - The url where the mfe is published and accessible.
	 * @param {Date} options.ttl - The time-to-live that this deploy should remain active. This
	 *    value is measured in seconds.
	 * @param {string} [options.metadata] - Metadata is `mfe.json` file serialized so sp-renderer can access dev server MFEs.
	 *    This should be only used in case of dev server (running `ng serve`)
	 * @param {boolean} options.undeployOnExit - Flag to register this module to be undeployed on
	 * exit.
	 * @returns A promise for completion.
	 */
	async deploy(options) {
		if (!options.app) {
			throw new Error('Unable to deploy mfe, missing app (i.e. sp:home)');
		}
		if (!options.mfe) {
			throw new Error('Unable to deploy mfe, missing mfe (i.e. saas-app-switcher)');
		}
		if (!options.build) {
			throw new Error('Unable to deploy mfe, missing build number (build1234)');
		}
		if (!options.url) {
			throw new Error('Unable to deploy mfe, missing url (i.e. https://something/app/build1234/main.js');
		}
		if (options.ttl && !(options.ttl instanceof Date)) {
			throw new Error('Unable to deploy mfe, ttl is not a date object');
		}
		if (options.builtAt && !(options.builtAt instanceof Date)) {
			throw new Error('Unable to deploy mfe, builtAt is not a date object');
		}

		await awsService.checkConnection();

		let deploy = options.mfe;
		if (options.name) {
			deploy = `${options.mfe}:${options.name}`;
		}

		const params = {
			TableName: DEPLOYMENT_TABLE,
			Item: {
				app: { S: options.app },
				build: { S: options.build },
				deploy: { S: deploy },
				url: { S: options.url }
			}
		};

		if (options.ttl) {
			params.Item.ttl = getDynamoValue(options.ttl);
		}

		if (options.builtAt) {
			params.Item.builtAt = getDynamoValue(options.builtAt);
		}

		if (options.metadata) {
			params.Item.metadata = { S: options.metadata };
		}

		console.log(`Deploying ${options.mfe} into ${options.app}:\n${JSON.stringify(params, null, 2)}`);
		try {
			await this.dynamoDBEast.send(new PutItemCommand(params));
			await this.dynamoDBWest.send(new PutItemCommand(params));
		} catch (error) {
			throw new Error(`Failed to deploy mfe because: ${error.stack}`);
		}

		if (options.undeployOnExit) {
			this._undeployOnExit(options);
		}
		console.log('Deployment was successful');
	}

	/**
	 * Undeploy an mfe build.
	 *
	 * @param {object} options - An object of properties of the build to undeploy.
	 * @param {string} options.app - The app to undeploy the mfe from. (ie. sp:home)
	 * @param {string} options.mfe - The name of the mfe to undeploy. (ie. saas-sp-app-switcher)
	 * @param {string} options.name - The name of the specific mfe build to undeploy. (ie. PLTUI-1234)
	 * @returns a promise for completion.
	 */
	async undeploy(options) {
		if (!options.app) {
			throw new Error('Unable to undeploy mfe, missing app (i.e. sp:home)');
		}
		if (!options.mfe) {
			throw new Error('Unable to undeploy mfe, missing mfe (i.e. saas-app-switcher)');
		}
		if (!options.name) {
			throw new Error(
				'Unable to undeploy mfe, missing name (i.e. the ?ui= switch. The service does not allow undeploying default mfes.)'
			);
		}

		const deploy = `${options.mfe}:${options.name}`;

		const params = {
			TableName: DEPLOYMENT_TABLE,
			Key: {
				app: { S: options.app },
				deploy: { S: deploy }
			}
		};

		console.log(`Undeploying ${deploy} from ${options.app}:\n${JSON.stringify(params, null, 2)}`);

		try {
			await this.dynamoDBEast.send(new DeleteItemCommand(params));
			await this.dynamoDBWest.send(new DeleteItemCommand(params));
		} catch (error) {
			throw new Error(`Failed to undeploy mfe because: ${error.stack}`);
		}

		console.log('Undeployment was successful');
	}

	/**
	 * Private method
	 *
	 * Undeploy a build when node exits either from a control-c interrupt, on error, or a graceful
	 * shutdown because there is no more work to be done.
	 * @param options
	 */
	_undeployOnExit(options) {
		/**
		 * Handle interrupt signals. The best example of this is control-C in the terminal
		 * to stop the process. Asynchronous events can happen in response to signals.
		 *
		 * Node has a default SIGINT handler that will cause node to exit. The default
		 * handler is only invoked if there are no listeners for this signal. Therefore we
		 * will simulate the terminal clear, and exit for SIGINT signal.
		 *
		 * https://nodejs.org/api/process.html#signal-events
		 */
		const handleSIGINT = async signal => {
			console.log(`Received '${signal}' signal`);
			unregisterHandlers();

			await this.undeploy(options);

			process.stdout.write('\u033c');
			process.exit(128);
		};

		/**
		 * Handle beforeExit events. The beforeExit is event is fired when the event loop
		 * has no more threads to fire. BeforeExit handlers may call asynchronous events,
		 * and once there is no more work in the event loop node will exit normally.
		 *
		 * https://nodejs.org/api/process.html#event-beforeexit
		 */
		const handleBeforeExit = async () => {
			console.log("Received 'beforeExit' event");
			unregisterHandlers();

			await this.undeploy(options);
		};

		/**
		 * Handle the exit event. The Exit event will always be called so long as node
		 * itself hasn't crashed. However there is a big limitation, everything in
		 * response to the exit event must be synchronous. No asynchronous events can
		 * be handled. That means we can't even get the response from our dynamodb
		 * delete command. The only thing we can do is cause node to go into and a
		 * synchronous loop for a little while in the hopes that it gives the network
		 * request enough time to complete before node closes the connection.
		 *
		 * https://nodejs.org/api/process.html#event-exit
		 */
		const handleExit = () => {
			console.log("Received 'exit' event");

			this.undeploy(options);

			const start = new Date().getTime();
			// eslint-disable-next-line no-empty
			while (new Date().getTime() - start < 1000) {}
		};

		/**
		 * Unregister all the undeploy on exit handles so that we only undeploy once.
		 * However removing a listener from a listener, can cause the current event
		 * to be aborted. To prevent that we don't remove the current handler by name.
		 */
		const unregisterHandlers = name => {
			process.off('beforeExit', handleBeforeExit);
			process.off('exit', handleExit);
			setTimeout(() => {
				// Removing the SIGINT handler in direct response to the signal
				// sometimes causes the default handler to be invokes, so we schedule
				// this on a callback to be removed immediately after the signal has
				// been handled.
				process.off('SIGINT', handleSIGINT);
			}, 0);
		};

		process.on('SIGINT', handleSIGINT);
		process.on('beforeExit', handleBeforeExit);
		process.on('exit', handleExit);
	}
}

module.exports = new MfeDeployService();
