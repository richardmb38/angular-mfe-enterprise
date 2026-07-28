# npm-tools Release Process

npm-tools is intended to be a collection of usefull build time services for npm-based projects. Any Acme npm-based project may use the services from this package to help with releasing npm artifacts. This project is designed to be deployed as an NPM package hosted on [AWS’s CodeArtifact private package repository](https://aws.amazon.com/blogs/devops/publishing-private-npm-packages-aws-codeartifact/). The [AWS Command Line Interface](<https://acme.atlassian.net/wiki/spaces/SAAS/pages/102072399/Setting+up+SaaS+UI+Dev+Environment#10)-Setup-AWS-CLI>) version 2.0+ must be installed in order to publish new versions to AWS CodeArtifact.

The features this project provides:

1. Publishing Scripts

    This package provides scripts to run before/after publishing to verify everything about the build to be published. Verify that production versions are built from production branches, have no other changes to the working directory, and make sure that the working directory is up-to-date with origin. All in an effort of preventing humans from publishing bad artifacts.

2. Changelog

    Each time a version is published a changelog for those changes will be created in Github's wiki space.

3. Pull Request Title Verification

    Scripts to verify that pull request titles meet Acme's convetion for including Jira issues, and if a shared library have semver version labels.

4. Dependency Audit Management (Soon)

    Soon this package will also help with managing dependencies.

Changes to npm-tools should be done in a feature branch, then submitted via PR to a production branch. When the PR is approved, the changes can be merged into a production branch. Once the changes are merged, a new production version can be published from the target production branch.

As changes are made to npm-tools, new versions can be published to the NPM repository. Two types of versions can be published: **Production Versions** and **Development Versions**. Which type of version is published depends on the current git branch and the new version number provided.

## Release a new version

A new version of npm-tools is published by entering the following command:

`npm release --newVersion=<the_version_number>`

## Production Versions

### Semver Format

A production version is defined by the format of the required version number. A production version number must follow the semver [format](https://semver.org/).

### Production Branch

Production versions can only be published from a production branch. Production Branches are defined by the [package.json](https://github.com/acme/saas-npm-tools/blob/master/package.json) file, in the `acme.prodBranches` section (`master` should be included as a production branch).

### Example semver version number

1.88.2

## Development Versions

Development versions are defined by non-semver version numbers, and can be published from any branch. As such, production versions do not have to be merged into a production branch before publishing changes to the NPM repository.

### Example development version number

1.88.2-somefeature

## NPM Scripts

These npm run scripts should be defined in each project that uses npm-tools.

### npm:login

In order to publish an NPM package to a private repository, NPM has to be configured to resolve scoped packages to the correct private repository. To that end, a convenience script (`npm:login`) has been provided in the [package.json](https://github.com/acme/saas-npm-tools/blob/master/package.json) file. Running this script updates your npm configuration to use the CodeArtifact repository and sets an authentication token, which expires after 15 minutes. The local `.npmrc` file is updated each time. This script is used by the publishing process.

### release

Releasing a new version is done with the native [npm publish](https://docs.npmjs.com/cli/v7/commands/npm-publish) command. Projects which use npm-tools typicaly define a `release` command which uses the native `publish` command and requires a `--newVersion` argument. For example: `npm release --newVersion=1.2.3`.

Projects should define a release script similar to this example which will run prepublishing checkins (described below in more detail), the actual publishing, and additional cleanup after the publishing.

`npm run npm:login && node node_modules/@acme-priv/npm-tools/etc/scripts/prePublishChecks.js && npm run publish && node node_modules/@acme-priv/npm-tools/etc/scripts/postPublishChecks.js`

Breaking down that script into parts:

1. `npm run npm:login`
   This authenticates with the private repository for publishing packages.
2. `prePublishChecks.js`
   This script runs a number of checks prior to publishing

	- The version passed is tagged for automatic versioning.
    - The version number format is validated.
    - The version is not already published to the NPM repository.

	If the version is tagged for automatic version incremenation:

	- The most recent production version is retrieved using gitUtils.
	- The most recent commit on the master branch is retrieved using gitUtils and incremented based on the semVer in the title.
	- The newVersion is set to the newly calculated version.

    If this is a production version, a number of checks are done:

    - The current branch is a production branch.
    - There are no uncommitted changes in the repo.
    - The local repo is not ahead or behind the origin branch.
    - There is not a git tag defined for the new version number.

    If the release is verified as a production version:

    - The git repository is tagged with the new version number.
    - The change log is updated. The change log file is stored in the wiki for this repo. Because there can be several production branches, a specific change log file is updated for the current branch.

3. `npm publish`
   The standard npm publish command.
4. `postPublishCheck.js`
   This script reverts changes to the package.json version back to what it was originally.

The native behavior of the NPM `publish` command uses the `version` setting in the `package.json` file to determine the version published to the remote repository. npm-tools maintains a version number of `0.0.0`. The pre-publish script temporarily assigns the new version number (among other things) before publishing. After publishing, the post-publish script then reverts the version back to `0.0.0`.

#### Releasing First Version

To publish your first version there are two things which you need to do in order to use the features of this library.

1. Create a GitHub wiki for your project. To do that go to your GitHub repo, click the wiki tab and click the green button "Create the first page". This will initialize the repo, where change logs will be stored.

2. For the initial release add the extra parameter `--firstVersion=true`. This will solve the bootstrapping problem where the change log scripts need to identify the previous version in order to understand what has changed. Here's an example of the command:

```
npm run release --newVersion=0.0.0 --firstVersion=true
```

## Release Artifacts

A successful production release produces the following changes:

-   A new version of the NPM package on CodeArtifact [@acme-priv/saas-npm-tools](https://console.aws.amazon.com/codesuite/codeartifact/d/406205545357/acme-priv/r/acme-priv/p/npm/acme-priv/saas-npm-tools/versions?region=us-east-1&package-versions-meta=eyJmIjp7fSwicyI6e30sIm4iOjIwLCJpIjowfQ)
-   A new version of the NPM package on Artifactory [@acme-priv/saas-npm-tools](https://acme.jfrog.io/ui/packages/npm:%2F%2F@acme-priv%2Fnpm-tools?name=acme-priv&type=packages)
-   A new [tag in the npm-tools git repository](https://github.com/acme/saas-npm-tools/tags)
-   An updated [Change Log](https://github.com/acme/saas-npm-tools/wiki)

A development release only results in a new version to the NPM package.
