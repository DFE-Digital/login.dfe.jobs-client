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

describe("when sending an service approved to approvers email", () => {
  const connectionString = "some-redis-connection";
  const organisationId = "org-1";
  const approverUserId = "approver-1";
  const endUserEmail = "user.one@unit.test";
  const endUserName = "User One";
  const orgName = "testOrg";
  const requestedServiceName = "testServiceName";
  const requestedSubServices = ["test-sub-service"];
  const approved = true;
  const reason = undefined;

  let client;

  beforeEach(() => {
    const { NotificationClient } = require("../../lib");
    client = new NotificationClient({ connectionString: connectionString });
  });

  test("then it should create queue connecting to provided connection string and template", async () => {
    await client.sendServiceRequestOutcomeToApprovers(
      organisationId,
      approverUserId,
      endUserEmail,
      endUserName,
      orgName,
      requestedServiceName,
      requestedSubServices,
      approved,
      reason,
    );

    expect(Queue.mock.calls.length).toBe(1);
    expect(Queue.mock.calls[0][1].connection.url).toBe(connectionString);
    expect(Queue.mock.calls.length).toBe(1);
    expect(Queue.mock.calls[0][0]).toBe(
      "user_service_request_outcome_to_approvers",
    );
  });

  test("then it should create job with expected data", async () => {
    await client.sendServiceRequestOutcomeToApprovers(
      organisationId,
      approverUserId,
      endUserEmail,
      endUserName,
      orgName,
      requestedServiceName,
      requestedSubServices,
      approved,
      reason,
    );

    expect(
      Queue.mock.results[0].value.add.mock.calls[0][1].organisationId,
    ).toBe(organisationId);
    expect(
      Queue.mock.results[0].value.add.mock.calls[0][1].approverUserId,
    ).toBe(approverUserId);
    expect(Queue.mock.results[0].value.add.mock.calls[0][1].endUserEmail).toBe(
      endUserEmail,
    );
    expect(Queue.mock.results[0].value.add.mock.calls[0][1].endUserName).toBe(
      endUserName,
    );
    expect(Queue.mock.results[0].value.add.mock.calls[0][1].orgName).toBe(
      orgName,
    );
    expect(
      Queue.mock.results[0].value.add.mock.calls[0][1].requestedServiceName,
    ).toBe(requestedServiceName);
    expect(
      Queue.mock.results[0].value.add.mock.calls[0][1].requestedSubServices,
    ).toBe(requestedSubServices);
    expect(Queue.mock.results[0].value.add.mock.calls[0][1].approved).toBe(
      approved,
    );
    expect(Queue.mock.results[0].value.add.mock.calls[0][1].reason).toBe(
      reason,
    );
  });

  test("then it should save the job", async () => {
    await client.sendServiceRequestOutcomeToApprovers(
      organisationId,
      approverUserId,
      endUserEmail,
      endUserName,
      orgName,
      requestedServiceName,
      requestedSubServices,
      approved,
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
      client.sendServiceRequestOutcomeToApprovers(
        organisationId,
        approverUserId,
        endUserEmail,
        endUserName,
        orgName,
        requestedServiceName,
        requestedSubServices,
        approved,
        reason,
      ),
    ).rejects.toBeDefined();
    expect(Queue.mock.results[0].value.close).toHaveBeenCalledTimes(1);
  });
});
