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

describe('when sending a user organisation request', () => {

  const connectionString = 'some-redis-connection';
  const requestId = 'requestId';

  let client;

  beforeEach(() => {
    const { NotificationClient } = require('../../lib');
    client = new NotificationClient({connectionString: connectionString});
  });

  test('then it should create queue connecting to provided connection string', async () => {
    await client.sendUserOrganisationRequest(requestId);

    expect(Queue.mock.calls.length).toBe(1);
    expect(Queue.mock.calls[0][1].connection.url).toBe(connectionString);
  });

  test('then it should create job with type of organisationrequest_v1', async () => {
    await client.sendUserOrganisationRequest(requestId);

    expect(Queue.mock.calls.length).toBe(1);
    expect(Queue.mock.calls[0][0]).toBe('organisationrequest_v1');
  });

  test('then it should create job with data including requestId', async () => {
    await client.sendUserOrganisationRequest(requestId);

    expect(Queue.mock.results[0].value.add.mock.calls[0][1].requestId).toBe(requestId);
  });

  test('then it should save the job', async () => {
    await client.sendUserOrganisationRequest(requestId);

    expect(Queue.mock.results[0].value.add).toHaveBeenCalledTimes(1);
		expect(Queue.mock.results[0].value.close).toHaveBeenCalledTimes(1);
  });

  test('then it should resolve if there is no error', async () => {
    await expect(client.sendUserOrganisationRequest(requestId)).resolves.toBeUndefined();
  });

  test('then it should reject if there is an error', async () => {
    Queue.mockImplementation(() => {
      return {
        add: jest.fn(),
        close: jest.fn().mockImplementation(() => {
          throw new Error('bad times');
        })
      };
    });

    await expect(client.sendUserOrganisationRequest(requestId)).rejects.toBeDefined();
    expect(Queue.mock.results[0].value.close).toHaveBeenCalledTimes(1);
  });

});
