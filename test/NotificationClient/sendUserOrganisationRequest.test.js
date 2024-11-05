jest.mock('login.dfe.kue');


describe('when sending a user organisation request', () => {

  const connectionString = 'some-redis-connection';
  const requestId = 'requestId';

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
    await client.sendUserOrganisationRequest(requestId);

    expect(createQueue.mock.calls.length).toBe(1);
    expect(createQueue.mock.calls[0][0].redis).toBe(connectionString);
  });

  test('then it should create job with type of organisationrequest_v1', async () => {
    await client.sendUserOrganisationRequest(requestId);

    expect(create.mock.calls.length).toBe(1);
    expect(create.mock.calls[0][0]).toBe('organisationrequest_v1');
  });

  test('then it should create job with data including requestId', async () => {
    await client.sendUserOrganisationRequest(requestId);

    expect(create.mock.calls[0][1].requestId).toBe(requestId);
  });

  test('then it should save the job', async () => {
    await client.sendUserOrganisationRequest(requestId);

    expect(jobSave.mock.calls.length).toBe(1);
  });

  test('then it should resolve if there is no error', async () => {
    await expect(client.sendUserOrganisationRequest(requestId)).resolves.toBeUndefined();
  });

  test('then it should reject if there is an error', async () => {
    invokeCallback = (callback) => {
      callback('Unit test error');
    };

    await expect(client.sendUserOrganisationRequest(requestId)).rejects.toBeDefined();
  });

});
