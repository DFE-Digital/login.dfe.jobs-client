jest.mock('login.dfe.kue');


describe('when sending outstanding requests awaiting approval', () => {

  const connectionString = 'some-redis-connection';
  const name = 'User One';
  const requestsCount = 8;

  let invokeCallback;
  let jobSave;
  let create;
  let createQueue;
  let client;

  beforeEach(() => {
    invokeCallback = (callback) => {
      callback();
    };

    jobSave = jest.fn().mockImplementation((callback) => {
      invokeCallback(callback);
    });

    create = jest.fn().mockImplementation(() => {
      return {
        save: jobSave
      };
    });

    createQueue = jest.fn().mockReturnValue({
      create
    });

    const kue = require('login.dfe.kue');
    kue.createQueue = createQueue;

    const { NotificationClient } = require('../../lib');
    client = new NotificationClient({connectionString: connectionString});
  });

  test('then it should create queue connecting to provided connection string', async () => {
    await client.sendSupportOverdueRequest(name, requestsCount);

    expect(createQueue.mock.calls.length).toBe(1);
    expect(createQueue.mock.calls[0][0].redis).toBe(connectionString);
  });

  test('then it should create job with type of supportoverduerequest', async () => {
    await client.sendSupportOverdueRequest(name, requestsCount);

    expect(create.mock.calls.length).toBe(1);
    expect(create.mock.calls[0][0]).toBe('supportoverduerequest');
  });

  test('then it should create job with data in call', async () => {
    await client.sendSupportOverdueRequest(name, requestsCount);

    expect(create.mock.calls[0][1]).toEqual({
      name,
    requestsCount,
    });
  });

  test('then it should save the job', async () => {
    await client.sendSupportOverdueRequest(name, requestsCount);

    expect(jobSave.mock.calls.length).toBe(1);
  });

  test('then it should resolve if there is no error', async () => {
    await expect( client.sendSupportOverdueRequest(name, requestsCount)).resolves.toBeUndefined();
  });

  test('then it should reject if there is an error', async () => {
    invokeCallback = (callback) => {
      callback('Unit test error');
    };

    await expect( client.sendSupportOverdueRequest(name, requestsCount) ).rejects.toBeDefined();
  });

});
