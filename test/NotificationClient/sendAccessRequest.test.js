jest.mock('login.dfe.kue');


describe('when sending an access request email', () => {

  const connectionString = 'some-redis-connection';
  const email = 'user.one@unit.test';
  const name = 'Test Tester';
  const orgName = 'My Org';
  const approved = true;
  const reason = 'reason';

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
    await client.sendAccessRequest(email, name, orgName, approved, reason);

    expect(createQueue.mock.calls.length).toBe(1);
    expect(createQueue.mock.calls[0][0].redis).toBe(connectionString);
  });

  test('then it should create job with type of accessrequest_v1', async () => {
    await client.sendAccessRequest(email, name, orgName, approved, reason);

    expect(create.mock.calls.length).toBe(1);
    expect(create.mock.calls[0][0]).toBe('accessrequest_v1');
  });

  test('then it should create job with data including email', async () => {
    await client.sendAccessRequest(email, name, orgName, approved, reason);

    expect(create.mock.calls[0][1].email).toBe(email);
  });

  test('then it should create job with data including name', async () => {
    await client.sendAccessRequest(email, name, orgName, approved, reason);

    expect(create.mock.calls[0][1].name).toBe(name);
  });

  test('then it should create job with data including org name', async () => {
    await client.sendAccessRequest(email, name, orgName, approved, reason);

    expect(create.mock.calls[0][1].orgName).toBe(orgName);
  });

  test('then it should create job with data including approved', async () => {
    await client.sendAccessRequest(email, name, orgName, approved, reason);

    expect(create.mock.calls[0][1].approved).toBe(approved);
  });

  test('then it should create job with data including reason', async () => {
    await client.sendAccessRequest(email, name, orgName, approved, reason);

    expect(create.mock.calls[0][1].reason).toBe(reason);
  });

  test('then it should save the job', async () => {
    await client.sendAccessRequest(email, name, orgName, approved, reason);

    expect(jobSave.mock.calls.length).toBe(1);
  });

  test('then it should resolve if there is no error', async () => {
    await expect(client.sendAccessRequest(email, name, orgName, approved, reason)).resolves.toBeUndefined();
  });

  test('then it should reject if there is an error', async () => {
    invokeCallback = (callback) => {
      callback('Unit test error');
    };

    await expect(client.sendAccessRequest(email, name, orgName, approved, reason)).rejects.toBeDefined();
  });

});
