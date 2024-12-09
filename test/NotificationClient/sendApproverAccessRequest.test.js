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


describe('when sending an approver access request email', () => {

  const connectionString = 'some-redis-connection';
  const servicesUrl = 'https://testurl/services';
  const name = 'Test Tester';
  const orgName = 'My Org';
  const recipients = ['test1@unit.com','test1@unit.com'];

  let client;

  beforeEach(() => {
    const { NotificationClient } = require('../../lib');
    client = new NotificationClient({connectionString: connectionString, servicesUrl: servicesUrl});
  });

  test('then it should create queue connecting to provided connection string', async () => {
    await client.sendApproverAccessRequest(name, orgName, recipients);

    expect(Queue.mock.calls.length).toBe(1);
    expect(Queue.mock.calls[0][1].connection.url).toBe(connectionString);
  });

  test('then it should create job with type of approveraccessrequest_v1', async () => {
    await client.sendApproverAccessRequest(name, orgName, recipients);

    expect(Queue.mock.calls.length).toBe(1);
    expect(Queue.mock.calls[0][0]).toBe('approveraccessrequest_v1');
  });

  test('then it should create job with data including name', async () => {
    await client.sendApproverAccessRequest(name, orgName, recipients);

    expect(Queue.mock.results[0].value.add).toHaveBeenCalledWith('approveraccessrequest_v1', {
      name: 'Test Tester',
      orgName: 'My Org',
      recipients: ['test1@unit.com', 'test1@unit.com'],
    },
    { 
      removeOnComplete: {
        age: 3600, 
        count: 50
      },
      removeOnFail: {
        age: 43200
      },
    });
  });

  test('then it should create job with data including org name', async () => {
    await client.sendApproverAccessRequest(name, orgName, recipients);

    expect(Queue.mock.results[0].value.add.mock.calls[0][1].orgName).toBe(orgName);
  });

  test('then it should create job with data including recipients', async () => {
    await client.sendApproverAccessRequest(name, orgName, recipients);

    expect(Queue.mock.results[0].value.add.mock.calls[0][1].recipients).toBe(recipients);
  });

  test('then it should save the job', async () => {
    await client.sendApproverAccessRequest(name, orgName, recipients);

    expect(Queue.mock.results[0].value.add).toHaveBeenCalledTimes(1);
    expect(Queue.mock.results[0].value.close).toHaveBeenCalledTimes(1);
  });

  test('then it should resolve if there is no error', async () => {
    await expect(client.sendApproverAccessRequest(name, orgName, recipients)).resolves.toBeUndefined();
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

    await expect(client.sendAccessRequest(name, orgName, recipients)).rejects.toBeDefined();
    expect(Queue.mock.results[0].value.close).toHaveBeenCalledTimes(1);
  });

});
