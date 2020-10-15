import {PayloadRepository} from '@actions/github/lib/interfaces';
import outdent from 'outdent';
import {RepoData, IssueData} from './interfaces';

export function getRepoData(repo: PayloadRepository | undefined): RepoData {
  if (repo) {
    const owner: string = repo.owner.login;
    const name: string = repo.name;

    return {owner, name};
  } else {
    throw new Error('Repository data was not found in event payload.');
  }
}
export function getIssueData(issue: any): IssueData {
  if (issue) {
    const number: number = issue.number;
    return {number};
  } else {
    throw new Error('Issue data was not found in event payload.');
  }
}
export function createIssueComment(
  message: string,
  status: string,
  mentions?: string[]
): string {
  const statusIcon: string = isSuccessful(status)
    ? ':white_check_mark:'
    : ':x:';
  let mentionsText = '';

  if (mentions) {
    for (let mention of mentions) {
      mentionsText += `@${mention} `;
    }
  }

  const body: string = outdent`## Outcome

  ${statusIcon} ${message}

  CC: ${mentionsText}
  `;

  return body;
}

export function isSuccessful(status: string): boolean {
  return status == 'success';
}
