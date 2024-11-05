jest.mock('login.dfe.kue');

const kue = require('login.dfe.kue');
const { PublicApiClient } = require('../../lib');

const job = {
  save: jest.fn(),
};
const queue = {
  create: jest.fn(),
};
const connectionString = 'some-redis-connection-string';
const firstName = 'User';
const lastName = 'One';
const email = 'user.one@unit.test';
const organisation = 'org-1';
const sourceId = 'first-user';
const callback = 'http://relying.party/cb';
const userRedirect = 'http://relying.party/login';
const clientId = 'client-1';

describe('when sending publicinvitationrequest_v1', () => {
  let client;

  beforeEach(() => {
    job.save.mockReset().mockImplementation((cb) => {
      cb();
    });

    queue.create.mockReset().mockReturnValue(job);

    kue.createQueue.mockReset().mockReturnValue(queue);

    client = new PublicApiClient({ connectionString });
  });

  it('then it should create new queue connection to redis', async () => {
    await client.sendInvitationRequest(firstName, lastName, email, organisation, sourceId, callback, userRedirect, clientId);

    expect(kue.createQueue).toHaveBeenCalledTimes(1);
    expect(kue.createQueue.mock.calls[0][0]).toEqual({
      redis: connectionString,
    });
  });

  it('then it should create job with correct type', async () => {
    await client.sendInvitationRequest(firstName, lastName, email, organisation, sourceId, callback, userRedirect, clientId);

    expect(queue.create).toHaveBeenCalledTimes(1);
    expect(queue.create.mock.calls[0][0]).toBe('publicinvitationrequest_v1');
  });

  it('then it should create job with correct data', async () => {
    await client.sendInvitationRequest(firstName, lastName, email, organisation, sourceId, callback, userRedirect, clientId);

    expect(queue.create).toHaveBeenCalledTimes(1);
    expect(queue.create.mock.calls[0][1]).toEqual({
      firstName,
      lastName,
      email,
      organisation,
      sourceId,
      callback,
      userRedirect,
      clientId,
    });
  });

  it('then it should save job', async () => {
    await client.sendInvitationRequest(firstName, lastName, email, organisation, sourceId, callback, userRedirect, clientId);

    expect(job.save).toHaveBeenCalledTimes(1);
  });

  it('then it should error if fails to save job', async () => {
    job.save.mockImplementation(() => {
      throw new Error('test');
    });

    try {
      await client.sendInvitationRequest(firstName, lastName, email, organisation, sourceId, callback, userRedirect, clientId);
      throw new Error('no error thrown');
    } catch (e) {
      expect(e.message).toBe('test');
      expect(job.save).toHaveBeenCalledTimes(1);
    }
  });
});
