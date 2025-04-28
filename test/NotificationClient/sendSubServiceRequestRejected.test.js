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

describe("when sending an sub service request approv email", () => {
  const connectionString = "some-redis-connection";
  const email = "jane.doe@unit.test";
  const firstName = "Jane";
  const lastName = "Doe";
  const orgName = "Test Organisation";
  const serviceName = "Test ServiceName";
  const requestedSubServices = ["test-sub-service"];
  const reason = "Not allowed";

  let client;

  beforeEach(() => {
    const { NotificationClient } = require("../../lib");
    client = new NotificationClient({ connectionString: connectionString });
  });

  test("then it should create queue connecting to provided connection string", async () => {
    await client.sendSubServiceRequestRejected(
      email,
      firstName,
      lastName,
      orgName,
      serviceName,
      requestedSubServices,
      reason,
    );

    expect(Queue.mock.calls.length).toBe(1);
    expect(Queue.mock.calls[0][1].connection.url).toBe(connectionString);
  });

  test("then it should create job with type of sub_service_request_rejected", async () => {
    await client.sendSubServiceRequestRejected(
      email,
      firstName,
      lastName,
      orgName,
      serviceName,
      requestedSubServices,
      reason,
    );

    expect(Queue.mock.calls.length).toBe(1);
    expect(Queue.mock.calls[0][0]).toBe("sub_service_request_rejected");
  });

  test("then it should create job with data including email", async () => {
    await client.sendSubServiceRequestRejected(
      email,
      firstName,
      lastName,
      orgName,
      serviceName,
      requestedSubServices,
      reason,
    );

    expect(Queue.mock.results[0].value.add.mock.calls[0][1].email).toBe(email);
  });

  test("then it should create job with data including first name", async () => {
    await client.sendSubServiceRequestRejected(
      email,
      firstName,
      lastName,
      orgName,
      serviceName,
      requestedSubServices,
      reason,
    );

    expect(Queue.mock.results[0].value.add.mock.calls[0][1].firstName).toBe(
      firstName,
    );
  });

  test("then it should create job with data including last name", async () => {
    await client.sendSubServiceRequestRejected(
      email,
      firstName,
      lastName,
      orgName,
      serviceName,
      requestedSubServices,
      reason,
    );

    expect(Queue.mock.results[0].value.add.mock.calls[0][1].lastName).toBe(
      lastName,
    );
  });

  test("then it should create job with data including organisation name", async () => {
    await client.sendSubServiceRequestRejected(
      email,
      firstName,
      lastName,
      orgName,
      serviceName,
      requestedSubServices,
      reason,
    );

    expect(Queue.mock.results[0].value.add.mock.calls[0][1].orgName).toBe(
      orgName,
    );
  });

  test("then it should create job with data including service name", async () => {
    await client.sendSubServiceRequestRejected(
      email,
      firstName,
      lastName,
      orgName,
      serviceName,
      requestedSubServices,
      reason,
    );

    expect(Queue.mock.results[0].value.add.mock.calls[0][1].serviceName).toBe(
      serviceName,
    );
  });

  test("then it should create job with data including requested sub-services", async () => {
    await client.sendSubServiceRequestRejected(
      email,
      firstName,
      lastName,
      orgName,
      serviceName,
      requestedSubServices,
      reason,
    );

    expect(
      Queue.mock.results[0].value.add.mock.calls[0][1].requestedSubServices,
    ).toBe(requestedSubServices);
  });

  test("then it should create job with data including rejection reason", async () => {
    await client.sendSubServiceRequestRejected(
      email,
      firstName,
      lastName,
      orgName,
      serviceName,
      requestedSubServices,
      reason,
    );

    expect(Queue.mock.results[0].value.add.mock.calls[0][1].reason).toBe(
      reason,
    );
  });

  test("then it should save the job", async () => {
    await client.sendSubServiceRequestRejected(
      email,
      firstName,
      lastName,
      orgName,
      serviceName,
      requestedSubServices,
      reason,
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
      client.sendSubServiceRequestRejected(
        email,
        firstName,
        lastName,
        orgName,
        serviceName,
        requestedSubServices,
        reason,
      ),
    ).rejects.toBeDefined();
    expect(Queue.mock.results[0].value.close).toHaveBeenCalledTimes(1);
  });
});
