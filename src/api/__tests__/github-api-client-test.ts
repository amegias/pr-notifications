import {
  buildLabelDto,
  buildPullRequest,
  buildPullRequestDto,
  buildReviewer,
  buildReviewerDto,
  buildUser,
  buildUserDto
} from '../../__tests__/mother';
import { testEnvironment } from '../../__tests__/utils';
import { getPullRequest, getPullRequests, getUser } from '../github-api-client';

describe('getUser', () => {
  it('Given user data, returns the expected model', async () => {
    const environment = testEnvironment();
    const userDto = buildUserDto(1);
    const requestMock = jest
      .spyOn(environment.dependencies.ghClient, 'request')
      .mockResolvedValue({
        data: userDto
      });

    const user = await getUser(environment, userDto.login);

    expect(requestMock).toHaveBeenCalledWith('GET /users/login1', undefined);
    expect(user).toStrictEqual(buildUser(1));
  });
});

describe('getPullRequests', () => {
  it('Returns the expected pull request models', async () => {
    const environment = testEnvironment();
    const requestMock = jest
      .spyOn(environment.dependencies.ghClient, 'request')
      .mockResolvedValue({
        data: [
          buildPullRequestDto(
            1,
            [buildLabelDto(11)],
            [buildReviewerDto(111), buildReviewerDto(222)]
          ),
          buildPullRequestDto(
            2,
            [buildLabelDto(22), buildLabelDto(33)],
            [buildReviewerDto(222)]
          )
        ]
      });

    const pullRequests = await getPullRequests(environment);

    expect(requestMock).toHaveBeenCalledWith(
      'GET /repos/anyOwner/anyName/pulls',
      { state: 'open' }
    );
    expect(pullRequests).toStrictEqual([
      buildPullRequest(1, new Set(['label11']), [
        buildReviewer(111),
        buildReviewer(222)
      ]),
      buildPullRequest(2, new Set(['label22', 'label33']), [buildReviewer(222)])
    ]);
  });
});

describe('getPullRequest', () => {
  it('Returns the expected pull request model', async () => {
    const environment = testEnvironment();
    const requestMock = jest
      .spyOn(environment.dependencies.ghClient, 'request')
      .mockResolvedValue({
        data: buildPullRequestDto(
          1,
          [buildLabelDto(11), buildLabelDto(22)],
          [buildReviewerDto(111), buildReviewerDto(222)]
        )
      });

    const pullRequests = await getPullRequest(environment, '1');

    expect(requestMock).toHaveBeenCalledWith(
      'GET /repos/anyOwner/anyName/pulls/1',
      undefined
    );
    expect(pullRequests).toStrictEqual(
      buildPullRequest(1, new Set(['label11', 'label22']), [
        buildReviewer(111),
        buildReviewer(222)
      ])
    );
  });
});
