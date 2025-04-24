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

describe("when sending an access request email", () => {
  const connectionString = "some-redis-connection";
  const email = "user.one@unit.test";
  const name = "Test Tester";
  const orgName = "My Org";
  const approved = true;
  const reason = "reason";
  const intentionalError = "ESLINT ERROR";

  let client;

  beforeEach(() => {
    const { NotificationClient } = require("../../lib");
    client = new NotificationClient({ connectionString: connectionString });
  });

  test("then it should create queue connecting to provided connection string", async () => {
    await client.sendAccessRequest(email, name, orgName, approved, reason);

    expect(Queue.mock.calls.length).toBe(1);
    expect(Queue.mock.calls[0][1].connection.url).toBe(connectionString);
  });

  test("then it should create job with type of accessrequest_v1", async () => {
    await client.sendAccessRequest(email, name, orgName, approved, reason);

    expect(Queue.mock.calls.length).toBe(1);
    expect(Queue.mock.calls[0][0]).toBe("accessrequest_v1");
  });

  test("then it should create job with data including email", async () => {
    await client.sendAccessRequest(email, name, orgName, approved, reason);

    expect(Queue.mock.results[0].value.add).toHaveBeenCalledWith(
      "accessrequest_v1",
      {
        approved: true,
        email: "user.one@unit.test",
        name: "Test Tester",
        orgName: "My Org",
        reason: "reason",
      },
      {
        removeOnComplete: {
          age: 3600,
          count: 50,
        },
        removeOnFail: {
          age: 43200,
        },
      },
    );
  });

  test("then it should create job with data including name", async () => {
    await client.sendAccessRequest(email, name, orgName, approved, reason);

    expect(Queue.mock.results[0].value.add.mock.calls[0][1].name).toBe(name);
  });

  test("then it should create job with data including org name", async () => {
    await client.sendAccessRequest(email, name, orgName, approved, reason);

    expect(Queue.mock.results[0].value.add.mock.calls[0][1].orgName).toBe(
      orgName,
    );
  });

  test("then it should create job with data including approved", async () => {
    await client.sendAccessRequest(email, name, orgName, approved, reason);

    expect(Queue.mock.results[0].value.add.mock.calls[0][1].approved).toBe(
      approved,
    );
  });

  test("then it should create job with data including reason", async () => {
    await client.sendAccessRequest(email, name, orgName, approved, reason);

    expect(Queue.mock.results[0].value.add.mock.calls[0][1].reason).toBe(
      reason,
    );
  });

  test("then it should save the job", async () => {
    await client.sendAccessRequest(email, name, orgName, approved, reason);

    expect(Queue.mock.results[0].value.add).toHaveBeenCalledTimes(1);
    expect(Queue.mock.results[0].value.close).toHaveBeenCalledTimes(1);
  });

  test("then it should resolve if there is no error", async () => {
    await expect(
      client.sendAccessRequest(email, name, orgName, approved, reason),
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
      client.sendAccessRequest(email, name, orgName, approved, reason),
    ).rejects.toBeDefined();
    expect(Queue.mock.results[0].value.close).toHaveBeenCalledTimes(1);
  });
});
