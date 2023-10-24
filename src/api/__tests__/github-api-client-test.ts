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
import {
  getEvents,
  getPullRequest,
  getPullRequests,
  getUser
} from '../github-api-client';

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
            [buildReviewerDto(111), buildReviewerDto(222)],
            { login: 'anOwner' }
          ),
          buildPullRequestDto(
            2,
            [buildLabelDto(22), buildLabelDto(33)],
            [buildReviewerDto(222)],
            { login: 'otherOwner' }
          )
        ]
      });

    const pullRequests = await getPullRequests(environment);

    expect(requestMock).toHaveBeenCalledWith(
      'GET /repos/anyOwner/anyName/pulls',
      { state: 'open' }
    );
    expect(pullRequests).toStrictEqual([
      buildPullRequest(
        1,
        new Set(['label11']),
        [buildReviewer(111), buildReviewer(222)],
        'anOwner'
      ),
      buildPullRequest(
        2,
        new Set(['label22', 'label33']),
        [buildReviewer(222)],
        'otherOwner'
      )
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
          [buildReviewerDto(111), buildReviewerDto(222)],
          { login: 'anOwner' }
        )
      });

    const pullRequests = await getPullRequest(environment, '1');

    expect(requestMock).toHaveBeenCalledWith(
      'GET /repos/anyOwner/anyName/pulls/1',
      undefined
    );
    expect(pullRequests).toStrictEqual(
      buildPullRequest(
        1,
        new Set(['label11', 'label22']),
        [buildReviewer(111), buildReviewer(222)],
        'anOwner'
      )
    );
  });
});

describe('getEvents', () => {
  it('Given event data, returns the expected model', async () => {
    const environment = testEnvironment();
    const eventDtos = [
      { event: 'anyEvent1', created_at: 'anyCreatedAt1' },
      { event: 'anyEvent2', created_at: 'anyCreatedAt2' }
    ];
    const requestMock = jest
      .spyOn(environment.dependencies.ghClient, 'request')
      .mockResolvedValue({
        data: eventDtos
      });

    const user = await getEvents(environment, 'anyNumber');

    expect(requestMock).toHaveBeenCalledWith(
      'GET /repos/anyOwner/anyName/issues/anyNumber/timeline',
      undefined
    );
    expect(user).toStrictEqual([
      { createdAt: 'anyCreatedAt1', type: 'anyEvent1' },
      { createdAt: 'anyCreatedAt2', type: 'anyEvent2' }
    ]);
  });
});
