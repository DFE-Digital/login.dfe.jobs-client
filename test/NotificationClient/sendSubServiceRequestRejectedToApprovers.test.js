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

describe("when sending an sub service request rejected to approvers email", () => {
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

  test("then it should create queue connecting to provided connection string and template", async () => {
    await client.sendSubServiceRequestRejectedToApprovers(
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
    expect(Queue.mock.calls.length).toBe(1);
    expect(Queue.mock.calls[0][0]).toBe(
      "sub_service_request_rejected_to_approvers",
    );
  });

  test("then it should create job with expected data", async () => {
    await client.sendSubServiceRequestRejectedToApprovers(
      email,
      firstName,
      lastName,
      orgName,
      serviceName,
      requestedSubServices,
      reason,
    );

    expect(Queue.mock.results[0].value.add.mock.calls[0][1].email).toBe(email);
    expect(Queue.mock.results[0].value.add.mock.calls[0][1].firstName).toBe(
      firstName,
    );
    expect(Queue.mock.results[0].value.add.mock.calls[0][1].lastName).toBe(
      lastName,
    );
    expect(Queue.mock.results[0].value.add.mock.calls[0][1].orgName).toBe(
      orgName,
    );
    expect(Queue.mock.results[0].value.add.mock.calls[0][1].serviceName).toBe(
      serviceName,
    );
    expect(
      Queue.mock.results[0].value.add.mock.calls[0][1].requestedSubServices,
    ).toBe(requestedSubServices);
    expect(Queue.mock.results[0].value.add.mock.calls[0][1].reason).toBe(
      reason,
    );
  });

  test("then it should save the job", async () => {
    await client.sendSubServiceRequestRejectedToApprovers(
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
      client.sendSubServiceRequestRejectedToApprovers(
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
