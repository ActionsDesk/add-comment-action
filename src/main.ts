import * as core from '@actions/core';
import * as github from '@actions/github';
import {WebhookPayload} from '@actions/github/lib/interfaces';
import {getRepoData, getIssueData, createIssueComment} from './utils';

export async function run(): Promise<void> {
  try {
    const message: string = core.getInput('message');
    const status: string = core.getInput('stepStatus');
    const githubToken: string | undefined = process.env.GITHUB_TOKEN;

    if (githubToken) {
      const octokit: github.GitHub = new github.GitHub(githubToken);

      const payload: WebhookPayload = github.context.payload;
      const issue = payload.issue;
      const repository = payload.repository;
      const {owner, name: repo} = getRepoData(repository);
      const {number} = getIssueData(issue);
      const body = createIssueComment(message, status);

      await octokit.issues.createComment({
        body,
        number,
        owner,
        repo
      });
    } else {
      throw new Error('GitHub token was not found in environment');
    }
  } catch (error) {
    core.setFailed(error.message);
  }
}

run();
