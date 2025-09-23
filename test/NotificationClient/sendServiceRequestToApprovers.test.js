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

describe("when sending a service request to approvers email", () => {
  const connectionString = "some-redis-connection";
  const senderName = "Test name";
  const senderEmail = "";
  const orgName = "testOrg";
  const orgId = "org-1";
  const requestedServiceName = "testServiceName";
  const requestedSubServices = ["test-sub-service"];
  const rejectServiceUrl = "https://reject-service.com";
  const approveServiceUrl = "https://approve-service.com";
  const helpUrl = "https://help.com";

  let client;

  beforeEach(() => {
    const { NotificationClient } = require("../../lib");
    client = new NotificationClient({ connectionString: connectionString });
  });

  test("then it should create queue connecting to provided connection string and template", async () => {
    await client.sendServiceRequestToApprovers(
      senderName,
      senderEmail,
      orgId,
      orgName,
      requestedServiceName,
      requestedSubServices,
      rejectServiceUrl,
      approveServiceUrl,
      helpUrl,
    );

    expect(Queue.mock.calls.length).toBe(1);
    expect(Queue.mock.calls[0][1].connection.url).toBe(connectionString);
    expect(Queue.mock.calls.length).toBe(1);
    expect(Queue.mock.calls[0][0]).toBe("servicerequest_to_approvers_v2");
  });

  test("then it should create job with expected data", async () => {
    await client.sendServiceRequestToApprovers(
      senderName,
      senderEmail,
      orgId,
      orgName,
      requestedServiceName,
      requestedSubServices,
      rejectServiceUrl,
      approveServiceUrl,
      helpUrl,
    );

    expect(Queue.mock.results[0].value.add.mock.calls[0][1].senderName).toBe(
      senderName,
    );
    expect(Queue.mock.results[0].value.add.mock.calls[0][1].senderEmail).toBe(
      senderEmail,
    );
    expect(Queue.mock.results[0].value.add.mock.calls[0][1].orgId).toBe(orgId);
    expect(Queue.mock.results[0].value.add.mock.calls[0][1].orgName).toBe(
      orgName,
    );
    expect(
      Queue.mock.results[0].value.add.mock.calls[0][1].requestedServiceName,
    ).toBe(requestedServiceName);
    expect(
      Queue.mock.results[0].value.add.mock.calls[0][1].requestedSubServices,
    ).toBe(requestedSubServices);
    expect(
      Queue.mock.results[0].value.add.mock.calls[0][1].rejectServiceUrl,
    ).toBe(rejectServiceUrl);
    expect(
      Queue.mock.results[0].value.add.mock.calls[0][1].approveServiceUrl,
    ).toBe(approveServiceUrl);
    expect(Queue.mock.results[0].value.add.mock.calls[0][1].helpUrl).toBe(
      helpUrl,
    );
  });

  test("then it should save the job", async () => {
    await client.sendServiceRequestToApprovers(
      senderName,
      senderEmail,
      orgId,
      orgName,
      requestedServiceName,
      requestedSubServices,
      rejectServiceUrl,
      approveServiceUrl,
      helpUrl,
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
      client.sendServiceRequestToApprovers(
        senderName,
        senderEmail,
        orgId,
        orgName,
        requestedServiceName,
        requestedSubServices,
        rejectServiceUrl,
        approveServiceUrl,
        helpUrl,
      ),
    ).rejects.toBeDefined();
    expect(Queue.mock.results[0].value.close).toHaveBeenCalledTimes(1);
  });
});
