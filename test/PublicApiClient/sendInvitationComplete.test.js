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
const { PublicApiClient } = require('../../lib');

const connectionString = 'some-redis-connection-string';
const userId = 'user-1';
const callbacks = [
  { sourceId: 'first-user', callback: 'http://relying.party/cb' },
];

describe('when sending publicinvitationcomplete_v1', () => {
  let client;

  beforeEach(() => {
    client = new PublicApiClient({ connectionString });
  });

  it('then it should create new queue connection to redis', async () => {
    await client.sendInvitationComplete(userId, callbacks);

    expect(Queue.mock.calls.length).toBe(1);
    expect(Queue.mock.calls[0][1].connection.url).toBe(connectionString);
  });

  it('then it should create job with correct type', async () => {
    await client.sendInvitationComplete(userId, callbacks);

    expect(Queue.mock.calls.length).toBe(1);
    expect(Queue.mock.calls[0][0]).toBe('publicinvitationcomplete_v1');
    expect(Queue.mock.results[0].value.close).toHaveBeenCalledTimes(1);
  });

  it('then it should create job with correct data', async () => {
    await client.sendInvitationComplete(userId, callbacks);

    expect(Queue.mock.results[0].value.add).toHaveBeenCalledTimes(1);
    expect(Queue.mock.results[0].value.close).toHaveBeenCalledTimes(1);
    expect(Queue.mock.results[0].value.add.mock.calls[0][1]).toEqual({
      userId,
      callbacks,
    });
  });

  it('then it should save job', async () => {
    await client.sendInvitationComplete(userId, callbacks);

    expect(Queue.mock.results[0].value.add).toHaveBeenCalledTimes(1);
    expect(Queue.mock.results[0].value.close).toHaveBeenCalledTimes(1);
  });

  it('then it should error if fails to save job', async () => {
    Queue.mockImplementation(() => {
      return {
        add: jest.fn(),
        close: jest.fn().mockImplementation(() => {
          throw new Error('bad times');
        })
      };
    });
    
    await expect(client.sendInvitationComplete(userId, callbacks)).rejects.toBeDefined();
    expect(Queue.mock.results[0].value.close).toHaveBeenCalledTimes(1);
  });
});
