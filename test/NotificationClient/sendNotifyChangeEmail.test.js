jest.mock('login.dfe.kue');


describe('when sending a notification of change of email', () => {

  const connectionString = 'some-redis-connection';
  const email = 'user.one@unit.test';
  const firstName = 'User';
  const lastName = 'One';
  const newEmail = 'user1@unit.test'

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
    await client.sendNotifyMigratedEmail(email, firstName, lastName, newEmail);

    expect(createQueue.mock.calls.length).toBe(1);
    expect(createQueue.mock.calls[0][0].redis).toBe(connectionString);
  });

  test('then it should create job with type of notifychangeemail_v1', async () => {
    await client.sendNotifyMigratedEmail(email, firstName, lastName, newEmail);

    expect(create.mock.calls.length).toBe(1);
    expect(create.mock.calls[0][0]).toBe('notifychangeemail_v1');
  });

  test('then it should create job with data including email', async () => {
    await client.sendNotifyMigratedEmail(email, firstName, lastName, newEmail);

    expect(create.mock.calls[0][1].email).toBe(email);
  });

  test('then it should create job with data including first name', async () => {
    await client.sendNotifyMigratedEmail(email, firstName, lastName, newEmail);

    expect(create.mock.calls[0][1].firstName).toBe(firstName);
  });

  test('then it should create job with data including last name', async () => {
    await client.sendNotifyMigratedEmail(email, firstName, lastName, newEmail);

    expect(create.mock.calls[0][1].lastName).toBe(lastName);
  });

  test('then it should create job with data including newEmail', async () => {
    await client.sendNotifyMigratedEmail(email, firstName, lastName, newEmail);

    expect(create.mock.calls[0][1].newEmail).toBe(newEmail);
  });

  test('then it should save the job', async () => {
    await client.sendNotifyMigratedEmail(email, firstName, lastName, newEmail);

    expect(jobSave.mock.calls.length).toBe(1);
  });

  test('then it should resolve if there is no error', async () => {
    await expect(client.sendNotifyMigratedEmail(email, firstName, lastName, newEmail)).resolves.toBeUndefined();
  });

  test('then it should reject if there is an error', async () => {
    invokeCallback = (callback) => {
      callback('Unit test error');
    };

    await expect(client.sendNotifyMigratedEmail(email, firstName, lastName, newEmail)).rejects.toBeDefined();
  });

});
