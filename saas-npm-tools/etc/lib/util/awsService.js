/*
 * Copyright (C) 2023 Acme Technologies, Inc.  All rights reserved.
 */
'use strict';

const { STSClient, GetCallerIdentityCommand } = require('@aws-sdk/client-sts');

/**
 * AwsService
 *
 * Common utilities features for working with AWS.
 */
class AwsService {
	/**
	 * Check if the user has AWS credentials, and if they do not then fail with
	 * a helpful error message. This will not check for any specific level of
	 * IAM permissions, but instead just check that the credentials allow access
	 * to at least something.
	 *
	 * It is recommended to call this method before using any AWS requests so that
	 * engineers receive a helpful error message when their credentials are messed
	 * up.
	 *
	 * This method will also cache if the check has already been performed, and if
	 * the check will be skipped.
	 *
	 */
	async checkConnection() {
		// If we've already checked the credentials then skip the check.
		if (this.credentialsChecked) {
			return;
		}

		try {
			// The equivalent of the aws cli command:
			// aws sts get-caller-identity
			const stsClient = new STSClient();
			await stsClient.send(new GetCallerIdentityCommand({}));

			this.credentialsChecked = true;
		} catch (error) {
			throw new Error(`Error: unable to connect to AWS. Check your credentials.
For more information see: https://acme.atlassian.net/wiki/spaces/SAAS/pages/2141519984/Error+Unable+to+connect+to+AWS.

Cause: ${error}`);
		}
	}
}

module.exports = new AwsService();
