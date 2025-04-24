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

describe("when sending a user service has been removed email", () => {
  const connectionString = "some-redis-connection";
  const email = "user.one@unit.test";
  const firstName = "User";
  const lastName = "One";
  const serviceName = "serviceName";
  const orgName = "org1";

  let client;

  beforeEach(() => {
    const { NotificationClient } = require("../../lib");
    client = new NotificationClient({ connectionString: connectionString });
  });

  test("then it should create queue connecting to provided connection string", async () => {
    await client.sendUserServiceRemoved(
      email,
      firstName,
      lastName,
      serviceName,
      orgName,
    );

    expect(Queue.mock.calls.length).toBe(1);
    expect(Queue.mock.calls[0][1].connection.url).toBe(connectionString);
  });

  test("then it should create job with type of useraddedtoorganisationrequest_v1", async () => {
    await client.sendUserServiceRemoved(
      email,
      firstName,
      lastName,
      serviceName,
      orgName,
    );

    expect(Queue.mock.calls.length).toBe(1);
    expect(Queue.mock.calls[0][0]).toBe("userserviceremoved_v1");
  });

  test("then it should create job with data including email", async () => {
    await client.sendUserServiceRemoved(
      email,
      firstName,
      lastName,
      serviceName,
      orgName,
    );

    expect(Queue.mock.results[0].value.add.mock.calls[0][1].email).toBe(email);
  });

  test("then it should create job with data including firstName", async () => {
    await client.sendUserServiceRemoved(
      email,
      firstName,
      lastName,
      serviceName,
      orgName,
    );

    expect(Queue.mock.results[0].value.add.mock.calls[0][1].firstName).toBe(
      firstName,
    );
  });

  test("then it should create job with data including lastName", async () => {
    await client.sendUserServiceRemoved(
      email,
      firstName,
      lastName,
      serviceName,
      orgName,
    );

    expect(Queue.mock.results[0].value.add.mock.calls[0][1].lastName).toBe(
      lastName,
    );
  });

  test("then it should save the job", async () => {
    await client.sendUserServiceRemoved(
      email,
      firstName,
      lastName,
      serviceName,
      orgName,
    );

    expect(Queue.mock.results[0].value.add).toHaveBeenCalledTimes(1);
    expect(Queue.mock.results[0].value.close).toHaveBeenCalledTimes(1);
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
      client.sendUserServiceRemoved(
        email,
        firstName,
        lastName,
        serviceName,
        orgName,
      ),
    ).rejects.toBeDefined();
    expect(Queue.mock.results[0].value.close).toHaveBeenCalledTimes(1);
  });
});
