/* global octomock */
import {run} from '../src/main';

// <<<<<<< HEAD
// const functions = {
//   getInput: jest.fn(value => value),
//   debug: jest.fn(message => console.log(`MOCK DEBUG: ${message}`)),
//   setFailed: jest.fn(message => true),
//   createComment: jest.fn((message, status) => true)
// };

beforeEach(() => {
  process.env.GITHUB_TOKEN = 'not-a-token';
  let context = octomock.getContext();
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
  octomock.updateContext(context);
});

test('Main', async () => {
  await run();
  expect(octomock.mockFunctions.getInput).toHaveBeenCalledTimes(6);
  expect(octomock.mockFunctions.createComment).toHaveBeenCalled();
});

test('No status doesnt format message', async () => {
  const message = 'I am a message';

  octomock
    .getCoreImplementation()
    .getInput.mockImplementation((param: string) => {
      switch (param) {
        case 'message':
          return message;
        default:
          return undefined;
      }
    });

  await run();
  expect(octomock.mockFunctions.getInput).toHaveBeenCalledTimes(6);
  expect(octomock.mockFunctions.createComment).toHaveBeenCalledWith({
    body: message,
    issue_number: 1,
    owner: 'ezra',
    repo: 'loth-cat-pen-monitor'
  });
  expect(octomock.mockFunctions.addLabels).toHaveBeenCalledTimes(0);
});
test('Main with error', async () => {
  process.env.GITHUB_TOKEN = '';
  await run();

  expect(octomock.mockFunctions.setFailed).toHaveBeenCalled();
});
