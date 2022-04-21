jest.mock('kue');

describe('when sending a user permission updated for organisation email', () => {

  const connectionString = 'some-redis-connection';
  const email = 'user.one@unit.test';
  const firstName = 'User';
  const lastName = 'One';
  const orgName = 'org1';
  const roleName = 'role1';
  const permissionName = 'approver';

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

    const kue = require('dfe.login.kue');
    kue.createQueue = createQueue;

    const NotificationClient = require('./../lib');
    client = new NotificationClient({connectionString: connectionString});
  });

  test('then it should create queue connecting to provided connection string', async () => {
    await client.sendUserPermissionChanged(email, firstName, lastName, orgName, roleName);

    expect(createQueue.mock.calls.length).toBe(1);
    expect(createQueue.mock.calls[0][0].redis).toBe(connectionString);
  });

  test('then it should create job with type of useraddedtoorganisationrequest_v1', async () => {
    await client.sendUserPermissionChanged(email, firstName, lastName, orgName, roleName);

    expect(create.mock.calls.length).toBe(1);
    expect(create.mock.calls[0][0]).toBe('changeuserpermissionlevelrequest_v1');
  });

  test('then it should create job with data including email', async () => {
    await client.sendUserPermissionChanged(email, firstName, lastName, orgName, roleName);

    expect(create.mock.calls[0][1].email).toBe(email);
  });

  test('then it should create job with data including firstName', async () => {
    await client.sendUserPermissionChanged(email, firstName, lastName, orgName, roleName);

    expect(create.mock.calls[0][1].firstName).toBe(firstName);
  });

  test('then it should create job with data including lastName', async () => {
    await client.sendUserPermissionChanged(email, firstName, lastName, orgName, roleName);

    expect(create.mock.calls[0][1].lastName).toBe(lastName);
  });

  test('then it should create job with data including orgName', async () => {
    await client.sendUserPermissionChanged(email, firstName, lastName, orgName, roleName);

    expect(create.mock.calls[0][1].orgName).toBe(orgName);
  });

  test('then it should create job with data including permissionName', async () => {
    await client.sendUserPermissionChanged(email, firstName, lastName, orgName, permissionName);

    expect(create.mock.calls[0][1].permissionName).toBe(permissionName);
  });

  test('then it should save the job', async () => {
    await client.sendUserPermissionChanged(email, firstName, lastName, orgName, roleName);

    expect(jobSave.mock.calls.length).toBe(1);
  });

  test('then it should resolve if there is no error', async () => {
    await client.sendUserPermissionChanged(email, firstName, lastName);
  });

  test('then it should reject if there is an error', async () => {
    invokeCallback = (callback) => {
      callback('Unit test error');
    };

    await expect(client.sendUserPermissionChanged(email, firstName, lastName, orgName, roleName)).rejects.toBeDefined();
  });

});
