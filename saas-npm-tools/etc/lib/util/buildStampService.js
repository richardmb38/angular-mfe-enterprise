/*
 * Copyright (C) 2017 Acme Technologies, Inc.  All rights reserved.
 */

/**
 * A simple service to stamp a build with build information. The stamp will include some
 * basic date time, git information, and who is building the thing. This makes it easier
 * to figure out what you're looking at in the HTML page.
 */
class BuildStampService {
	/**
	 * Stamp the provided HTML with build information.
	 *
	 * @param {ReplaceSource} source - The webpack ReplaceSource of the HTML to stamp, it must have a closing body tag.
	 * @param {String} [buildNumber] - A build number for this build (optional)
	 * @param {String} [buildTarget] - A build target for this build, such as dev
	 *    or prod. (optional)
	 * @param {Boolean} [devServer=false] - Flag to only include a  amount of non-transient data in the build stamp.
	 *    This is used when running under the dev server so that the build stamp does not change between each recompile so
	 *    the time and extra git info is left off the stamp.
	 *
	 * @return {Promise<String>} A promise for the updated stamped source.
	 */
	async stamp(source, buildNumber, buildTarget, devServer) {
		const stamp = this._generateBuildStamp(buildNumber, buildTarget, devServer);
		return this._insertBuildStamp(source, stamp);
	}

	/**
	 * Generate a build stamp HTML comment.
	 *
	 * @param {String} [buildNumber] - A build number for this build (optional)
	 * @param {String} [buildTarget] - A build target for this build, such as dev
	 *    or prod. (optional)
	 * @param {boolean} [devServer] - A flag to include limited information in the stamp for the dev server.
	 * @returns {String} The build stamp.
	 * @private
	 */
	_generateBuildStamp(buildNumber, buildTarget, devServer) {
		const username = process.env.RELEASE_AGENT || process.env.USER || process.env.USERNAME;

		const stampInfo = [];
		stampInfo.push(`Built on: ${this._today(devServer)}`);
		if (username) {
			stampInfo.push(`Built by: ${username}`);
		}
		if (buildNumber) {
			stampInfo.push(`Built Number: ${buildNumber}`);
		}
		if (buildTarget) {
			stampInfo.push(`Built Target: ${buildTarget}`);
		}

		return `
<!--
	${stampInfo.join('\n\t')}
-->
`;
	}

	/**
	 * Insert the build stamp into the html.
	 *
	 * @param {ReplaceSource} source - The HTML to insert the stamp into.
	 * @param {String} buildStamp - The stamp to insert.
	 * @returns {String} The stamped HTML.
	 * @private
	 */
	_insertBuildStamp(source, buildStamp) {
		// This is needed to support ext modules build process where the source is string.
		if (typeof source === 'object') {
			const insertionPoint = source.original().source().lastIndexOf('</body>');
			source.insert(insertionPoint, buildStamp);
		} else {
			source = source.replace('</body>', `${buildStamp}</body>`);
		}

		return source;
	}

	/**
	 * Return the current date time formatted as: YYYY/MM/DD HH:MM:SS
	 *
	 * @param {boolean} excludeTime - A flag to exclude the time from the result.
	 * @returns {String} The current date time.
	 * @private
	 */
	_today(excludeTime) {
		const date = new Date();

		let hour = date.getHours();
		hour = (hour < 10 ? '0' : '') + hour;

		let min = date.getMinutes();
		min = (min < 10 ? '0' : '') + min;

		let sec = date.getSeconds();
		sec = (sec < 10 ? '0' : '') + sec;

		const year = date.getFullYear();

		let month = date.getMonth() + 1;
		month = (month < 10 ? '0' : '') + month;

		let day = date.getDate();
		day = (day < 10 ? '0' : '') + day;

		let today = `${year}/${month}/${day}`;

		if (!excludeTime) {
			today += ` ${hour}:${min}:${sec}`;
		}

		return today;
	}
}

module.exports = new BuildStampService();
