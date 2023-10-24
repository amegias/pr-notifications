[![.github/workflows/test.yaml](https://github.com/amegias/pr-notifications/actions/workflows/test.yaml/badge.svg)](https://github.com/amegias/pr-notifications/actions/workflows/test.yaml)

# PR-Notifications action

This action generates notifications for expired pull requests. A pull request is considered expired depending on the `default-ttl` and/or `labels-ttl`.
Given a default PR TTL and a set of TTL per label, it calculates if the PR is expired or not based on its creation date and the last `reopened` event. If it is, it will generate notifications for its pending reviewers.
The PRs without reviewers and draft PRs will be discarded.

## Inputs

### `access-token` (Required)

The GitHub token needed to request info about the PRs of the repo and reviewers.

### `default-ttl` (Optional)

The elapsed time (in seconds) to consider a pull request expired if the interval between its creation time and now exceeds that time.
If it is null, the pull request will not be expired by default.

### `labels-ttl` (Optional)

TTLs by labels. If the pull request contains any label of them, the action will take the MIN TTL of the matched labels to decide if it is expired or not.

### `pull-request-number` (Optional)

The pull request to generate notifications. If it is null, the action will get all the pull requests of the repository.
### `label-to-skip-pr` (Optional)

If a PR has this label, the action will not notify to its reviewers.


## Outputs

### `notifications`

The notifications generated.

## Example
```yaml
...
jobs:
  get-notifications:
    name: Get notifications
    runs-on: ubuntu-latest
    outputs:
      notifications: ${{ steps.generator.outputs.notifications }}
    steps:
      - name: Generation step
        uses: amegias/pr-notifications@vX.Y.Z
        id: generator
        with:
          access-token: ${{ secrets.GITHUB_TOKEN }}
          default-ttl: '259200' # 3 days
          labels-ttl: '{ "bug": 86400 }' # bug: 1 day
```

### Output

An array of notifications with the pull request and recipient info.

```json
[
  {
    "pullRequest": {
      "id": 1,
      "title": "My PR #1",
      "url": "https://api.github.com/repos/me/myrepo/pulls/1",
      "number": 1,
      "createdAt": "2023-04-03T07:52:45Z",
      "owner": "anOwner",
      "openedAt": "2023-10-22T20:46:04Z",
      "expiration": {
        "ttl": 1,
        "expiredAt": "2023-10-22T20:46:05Z"
      }
    },
    "recipient": {
      "login": "login1",
      "email": "1@email.com"
    }
  },
  {
    "pullRequest": {
      "id": 1,
      "title": "My PR #1",
      "url": "https://api.github.com/repos/me/myrepo/pulls/1",
      "number": 1,
      "createdAt": "2023-04-03T07:52:45Z",
      "owner": "anOwner",
      "openedAt": "2023-10-22T20:46:04Z",
      "expiration": {
        "ttl": 1,
        "expiredAt": "2023-10-22T20:46:05Z"
      }
    },
    "recipient": {
      "login": "login2",
      "email": "2@email.com"
    }
  },
  {
    "pullRequest": {
      "id": 2,
      "title": "My PR #2",
      "url": "https://api.github.com/repos/me/myrepo/pulls/1",
      "number": 2,
      "createdAt": "2023-04-03T07:52:45Z",
      "owner": "anOwner",
      "openedAt": "2023-10-22T20:46:04Z",
      "expiration": {
        "ttl": 1,
        "expiredAt": "2023-10-22T20:46:05Z",
        "label": "anyLabel"
      }
    },
    "recipient": {
      "login": "login1",
      "email": "1@email.com"
    }
  }
]
```

You can handle its output like:
```yaml
send-notification:
    name: (Simulate) Send notification
    needs: get-notifications
    if: ${{ needs.get-notifications.outputs.notifications != '[]' }}
    runs-on: ubuntu-latest
    strategy:
      matrix:
        notifications: ${{ fromJSON(needs.get-notifications.outputs.notifications) }}
    steps:
      - name: Print result
        run: echo "${{ matrix.notifications.pullRequest.url }} must be reviewed by ${{ matrix.notifications.recipient.login }}"
```

## Contributing
[CONTRIBUTING.md](./CONTRIBUTING.md)
