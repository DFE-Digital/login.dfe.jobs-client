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

describe("when sending an invitation", () => {
  const connectionString = "some-redis-connection";
  const email = "user.one@unit.test";
  const firstName = "User";
  const lastName = "One";
  const invitationId = "some-uuid";
  const code = "ABC123";
  const serviceName = "Service One";
  const selfInvoked = true;

  let client;

  beforeEach(() => {
    const { NotificationClient } = require("../../lib");
    client = new NotificationClient({ connectionString: connectionString });
  });

  test("then it should create queue connecting to provided connection string", async () => {
    await client.sendInvitation(email, firstName, lastName, invitationId, code);

    expect(Queue.mock.calls.length).toBe(1);
    expect(Queue.mock.results[0].value.close).toHaveBeenCalledTimes(1);
    expect(Queue.mock.calls[0][1].connection.url).toBe(connectionString);
  });

  test("then it should create job with type of invitation_v2", async () => {
    await client.sendInvitation(
      email,
      firstName,
      lastName,
      invitationId,
      code,
      serviceName,
      selfInvoked,
    );

    expect(Queue.mock.calls.length).toBe(1);
    expect(Queue.mock.calls[0][0]).toBe("invitation_v2");
  });

  test("then it should create job with data including email", async () => {
    await client.sendInvitation(
      email,
      firstName,
      lastName,
      invitationId,
      code,
      serviceName,
      selfInvoked,
    );

    expect(Queue.mock.results[0].value.add).toHaveBeenCalledWith(
      "invitation_v2",
      {
        approverEmail: undefined,
        code: "ABC123",
        email: "user.one@unit.test",
        firstName: "User",
        invitationId: "some-uuid",
        isApprover: undefined,
        lastName: "One",
        orgName: undefined,
        overrides: undefined,
        selfInvoked: true,
        serviceName: "Service One",
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

  test("then it should create job with data including first name", async () => {
    await client.sendInvitation(
      email,
      firstName,
      lastName,
      invitationId,
      code,
      serviceName,
      selfInvoked,
    );

    expect(Queue.mock.results[0].value.add.mock.calls[0][1].firstName).toBe(
      firstName,
    );
  });

  test("then it should create job with data including last name", async () => {
    await client.sendInvitation(
      email,
      firstName,
      lastName,
      invitationId,
      code,
      serviceName,
      selfInvoked,
    );

    expect(Queue.mock.results[0].value.add.mock.calls[0][1].lastName).toBe(
      lastName,
    );
  });

  test("then it should create job with data including code", async () => {
    await client.sendInvitation(
      email,
      firstName,
      lastName,
      invitationId,
      code,
      serviceName,
      selfInvoked,
    );

    expect(Queue.mock.results[0].value.add.mock.calls[0][1].code).toBe(code);
  });

  test("then it should save the job", async () => {
    await client.sendInvitation(
      email,
      firstName,
      lastName,
      invitationId,
      code,
      serviceName,
      selfInvoked,
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
      client.sendInvitation(
        email,
        firstName,
        lastName,
        invitationId,
        code,
        serviceName,
        selfInvoked,
      ),
    ).rejects.toBeDefined();
    expect(Queue.mock.results[0].value.close).toHaveBeenCalledTimes(1);
  });
});
