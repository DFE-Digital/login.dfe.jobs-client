jest.mock('bullmq', () => {
  return {
    Queue: jest.fn().mockImplementation(() => {
      return {
        add: jest.fn(),
        close: jest.fn(),
      };
    })
  };
});

const { Queue } = require('bullmq');

describe('when sending a user permission updated for organisation email', () => {

  const connectionString = 'some-redis-connection';
  const email = 'user.one@unit.test';
  const firstName = 'User';
  const lastName = 'One';
  const orgName = 'org1';
  const roleName = 'role1';
  const permission = {
    id: 10000,
    name: "Approver",
    oldName: "End user",
  };

  let client;

  beforeEach(() => {
    const { NotificationClient } = require('../../lib');
    client = new NotificationClient({connectionString: connectionString});
  });

  test('then it should create queue connecting to provided connection string', async () => {
    await client.sendUserPermissionChanged(email, firstName, lastName, orgName, roleName);

    expect(Queue.mock.calls.length).toBe(1);
    expect(Queue.mock.calls[0][1].connection.url).toBe(connectionString);
  });

  test('then it should create job with type of useraddedtoorganisationrequest_v1', async () => {
    await client.sendUserPermissionChanged(email, firstName, lastName, orgName, roleName);

    expect(Queue.mock.calls.length).toBe(1);
    expect(Queue.mock.calls[0][0]).toBe('changeuserpermissionlevelrequest_v1');
  });

  test('then it should create job with data including email', async () => {
    await client.sendUserPermissionChanged(email, firstName, lastName, orgName, roleName);

    expect(Queue.mock.results[0].value.add.mock.calls[0][1].email).toBe(email);
  });

  test('then it should create job with data including firstName', async () => {
    await client.sendUserPermissionChanged(email, firstName, lastName, orgName, roleName);

    expect(Queue.mock.results[0].value.add.mock.calls[0][1].firstName).toBe(firstName);
  });

  test('then it should create job with data including lastName', async () => {
    await client.sendUserPermissionChanged(email, firstName, lastName, orgName, roleName);

    expect(Queue.mock.results[0].value.add.mock.calls[0][1].lastName).toBe(lastName);
  });

  test('then it should create job with data including orgName', async () => {
    await client.sendUserPermissionChanged(email, firstName, lastName, orgName, roleName);

    expect(Queue.mock.results[0].value.add.mock.calls[0][1].orgName).toBe(orgName);
  });

  test('then it should create job with data including permission', async () => {
    await client.sendUserPermissionChanged(email, firstName, lastName, orgName, permission);

    expect(Queue.mock.results[0].value.add.mock.calls[0][1].permission).toBe(permission);
  });

  test('then it should save the job', async () => {
    await client.sendUserPermissionChanged(email, firstName, lastName, orgName, roleName);

    expect(Queue.mock.results[0].value.add).toHaveBeenCalledTimes(1);
    expect(Queue.mock.results[0].value.close).toHaveBeenCalledTimes(1);
  });

  test('then it should reject if there is an error', async () => {
    Queue.mockImplementation(() => {
      return {
        add: jest.fn(),
        close: jest.fn().mockImplementation(() => {
          throw new Error('bad times');
        })
      };
    })

    await expect(client.sendUserPermissionChanged(email, firstName, lastName, orgName, roleName)).rejects.toBeDefined();
    expect(Queue.mock.results[0].value.close).toHaveBeenCalledTimes(1);
  });

});
