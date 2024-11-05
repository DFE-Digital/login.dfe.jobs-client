jest.mock('login.dfe.kue');

const omit = require('lodash/omit');
const kue = require('login.dfe.kue');
const { ServiceNotificationsClient } = require('../../lib');

const job = {
  save: jest.fn(),
};
const queue = {
  create: jest.fn(),
};
const connectionString = 'some-redis-connection-string';
const user = {
  sub: 'user-1',
  email: 'user.one@unit.test',
  status: {
    id: 1,
  },
};

describe('when sending userupdated_v1', () => {
  let client;

  beforeEach(() => {
    job.id = undefined;
    job.save.mockReset().mockImplementation((cb) => {
      job.id = (job.id || 0) + 1;
      cb();
    });

    queue.create.mockReset().mockReturnValue(job);

    kue.createQueue.mockReset().mockReturnValue(queue);

    client = new ServiceNotificationsClient({ connectionString });
  });

  it('then it should create new queue connection to redis', async () => {
    await client.notifyUserUpdated(user);

    expect(kue.createQueue).toHaveBeenCalledTimes(1);
    expect(kue.createQueue.mock.calls[0][0]).toEqual({
      redis: connectionString,
    });
  });

  it('then it should create job with correct type', async () => {
    await client.notifyUserUpdated(user);

    expect(queue.create).toHaveBeenCalledTimes(1);
    expect(queue.create.mock.calls[0][0]).toBe('userupdated_v1');
  });

  it('then it should create job with correct data', async () => {
    await client.notifyUserUpdated(user);

    expect(queue.create).toHaveBeenCalledTimes(1);
    expect(queue.create.mock.calls[0][1]).toEqual(user);
  });

  it('then it should save job', async () => {
    await client.notifyUserUpdated(user);

    expect(job.save).toHaveBeenCalledTimes(1);
  });

  it('then it should return job id', async () => {
    const jobId = await client.notifyUserUpdated(user);

    expect(jobId).toBe(1);
  });

  it('then it should error if fails to save job', async () => {
    job.save.mockImplementation(() => {
      throw new Error('test');
    });

    try {
      await client.notifyUserUpdated(user);
      throw new Error('no error thrown');
    } catch (e) {
      expect(e.message).toBe('test');
      expect(job.save).toHaveBeenCalledTimes(1);
    }
  });
});
