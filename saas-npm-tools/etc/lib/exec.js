/*
 * Copyright (C) 2021 Acme Technologies, Inc.  All rights reserved.
 */
'use strict';

const spawn = require('cross-spawn');
/**
 * Utility methods to execute shell commands.
 */
class Exec {
	/**
	 * Simple utility method to spawn a command asynchronously and resolve a promise when it is complete.
	 * The promise result will be:
	 * {
	 *     command:  The command run
	 *     args:     The arguments to the command run
	 *
	 *     code:     The command's result code.
	 *     stdout:   Standard out from the command.
	 *     stderr:   Standard error from the command.
	 * }
	 *
	 * @param {String} command - The command to run, must be on the user's path.
	 * @param {String[]} args - List of command line arguments. They must be split out into an array.
	 * @param {Object} options - A set of options.
	 * @param {Boolean} options.resolveOnFailure=false - If true, then when the command results in an
	 *      failure status code (i.e. anything other than zero) the promise will still be resolved and
	 *      include the status code, stdout, & stderr. If false then the promise is rejected with an
	 *      error message.
	 *
	 * @returns {Promise<Object>} A promise for the result of the command.
	 * @private
	 */
	spawn(command, args, options) {
		options = options || {};

		return new Promise((resolve, reject) => {
			const process = spawn(command, args);

			let stdout = '';
			let stderr = '';
			process.stdout.on('data', data => {
				stdout += data;
			});

			process.stderr.on('data', data => {
				stderr += data;
			});

			process.on('close', code => {
				if (!options.resolveOnFailure && code !== 0) {
					if (stdout) {
						console.error(stdout);
					}
					if (stderr) {
						console.error(stderr);
					}
					return reject(new Error(`Command "${command} ${args.join(' ')}" failed with status code: ${code}`));
				}

				resolve({
					command,
					args,

					code,
					stdout,
					stderr
				});
			});
		});
	}

	/**
	 * Simple utility method to spawn a command synchronously it will return a resulting object when the command
	 * has completed execution:
	 * {
	 *     command:  The command run
	 *     args:     The arguments to the command run
	 *
	 *     code:     The command's result code.
	 *     stdout:   Standard out from the command.
	 *     stderr:   Standard error from the command.
	 * }
	 *
	 * @param {String} command - The command to run, must be on the user's path.
	 * @param {String[]} args - List of command line arguments. They must be split out into an array.
	 * @param {Object} options - A set of options.
	 * @param {Boolean} options.returnOnFailure=true - If true, then when the command results in an
	 *      failure status code (i.e. anything other than zero) then an exception will be thrown.
	 *
	 * @returns {Promise<Object>} A promise for the result of the command.
	 * @private
	 */
	spawnSync(command, args, options) {
		options = options || {};
		const process = spawn.sync(command, args);

		if (!options.returnOnFailure && process.status !== 0) {
			if (process.stdout) {
				console.error(process.stdout.toString());
			}
			if (process.stderr) {
				console.error(process.stderr.toString());
			}
			throw new Error(
				new Error(
					`Command "${command} ${args.join(' ')}" failed with status code: ${process.status}. ${
						process.error
					}`
				)
			);
		}
		return {
			command: command,
			args: args,

			code: process.status,
			stdout: process.stdout.toString('utf8'),
			stderr: process.stderr.toString('utf8')
		};
	}

	/**
	 * Wrapper to make executing a shell command easier. Uses synchronous implementation and logs the command to the console.
	 *
	 * The command is parsed on spaces. If using a command that has spaces in a parameter, the command must be formatted
	 * to be an array of strings. See examples below.
	 *
	 * Example with spaces
	 *
	 * command: git commit -m "some message with spaces"
	 * usage:  easySync(['git','commit','-m','some message with spaces']);
	 *
	 * Example without spaces
	 *
	 * command: git commit -m `Release${release}`
	 * usage: easySync(`git commit -m "Release${release}"`);
	 *
	 * @param {String} command - The shell command to execute.
	 * @returns {String} The command's output, only stdout.
	 */
	easySync(command) {
		if (!Array.isArray(command)) {
			command = command.split(' ');
		}

		console.log(`> ${command.join(' ')}`);

		const result = this.spawnSync(command[0], command.slice(1));
		console.log(result.stdout);
		return result.stdout;
	}
}

module.exports = new Exec();
