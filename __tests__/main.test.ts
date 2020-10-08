jest.mock('@actions/core');
jest.mock('@actions/github');
const {GitHub, context} = require('@actions/github');
const core = require('@actions/core');

import {run} from '../src/main';

const functions = {
  getInput: jest.fn(value => value),
  debug: jest.fn(message => console.log(`MOCK DEBUG: ${message}`)),
  setFailed: jest.fn(message => true),
  createComment: jest.fn((message, status) => true)
};
beforeEach(() => {
  process.env.GITHUB_TOKEN = 'not-a-token';
  core.getInput = functions.getInput;
  core.debug = functions.debug;
  core.setFailed = functions.setFailed;

  context.payload = {
    repository: {
      name: 'loth-cat-pen-monitor',
      owner: {
        login: 'ezra'
      }
    },
    issue: {
      number: 1
    }
  };
  GitHub.mockImplementation(() => {
    return {
      issues: {
        createComment: functions.createComment
      }
    };
  });
});
test('Main', async () => {
  await run();

  expect(functions.getInput).toHaveBeenCalledTimes(2);
  expect(functions.createComment).toHaveBeenCalled();
});
test('Main with error', async () => {
  process.env.GITHUB_TOKEN = '';
  await run();

  expect(functions.setFailed).toHaveBeenCalled();
});
