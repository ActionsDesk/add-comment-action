import * as core from '@actions/core';
import * as github from '@actions/github';
import { WebhookPayload, PayloadRepository } from '@actions/github/lib/interfaces';
import outdent from 'outdent';
import { RepoData, IssueData } from './interfaces';

function getRepoData(repo: PayloadRepository | undefined): RepoData {
  if(repo) {
    const owner: string = repo.owner.login;
    const name: string = repo.name;

    return { owner, name };
  } else {
    throw new Error("Repository data was not found in event payload.");
  }
}
function getIssueData(issue: any): IssueData {
  if(issue) {
    const number: number = issue.number;
    return { number };
  } else {
    throw new Error("Issue data was not found in event payload.");
  }
}
function createIssueComment(message: string, status: string, mentions: string[]=[]): string {
  const statusIcon = status === 'failed' ? ':X:' : ':white_check_mark:';
  let mentionsText = '';

  for(let mention of mentions) {
    mentionsText += `@${mention} `;
  }

  const body: string = outdent`## Outcome

  ${statusIcon} ${message}

  CC: ${mentionsText}
  `;

  return body;
}
async function run(): Promise<void> {
  try {
    const message: string = core.getInput('message');
    const status: string = core.getInput('stepStatus');
    const githubToken: string = process.env.GITHUB_TOKEN || '';

    if(githubToken) {
      const octokit: github.GitHub = new github.GitHub(githubToken);

      const payload: WebhookPayload = github.context.payload;
      const issue = payload.issue;
      const repository = payload.repository;
      const { owner, name:repo } = getRepoData(repository);
      const { number } = getIssueData(issue);
      const body = createIssueComment(message, status);

      await octokit.issues.createComment({
        body,
        number,
        owner,
        repo
      });
    } else {
      throw new Error('GitHub token was not found in environment.');
    }
  } catch (error) {
    core.setFailed(error.message);
  }
}

run();
