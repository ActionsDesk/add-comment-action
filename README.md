![build-test](https://github.com/ActionsDesk/add-comment-action/workflows/build-test/badge.svg)

# GitHub Action - Add Comment Action

This GitHub action will add a comment to an issue with some minor formatting based on the status


## Usage

### Pre-requisites

Create a `workflow.yml` file in your repository's `.github/workflows` directory. An [example workflow](#example-workflow---add-new-user-to-org) is available below. For more information, reference the GitHub Help Documentation for [Creating a workflow file](https://help.github.com/en/articles/configuring-a-workflow#creating-a-workflow-file).

### Inputs

For more information on these inputs, see the [API Documentation](https://developer.github.com/v3/repos/releases/#input-2)

- `message`: The message to post on a successful status, if no other input parameters are identified, then the action will assume that this message should be posted unaltered.  Otherwise it wraps a success or failure emoji
- `failureMessage`: Optional: The message to post on a failure status.  Mandatory if using stepStatus
- `stepStatus`: Optional: The status of the previous (or any) step to trigger the message
- `successLabel`: Optional: The label to add to the issue on success
- `failureLabel`: Optional: The label to add to the issue on failure
- `mentions`: Optional: The Comma separated list of users to notify on failure


### Environment Variables

- `GITHUB_TOKEN`: Personal Access Token (PAT) of a member of the organization that has owner privileges.

#### Why is this needed

The GitHub Actions context has access to a `GITHUB_TOKEN` environment variables that is scoped to the repository that is running the Action. Adding new users to an organization requires a token with a larger scope / privileges.

- To learn more on token scopes [click here](https://developer.github.com/apps/building-oauth-apps/understanding-scopes-for-oauth-apps/#available-scopes).
- To learn how to create your own personal access token [click here](https://help.github.com/en/github/authenticating-to-github/creating-a-personal-access-token-for-the-command-line).

## Examples

### Example workflow - Comment 

This workflow will execute the `add_invite_user` action on every `issue.labeled` event triger, in other words every time a label is added to the issue and then finally make a comment on the issue based on the success or failure of the previous step.

```yaml
name: Add User from Issues

on:
  issues:
    types: [labeled]

jobs:
  create-invite:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v1
      - name: Get issue data
        uses: froi/add_invite_user@release/v1
        id: invite_user
        with:
          PARSING_RULES_PATH: ".github/parsing_rules.json"
          USER_ROLE: "direct_member"
          EMAIL: ${{ steps.get_input.outputs.email }}
        env:
          ADMIN_TOKEN: ${{secrets.ADMIN_TOKEN}}
      - name: Comment on Issue
        uses: ActionsDesk/add-comment-action@master
        with:
           message: ${{ steps.invite_user.outputs.message }}
           failureMessage: ${{ steps.invite_user.outputs.message }}
           stepStatus: ${{ steps.invite_user.outputs.stepStatus }}
           successLabel: 'processed'
           failureLabel: 'retry'
           mentions: 'Chocrates,Chocrates2'
        env: 
          GITHUB_TOKEN: ${{ secrets.ADMIN_TOKEN }}
```

### Example workflow - Add comment on a new issue unaltered
```yaml
name: Comment on new Issue

on: 
   issues:
     types: [opened]
jobs:
  add-comment:
    runs-on: ubuntu-latest
    steps:
      - name: Comment on Issue
        uses: ActionsDesk/add-comment-action@master
        with:
           message: 'Welcome to the repository!'
        env:
          GITHUB_TOKEN: ${{ secrets.ADMIN_TOKEN }}
```

This will workflow will create a new organization invitation for the user information found in the issue body.

## Contributing

Want to contribute to this GitHub Action? Fantastic! Pull requests are welcome! Please see the [CONTRIBUTING.md](CONTRIBUTING.md) for more information :heart:.

## License

The scripts and documentation in this project are released under the [MIT License](LICENSE)
