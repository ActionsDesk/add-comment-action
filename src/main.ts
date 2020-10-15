import * as core from '@actions/core';
import * as github from '@actions/github';
import {WebhookPayload} from '@actions/github/lib/interfaces';
import {
  getRepoData,
  getIssueData,
  createIssueComment,
  isSuccessful
} from './utils';

export async function run(): Promise<void> {
  try {
    const message: string = core.getInput('message');
    const failureMessage: string = core.getInput('failureMessage');
    const status: string = core.getInput('stepStatus');
    const successLabel: string = core.getInput('successLabel');
    const failureLabel: string = core.getInput('failureLabel');
    const mentions: string = core.getInput('mentions');
    const githubToken: string | undefined = process.env.GITHUB_TOKEN;

    if (githubToken) {
      const octokit: github.GitHub = new github.GitHub(githubToken);

      const payload: WebhookPayload = github.context.payload;
      const issue = payload.issue;
      const repository = payload.repository;
      const {owner, name: repo} = getRepoData(repository);
      const {number} = getIssueData(issue);
      const mentionsList = mentions ? mentions.split(',') : undefined;
      let body;
      if (status) {
        body = createIssueComment(
          isSuccessful(status) ? message : failureMessage,
          status,
          mentionsList
        );
      } else {
        body = message;
      }

      await octokit.issues.createComment({
        body,
        /* eslint-disable-next-line */
        issue_number: number,
        owner,
        repo
      });
      core.debug(`status: ${status}`);
      core.debug(`successLabel: ${successLabel}`);
      core.debug(`failureLabel: ${failureLabel}`);
      core.debug(`both?: ${successLabel && failureLabel}`);
      if (successLabel && failureLabel) {
        await octokit.issues.addLabels({
          owner,
          repo,
          /* eslint-disable-next-line */
          issue_number: number,
          labels: [`${isSuccessful(status) ? successLabel : failureLabel}`]
        });
      }
    } else {
      throw new Error('GitHub token was not found in environment');
    }
  } catch (error) {
    core.setFailed(error.message);
  }
}

run();
