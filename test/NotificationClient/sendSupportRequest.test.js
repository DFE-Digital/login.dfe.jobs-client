jest.mock('login.dfe.kue');


describe('when sending a support request', () => {

  const connectionString = 'some-redis-connection';
  const name = 'User One';
  const email = 'user.one@unit.test';
  const phone = '1234567981';
  const service = 'DfE Sign-in Client Service';
  const type = 'I have multiple accounts';
  const message = 'I am having trouble signing in using my new details';
  const orgName = 'org1';
  const urn = '123345';

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
    await client.sendSupportRequest(name, email, phone, service, type, message, orgName, urn);

    expect(createQueue.mock.calls.length).toBe(1);
    expect(createQueue.mock.calls[0][0].redis).toBe(connectionString);
  });

  test('then it should create job with type of supportrequest_v1', async () => {
    await client.sendSupportRequest(name, email, phone, service, type, message, orgName, urn);

    expect(create.mock.calls.length).toBe(1);
    expect(create.mock.calls[0][0]).toBe('supportrequest_v1');
  });

  test('then it should create job with data in call', async () => {
    await client.sendSupportRequest(name, email, service, type, null, orgName, urn,message);
    expect(create.mock.calls[0][1]).toEqual({
      name,
      email,
      service,
      service,
      type,
      typeAdditionalInfo:null,
      orgName,
      urn,
      message
    });
  });

  test('then it should save the job', async () => {
    await client.sendSupportRequest(name, email, phone, service, type, message, orgName, urn);

    expect(jobSave.mock.calls.length).toBe(1);
  });

  test('then it should resolve if there is no error', async () => {
    await expect(client.sendSupportRequest(name, email, phone, service, type, message, orgName, urn)).resolves.toBeUndefined();
  });

  test('then it should reject if there is an error', async () => {
    invokeCallback = (callback) => {
      callback('Unit test error');
    };

    await expect(client.sendSupportRequest(name, email, phone, service, type, message, orgName, urn)).rejects.toBeDefined();
  });

});
