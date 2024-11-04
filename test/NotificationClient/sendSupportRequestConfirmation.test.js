jest.mock('login.dfe.kue');


describe('when sending a support request confirmation', () => {

  const connectionString = 'some-redis-connection';
  const name = 'User One';
  const email = 'user.one@unit.test';
  const service = 'DfE Sign-in Client Service';
  const reference = 'SIN123456798';

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
    await client.sendSupportRequestConfirmation(name, email, service, reference);

    expect(createQueue.mock.calls.length).toBe(1);
    expect(createQueue.mock.calls[0][0].redis).toBe(connectionString);
  });

  test('then it should create job with type of supportrequestconfirmation_v1', async () => {
    await client.sendSupportRequestConfirmation(name, email, service, reference);

    expect(create.mock.calls.length).toBe(1);
    expect(create.mock.calls[0][0]).toBe('supportrequestconfirmation_v1');
  });

  test('then it should create job with data in call', async () => {
    await client.sendSupportRequestConfirmation(name, email, service, reference);

    expect(create.mock.calls[0][1]).toEqual({
      name,
      email,
      service,
      reference,
    });
  });

  test('then it should save the job', async () => {
    await client.sendSupportRequestConfirmation(name, email, service, reference);

    expect(jobSave.mock.calls.length).toBe(1);
  });

  test('then it should resolve if there is no error', async () => {
    await expect(client.sendSupportRequestConfirmation(name, email, service, reference)).resolves.toBeUndefined();
  });

  test('then it should reject if there is an error', async () => {
    invokeCallback = (callback) => {
      callback('Unit test error');
    };

    await expect(client.sendSupportRequestConfirmation(name, email, service, reference)).rejects.toBeDefined();
  });

});
