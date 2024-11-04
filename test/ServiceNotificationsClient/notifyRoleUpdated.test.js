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
const role = {
  id: 'role-1',
  name: 'Role One',
  code: 'ROLEONE',
  status: {
    id: 1
  }
};

describe('when sending roleupdated_v1', () => {
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
    await client.notifyRoleUpdated(role);

    expect(kue.createQueue).toHaveBeenCalledTimes(1);
    expect(kue.createQueue.mock.calls[0][0]).toEqual({
      redis: connectionString,
    });
  });

  it('then it should create job with correct type', async () => {
    await client.notifyRoleUpdated(role);

    expect(queue.create).toHaveBeenCalledTimes(1);
    expect(queue.create.mock.calls[0][0]).toBe('roleupdated_v1');
  });

  it('then it should create job with correct data', async () => {
    await client.notifyRoleUpdated(role);

    expect(queue.create).toHaveBeenCalledTimes(1);
    expect(queue.create.mock.calls[0][1]).toEqual(role);
  });

  it('then it should save job', async () => {
    await client.notifyRoleUpdated(role);

    expect(job.save).toHaveBeenCalledTimes(1);
  });

  it('then it should return job id', async () => {
    const jobId = await client.notifyRoleUpdated(role);

    expect(jobId).toBe(1);
  });

  it('then it should error if fails to save job', async () => {
    job.save.mockImplementation(() => {
      throw new Error('test');
    });

    try {
      await client.notifyRoleUpdated(role);
      throw new Error('no error thrown');
    } catch (e) {
      expect(e.message).toBe('test');
      expect(job.save).toHaveBeenCalledTimes(1);
    }
  });

  it('then it should error if role not passed', async () => {
    try {
      await client.notifyRoleUpdated(undefined);
      throw new Error('no error thrown');
    } catch (e) {
      expect(e.message).toBe('Role must be provided');
      expect(job.save).toHaveBeenCalledTimes(0);
    }
  });

  it('then it should error if role has no id', async () => {
    try {
      await client.notifyRoleUpdated(omit(role, ['id']));
      throw new Error('no error thrown');
    } catch (e) {
      expect(e.message).toBe('Role must have id');
      expect(job.save).toHaveBeenCalledTimes(0);
    }
  });

  it('then it should error if role has no name', async () => {
    try {
      await client.notifyRoleUpdated(omit(role, ['name']));
      throw new Error('no error thrown');
    } catch (e) {
      expect(e.message).toBe('Role must have name');
      expect(job.save).toHaveBeenCalledTimes(0);
    }
  });

  it('then it should error if role has no code', async () => {
    try {
      await client.notifyRoleUpdated(omit(role, ['code']));
      throw new Error('no error thrown');
    } catch (e) {
      expect(e.message).toBe('Role must have code');
      expect(job.save).toHaveBeenCalledTimes(0);
    }
  });
});
