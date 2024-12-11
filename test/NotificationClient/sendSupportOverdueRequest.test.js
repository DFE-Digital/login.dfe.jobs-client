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

describe('when sending outstanding requests awaiting approval', () => {

  const connectionString = 'some-redis-connection';
  const name = 'User One';
  const requestsCount = 8;

  let client;

  beforeEach(() => {    
    const { NotificationClient } = require('../../lib');
    client = new NotificationClient({connectionString: connectionString});
  });

  test('then it should create queue connecting to provided connection string', async () => {
    await client.sendSupportOverdueRequest(name, requestsCount);

    expect(Queue.mock.calls.length).toBe(1);
    expect(Queue.mock.calls[0][1].connection.url).toBe(connectionString);
  });

  test('then it should create job with type of supportoverduerequest', async () => {
    await client.sendSupportOverdueRequest(name, requestsCount);

    expect(Queue.mock.calls.length).toBe(1);
    expect(Queue.mock.calls[0][0]).toBe('supportoverduerequest');
  });

  test('then it should create job with data in call', async () => {
    await client.sendSupportOverdueRequest(name, requestsCount);

    expect(Queue.mock.results[0].value.add).toHaveBeenCalledWith('supportoverduerequest',{
      email: undefined, 
      name: 'User One', 
      requestsCount: 8
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

  test('then it should save the job', async () => {
    await client.sendSupportOverdueRequest(name, requestsCount);

    expect(Queue.mock.results[0].value.add).toHaveBeenCalledTimes(1);
		expect(Queue.mock.results[0].value.close).toHaveBeenCalledTimes(1);
  });

  test('then it should resolve if there is no error', async () => {
    await expect(client.sendSupportOverdueRequest(name, requestsCount)).resolves.toBeUndefined();
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
    
    await expect( client.sendSupportOverdueRequest(name, requestsCount) ).rejects.toBeDefined();
    expect(Queue.mock.results[0].value.close).toHaveBeenCalledTimes(1);
  });

});
