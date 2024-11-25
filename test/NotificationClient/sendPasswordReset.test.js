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

describe('when sending a password reset', () => {

  const connectionString = 'some-redis-connection';
  const email = 'user.one@unit.test';
  const code = 'ABC123';
  const clientId = 'client1';
  const uid = '54321AVC';
  const firstName = 'Jane';
  const lastName = 'Doe'

  let client;

  beforeEach(() => {
    const { NotificationClient } = require('../../lib');
    client = new NotificationClient({connectionString: connectionString});
  });

  test('then it should create queue connecting to provided connection string', async () => {
    await client.sendPasswordReset(email, firstName, lastName, code, clientId, uid);

    expect(Queue.mock.calls.length).toBe(1);
    expect(Queue.mock.calls[0][1].connection.url).toBe(connectionString);
  });

  test('then it should create job with type of passwordreset_v1', async () => {
    await client.sendPasswordReset(email, firstName, lastName, code, clientId, uid);

    expect(Queue.mock.calls.length).toBe(1);
    expect(Queue.mock.calls[0][0]).toBe('passwordreset_v1');
  });

  test('then it should create job with data including email', async () => {
    await client.sendPasswordReset(email, firstName, lastName, code, clientId, uid);

    expect(Queue.mock.results[0].value.add.mock.calls[0][1].email).toBe(email);
  });

  test('then it should create job with data including first name', async () => {
    await client.sendPasswordReset(email, firstName, lastName, code, clientId, uid);
    expect(Queue.mock.results[0].value.add.mock.calls[0][1].firstName).toBe(firstName);
  });

  test('then it should create job with data including last name', async () => {
    await client.sendPasswordReset(email, firstName, lastName, code, clientId, uid);
    expect(Queue.mock.results[0].value.add.mock.calls[0][1].lastName).toBe(lastName);
  });

  test('then it should create job with data including code', async () => {
    await client.sendPasswordReset(email, firstName, lastName, code, clientId, uid);

    expect(Queue.mock.results[0].value.add.mock.calls[0][1].code).toBe(code);
  });

  test('then it should create job with data including clientId', async () => {
    await client.sendPasswordReset(email, firstName, lastName, code, clientId, uid);

    expect(Queue.mock.results[0].value.add.mock.calls[0][1].clientId).toBe(clientId);
  });

  test('then it should create job with data including uid', async () => {
    await client.sendPasswordReset(email, firstName, lastName, code, clientId, uid);

    expect(Queue.mock.results[0].value.add.mock.calls[0][1].uid).toBe(uid);
  });

  test('then it should save the job', async () => {
    await client.sendPasswordReset(email, firstName, lastName, code, clientId, uid);

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

    await expect(client.sendPasswordReset(email, firstName, lastName, code, clientId, uid)).rejects.toBeDefined();
    expect(Queue.mock.results[0].value.close).toHaveBeenCalledTimes(1);
  });

});
