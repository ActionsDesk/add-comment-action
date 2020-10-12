/* global octomock */
import outdent from 'outdent'
import {run} from '../src/main';

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

test(`No status doesnt format message`, async () => {
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
test(`Message formatted with all inputs and status is success`, async () => {
  const message = 'I am a message' ;

  /**
   * Formatted message by the inclusion of other actions inputs
   */
  const createCommentInput = outdent`## Outcome

  :white_check_mark: I am a message

  CC: @Hera @Sebine @Chopper @Kannan @Ezra @Zeb `;

  octomock
    .getCoreImplementation()
    .getInput.mockImplementation((param: string) => {
      switch (param) {
        case 'message':
          return message;
        case 'stepStatus':
          return 'success';
        case 'successLabel':
          return 'successLabel';
        case 'failureLabel':
          return 'failureLabel';
        case 'mentions':
          return 'Hera,Sebine,Chopper,Kannan,Ezra,Zeb';
        default:
          return undefined;
      }
    });

  await run();
  expect(octomock.mockFunctions.getInput).toHaveBeenCalledTimes(6);
  // expect(octomock.mockFunctions.createComment).toEqual(expected);
  expect(octomock.mockFunctions.createComment).toHaveBeenCalledWith({
    body: createCommentInput,
    issue_number: 1,
    owner: 'ezra',
    repo: 'loth-cat-pen-monitor'
  });
  expect(octomock.mockFunctions.addLabels).toHaveBeenCalled();
});
test('Main with error', async () => {
  process.env.GITHUB_TOKEN = '';
  await run();

  expect(octomock.mockFunctions.setFailed).toHaveBeenCalled();
});
