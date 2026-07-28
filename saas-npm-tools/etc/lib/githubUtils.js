/*
 * Copyright (C) 2021 Acme Technologies, Inc.  All rights reserved.
 */
'use strict';

const { Octokit } = require('@octokit/rest');
/**
 * A utility class for interacting with Github's rest API. A Github personal access token is required
 * for authentication. The personal access token must be provided in an enviornmental variable named
 * GITHUB_PERSONAL_ACCESS_TOKEN
 */
class GithubUtils {
	/**
	 * Retrieve the title of a github pull request.
	 *
	 * @param {String} owner - The repository owner, i.e. 'acme'.
	 * @param {String} repo - The repository name, i.e. 'saas-npm-tools'.
	 * @param {String|Number} pullNumber - The pull request number, i.e 1
	 * @returns
	 */
	async getPullRequestTitle(owner, repo, pullNumber) {
		this._init();

		const response = await this._octokit.request('GET /repos/{owner}/{repo}/pulls/{pullNumber}', {
			owner: owner,
			repo: repo,
			pullNumber: pullNumber
		});

		if (!response | (response.status !== 200) | !response.data | !response.data.title) {
			throw new Error(`Unexpected response from Github. response=${response}`);
		}

		if (response.data.commits === 1) {
			return this.getCommitMessage(owner, repo, pullNumber, response.data.title);
		} else {
			return [response.data.title];
		}
	}

	/**
	 * Recursively search the comments of a github issue until we find the
	 * one that contains the given identifier string.
	 *
	 * Note: This is issue comments, so for pull requests this only applies to comments
	 * made directly via the "Conversation" tab in the UI. This does not check comments that
	 * are related to code reviews on the PR.
	 *
	 * @param {String} owner - The repository owner, i.e. 'acme'.
	 * @param {String} repo - The repository name, i.e. 'saas-npm-tools'.
	 * @param {String|Number} issueNumber - The issue number, i.e 1
	 * @param {String} commentIdentifier - The search string to check for in the comment body.
	 * @returns {Object|null} - An issue comment matching the conditions, or null if one is not found.
	 */
	async findIssueCommentByString(owner, repo, issueNumber, commentIdentifier) {
		this._init();

		let foundComment = null;

		// https://actions-cool.github.io/octokit-rest/guide/05_pagination
		// This code fetches 30 issue comments, then checks to see if any of those match our condition.
		// If so, we break out of the loop and don't fetch anymore (via the done() function)
		// If not, then we fetch the next page of comments and check again.
		await this._octokit.paginate(
			this._octokit.issues.listComments,
			{
				owner,
				repo,
				issue_number: issueNumber
			},
			(response, done) => {
				if (!response || response.status !== 200) {
					throw new Error(
						`Unexpected response from Github when trying to find issue comments. response=${response}`
					);
				}

				response.data.forEach(comment => {
					if (comment.body.includes(commentIdentifier)) {
						foundComment = comment;
						done();
					}
				});
			}
		);

		return foundComment;
	}

	/**
	 * Posts a new comment on the given issue
	 *
	 * @param {String} owner - The repository owner, i.e. 'acme'.
	 * @param {String} repo - The repository name, i.e. 'saas-npm-tools'.
	 * @param {String|Number} issueNumber - The issue number
	 * @param {String} commentBody - The body of the comment to post
	 * @returns {Object} - The new comment data returned from Github
	 */
	async postIssueComment(owner, repo, issueNumber, commentBody) {
		this._init();

		const response = await this._octokit.issues.createComment({
			owner: owner,
			repo: repo,
			issue_number: issueNumber,
			body: commentBody
		});

		if (!response | (response.status !== 201) | !response.data) {
			throw new Error(
				`Unexpected response from Github when trying to post an issue comment. response=${response}`
			);
		}

		return response.data;
	}

	/**
	 * Updates an existing comment
	 *
	 * @param {String} owner - The repository owner, i.e. 'acme'.
	 * @param {String} repo - The repository name, i.e. 'saas-npm-tools'.
	 * @param {String|Number} commentId - The comment id to update
	 * @param {String} commentBody - The updated comment body
	 * @returns {Object} - The updated comment data returned from Github
	 */
	async updateComment(owner, repo, commentId, commentBody) {
		this._init();

		const response = await this._octokit.issues.updateComment({
			owner: owner,
			repo: repo,
			comment_id: commentId,
			body: commentBody
		});

		if (!response | (response.status !== 200) | !response.data) {
			throw new Error(`Unexpected response from Github when trying to update a comment. response=${response}`);
		}

		return response.data;
	}

	/**
	 * Retrieve the title of a github pull request and the title of its first commit.
	 *
	 * @param {String} owner - The repository owner, i.e. 'acme'.
	 * @param {String} repo - The repository name, i.e. 'saas-npm-tools'.
	 * @param {String|Number} pullNumber - The pull request number, i.e 1
	 * @param {String} prTitle - The pull request title, i.e. 'saas-npm-tools'.
	 * @returns
	 */
	async getCommitMessage(owner, repo, pullNumber, prTitle) {
		this._init();

		const response = await this._octokit.request('GET /repos/{owner}/{repo}/pulls/{pullNumber}/commits', {
			owner: owner,
			repo: repo,
			pullNumber: pullNumber
		});
		if (!response | (response.status !== 200) | !response.data | !response.data[0].commit.message) {
			throw new Error(`Unexpected response from Github. response=${response}`);
		} else {
			return [prTitle, response.data[0].commit.message];
		}
	}

	/**
	 * Add reviewers to a pull request
	 *
	 * @param {String} owner - The repository owner, i.e. 'acme'.
	 * @param {String} repo - The repository name, i.e. 'saas-npm-tools'.
	 * @param {String|Number} pull_number - The pull request number, i.e 1
	 * @param {String|Array[String]} reviewers - The reviewers, i.e. ['user1', 'user2'].
	 * @param {String|Array[String]} teamReviewers - The team reviewers, i.e. ['team1', 'team2'].
	 * @returns
	 */
	async requestReviewers(owner, repo, pull_number, reviewers = [], teamReviewers = []) {
		this._init();

		const request = {
			owner,
			repo,
			pull_number
		};

		// Only add reviewers if they exist
		if (Array.isArray(reviewers) && reviewers.length > 0) {
			request.reviewers = reviewers;
		}

		// Only add teamReviewers if they exist
		if (Array.isArray(teamReviewers) && teamReviewers.length > 0) {
			request.team_reviewers = teamReviewers;
		}

		try {
			const response = await this._octokit.rest.pulls.requestReviewers(request);
			return response.data;
		} catch (error) {
			throw new Error(`[requestReviewers]: Unexpected response from Github. response=${error})}`);
		}
	}

	/**
	 * Initalize the octokit client. We do this lazily so that the github PAT
	 * is not required until github interaction is needed.
	 */
	_init() {
		if (this._octokit) {
			return;
		}

		const personalAccessToken = process.env.GITHUB_PERSONAL_ACCESS_TOKEN;
		if (!personalAccessToken) {
			throw new Error(
				'Unable to make requests to Github because the Personal API Token is missing. The Github Personal Access token must be in the enviornmental variable "GITHUB_PERSONAL_ACCESS_TOKEN"'
			);
		}

		this._octokit = new Octokit({
			userAgent: 'acme-npm-tools',
			auth: personalAccessToken
		});
	}
}

module.exports = new GithubUtils();
