/*
 * Copyright (C) 2021 Acme Technologies, Inc.  All rights reserved.
 */
'use strict';

/**
 * A utility class for getting command line parameters either from NPM's configuration or directly from
 * the command line.
 */
class CommandLineUtils {
	/**
	 * Retrieve a command line argument either from one of npm environmental variables or directly from the
	 * command line of this process.
	 *
	 * @param {string} name - The name of the command line argument.
	 * @returns The value, or undefined if not found.
	 */
	getArgument(name) {
		// First, look in the old npm config value which placed command line parameters as case sensitive.
		// --fooBar would be npm_config_fooBar
		const oldNpmConfigValue = process.env[`npm_config_${name}`];
		if (oldNpmConfigValue) {
			return oldNpmConfigValue;
		}

		// Second, look in the new npm config value which is case insensitive with all parameters as lower case.
		// --fooBar would be npm_config_foobar
		const newNpmConfigValue = process.env[`npm_config_${name.toLowerCase()}`];
		if (newNpmConfigValue) {
			return newNpmConfigValue;
		}

		// Lastly, look on this process command line parameters directly.
		for (const argument of process.argv) {
			if (argument && argument.startsWith(`--${name}`)) {
				if (argument.length > `--${name}=`.length) {
					// String command line parameter.
					return argument.substring(`--${name}=`.length);
				} else if (argument.length === `--${name}`.length) {
					// Boolean command line parameter.
					return true;
				}
			}
		}

		// The argument was not found.
		return undefined;
	}

	/**
	 * Retrieve a command line argument, and if it is not fail then throw an error with the provided error
	 * message.
	 *
	 * @param {string} name - The name of the command line argument.
	 * @param {string} failureMessage - An failure message for when the argument was not provided.
	 * @returns the value, or throws an error.
	 */
	getRequiredArgument(name, failureMessage) {
		const value = this.getArgument(name);

		if (value === undefined) {
			throw new Error(failureMessage);
		}
		return value;
	}
}

module.exports = new CommandLineUtils();
