jest.mock("bullmq", () => {
  return {
    Queue: jest.fn().mockImplementation(() => {
      return {
        add: jest.fn(),
        close: jest.fn(),
      };
    }),
  };
});

const { Queue } = require("bullmq");

describe("when sending a support request", () => {
  const connectionString = "some-redis-connection";
  const name = "User One";
  const email = "user.one@unit.test";
  const phone = "1234567981";
  const service = "DfE Sign-in Client Service";
  const type = "I have multiple accounts";
  const message = "I am having trouble signing in using my new details";
  const orgName = "org1";
  const urn = "123345";

  let client;

  beforeEach(() => {
    const { NotificationClient } = require("../../lib");
    client = new NotificationClient({ connectionString: connectionString });
  });

  test("then it should create queue connecting to provided connection string", async () => {
    await client.sendSupportRequest(
      name,
      email,
      phone,
      service,
      type,
      message,
      orgName,
      urn,
    );

    expect(Queue.mock.calls.length).toBe(1);
    expect(Queue.mock.calls[0][1].connection.url).toBe(connectionString);
  });

  test("then it should create job with type of supportrequest_v1", async () => {
    await client.sendSupportRequest(
      name,
      email,
      phone,
      service,
      type,
      message,
      orgName,
      urn,
    );

    expect(Queue.mock.calls.length).toBe(1);
    expect(Queue.mock.calls[0][0]).toBe("supportrequest_v1");
  });

  test("then it should create job with data in call", async () => {
    await client.sendSupportRequest(
      name,
      email,
      service,
      type,
      null,
      orgName,
      urn,
      message,
    );
    expect(Queue.mock.results[0].value.add.mock.calls[0][1]).toEqual({
      name,
      email,
      service,
      service,
      type,
      typeAdditionalInfo: null,
      orgName,
      urn,
      message,
    });
  });

  test("then it should save the job", async () => {
    await client.sendSupportRequest(
      name,
      email,
      phone,
      service,
      type,
      message,
      orgName,
      urn,
    );

    expect(Queue.mock.results[0].value.add).toHaveBeenCalledTimes(1);
    expect(Queue.mock.results[0].value.close).toHaveBeenCalledTimes(1);
  });

  test("then it should resolve if there is no error", async () => {
    await expect(
      client.sendSupportRequest(
        name,
        email,
        phone,
        service,
        type,
        message,
        orgName,
        urn,
      ),
    ).resolves.toBeUndefined();
  });

  test("then it should reject if there is an error", async () => {
    Queue.mockImplementation(() => {
      return {
        add: jest.fn(),
        close: jest.fn().mockImplementation(() => {
          throw new Error("bad times");
        }),
      };
    });

    await expect(
      client.sendSupportRequest(
        name,
        email,
        phone,
        service,
        type,
        message,
        orgName,
        urn,
      ),
    ).rejects.toBeDefined();
    expect(Queue.mock.results[0].value.close).toHaveBeenCalledTimes(1);
  });
});
