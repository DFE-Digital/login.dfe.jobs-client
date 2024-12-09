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

describe('when sending a verification of change of email', () => {

  const connectionString = 'some-redis-connection';
  const email = 'user.one@unit.test';
  const firstName = 'User';
  const lastName = 'One';
  const code = 'ABC123';
  const uid = 'user1';

  let client;

  beforeEach(() => {
    const { NotificationClient } = require('../../lib');
    client = new NotificationClient({connectionString: connectionString});
  });

  test('then it should create queue connecting to provided connection string', async () => {
    await client.sendVerifyChangeEmail(email, firstName, lastName, code);

    expect(Queue.mock.calls.length).toBe(1);
    expect(Queue.mock.calls[0][1].connection.url).toBe(connectionString);
  });

  test('then it should create job with type of verifychangeemail_v1', async () => {
    await client.sendVerifyChangeEmail(email, firstName, lastName, code);

    expect(Queue.mock.calls.length).toBe(1);
    expect(Queue.mock.calls[0][0]).toBe('verifychangeemail_v1');
  });

  test('then it should create job with data including email', async () => {
    await client.sendVerifyChangeEmail(email, firstName, lastName, code);

    expect(Queue.mock.results[0].value.add.mock.calls[0][1].email).toBe(email);
  });

  test('then it should create job with data including first name', async () => {
    await client.sendVerifyChangeEmail(email, firstName, lastName, code);

    expect(Queue.mock.results[0].value.add.mock.calls[0][1].firstName).toBe(firstName);
  });

  test('then it should create job with data including last name', async () => {
    await client.sendVerifyChangeEmail(email, firstName, lastName, code);

    expect(Queue.mock.results[0].value.add.mock.calls[0][1].lastName).toBe(lastName);
  });

  test('then it should create job with data including code', async () => {
    await client.sendVerifyChangeEmail(email, firstName, lastName, code);

    expect(Queue.mock.results[0].value.add.mock.calls[0][1].code).toBe(code);
  });

  test('then it should create job with data not including uid if not passed', async () => {
    await client.sendVerifyChangeEmail(email, firstName, lastName, code);

    expect(Queue.mock.results[0].value.add.mock.calls[0][1].uid).toBeUndefined();
  });

  test('then it should create job with data not including uid is undefined', async () => {
    await client.sendVerifyChangeEmail(email, firstName, lastName, code, undefined);

    expect(Queue.mock.results[0].value.add.mock.calls[0][1].uid).toBeUndefined();
  });

  test('then it should create job with data not including uid is null', async () => {
    await client.sendVerifyChangeEmail(email, firstName, lastName, code, null);

    expect(Queue.mock.results[0].value.add.mock.calls[0][1].uid).toBeUndefined();
  });

  test('then it should create job with data including uid if defined', async () => {
    await client.sendVerifyChangeEmail(email, firstName, lastName, code, uid);

    expect(Queue.mock.results[0].value.add.mock.calls[0][1].uid).toBe(uid);
  });

  test('then it should save the job', async () => {
    await client.sendVerifyChangeEmail(email, firstName, lastName, code);

    expect(Queue.mock.results[0].value.add).toHaveBeenCalledTimes(1);
		expect(Queue.mock.results[0].value.close).toHaveBeenCalledTimes(1);
  });

  test('then it should resolve if there is no error', async () => {
    await expect(client.sendVerifyChangeEmail(email, firstName, lastName, code)).resolves.toBeUndefined();
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

    await expect(client.sendVerifyChangeEmail(email, firstName, lastName, code)).rejects.toBeDefined();
    expect(Queue.mock.results[0].value.close).toHaveBeenCalledTimes(1);
  });

});
