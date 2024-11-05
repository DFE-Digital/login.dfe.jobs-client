jest.mock('login.dfe.kue');


describe('when sending an approver access request email', () => {

  const connectionString = 'some-redis-connection';
  const servicesUrl = 'https://testurl/services';
  const name = 'Test Tester';
  const orgName = 'My Org';
  const recipients = ['test1@unit.com','test1@unit.com'];

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
    client = new NotificationClient({connectionString: connectionString, servicesUrl: servicesUrl});
  });

  test('then it should create queue connecting to provided connection string', async () => {
    await client.sendApproverAccessRequest(name, orgName, recipients);

    expect(createQueue.mock.calls.length).toBe(1);
    expect(createQueue.mock.calls[0][0].redis).toBe(connectionString);
  });

  test('then it should create job with type of approveraccessrequest_v1', async () => {
    await client.sendApproverAccessRequest(name, orgName, recipients);

    expect(create.mock.calls.length).toBe(1);
    expect(create.mock.calls[0][0]).toBe('approveraccessrequest_v1');
  });

  test('then it should create job with data including name', async () => {
    await client.sendApproverAccessRequest(name, orgName, recipients);

    expect(create.mock.calls[0][1].name).toBe(name);
  });

  test('then it should create job with data including org name', async () => {
    await client.sendApproverAccessRequest(name, orgName, recipients);

    expect(create.mock.calls[0][1].orgName).toBe(orgName);
  });

  test('then it should create job with data including recipients', async () => {
    await client.sendApproverAccessRequest(name, orgName, recipients);

    expect(create.mock.calls[0][1].recipients).toBe(recipients);
  });

  test('then it should save the job', async () => {
    await client.sendApproverAccessRequest(name, orgName, recipients);

    expect(jobSave.mock.calls.length).toBe(1);
  });

  test('then it should resolve if there is no error', async () => {
    await expect(client.sendApproverAccessRequest(name, orgName, recipients)).resolves.toBeUndefined();
  });

  test('then it should reject if there is an error', async () => {
    invokeCallback = (callback) => {
      callback('Unit test error');
    };

    await expect(client.sendApproverAccessRequest(name, orgName, recipients)).rejects.toBeDefined();
  });

});
