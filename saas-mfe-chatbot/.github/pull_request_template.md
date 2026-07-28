Manual Demo Link: [~insert link to demo build~]

1. **Pull Request Title**

    Format the title of your pull request as "JIRA-1234: short description". Include "[WIP]" to indicate that this pull request is not ready to be reviewed yet.

2. **UI Engineering Review**

    Post a message in your scrum's slack channel requesting a review of this pull request from another UI engineer.

3. **UX Review (if needed)**

    If this change modifies the UI in a visual way or is a change to how the UI behaves then it requires a [UI Review](https://acme.atlassian.net/wiki/spaces/SAAS/pages/99385540/UI+Review+Process). To start a UI Review, create a slack thread in [#proj-ui-review](https://slack.com/app_redirect?channel=proj-ui-review) with a link to the demo, jira ticket, a short description of how to view the changes, optionally any screenshots, and finally mention `@ui-review` to start the review.

4. **Manual Verification (if needed)**

    If this change modifies code that runs in a user's browser (i.e. not tests or build scripts) then it requires a manual verification. Please create a jira sub-task for manual verification with a description that lists the test cases that should be verified for this change. Post a message in your scrum's slack channel requesting a manual verification of this pull request.

    If this change modifies either the [acme-angular-common](https://github.com/acme/acme-angular-common/blob/master/CHANGELOG.md) or [cloud-ui-common dependencies](https://github.com/acme/cloud-ui-common/blob/master/CHANGELOG.md), please consult those projects change log for the changes being released. Then consult the [dependency change checklist](https://app.getguru.com/card/cKLMKkXi/UI-Dependency-Change-Checklist) for an additional manual verification steps that should be re-verified with this update.

5. **Passing Pull-Request-Builder (PRB)**

    Receive a passing green run from the pull request builder. The PRB verifies that all the tests, linting, and build checks pass.

6. **Update Jira Issue**

    If the Jira issue has only one pull request against this repository then set the `Releasable Component: saas-mfe-chatbot` field. In addition set the `Deploy Risk: Low|Medium|High` field depending on how risky this change is to cause a regression when deployed.

    If the Jira issue has multiple pull requests against other repositories then create a sub-task for each repository affected. On the sub-task for this repository set the `Releasable Component: saas-mfe-chatbot` field, and the `Deploy Risk: Low|Medium|High` field depending on how risky this change is to cause a regression when deployed. Use the parent's Jira key for the PR title and all other communication about the issue. The sub-task will track when this change is deployed.

When all of the above have been completed you may squash and merge your pull request, then move the Jira issue to `Pre-Release` status.
