/*
 * Copyright (C) 2023 Acme Technologies, Inc.  All rights reserved.
 */
'use strict';

const githubUtils = require('../githubUtils.js');

/**
 * GithubCommentService
 *
 * Service to provide business logic for common operations on github issue comments.
 */
class GithubCommentService {
	/**
	 * Searches for an existing issue comment that contains the identifier string and updates that comment with the
	 * provided commentBody.
	 * If no existing comment is found, then a new comment will be added to the issue.
	 *
	 * @param {String} repoOwner - The repository owner, i.e. 'acme'.
	 * @param {String} repoName - The repository name, i.e. 'saas-npm-tools'.
	 * @param {String|Number} issueNumber - The issue number, i.e 1
	 * @param {String} commentBody - The full content of the comment.
	 * @param {String} identifierString - String used to look for an existing comment to update.
	 * @returns {Promise} - A promise of the request to add or update the comment.
	 */
	async updateIssueCommentByString(repoOwner, repoName, issueNumber, commentBody, identifierString) {
		const existingComment = await githubUtils.findIssueCommentByString(
			repoOwner,
			repoName,
			issueNumber,
			identifierString
		);

		if (existingComment) {
			return githubUtils.updateComment(repoOwner, repoName, existingComment.id, commentBody);
		}

		return githubUtils.postIssueComment(repoOwner, repoName, issueNumber, commentBody);
	}
}

module.exports = new GithubCommentService();
