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

describe("when sending a sub-service request email", () => {
  const connectionString = "some-redis-connection";
  const senderFirstName = "Jane";
  const senderLastName = "Doe";
  const senderEmail = "jane.doe@unit.test";
  const orgName = "Test Organisation";
  const orgId = "OrgansiationID-123456";
  const serviceName = "Test ServiceName";
  const requestedSubServices = ["test-sub-service"];
  const baseUrl = "https://localhost:3000";
  const rejectUrl = `${baseUrl}/request-service/org1/users/user1/services/service1/roles/${encodeURIComponent(
    JSON.stringify(requestedSubServices),
  )}/reject-roles-request?reqId=new-uuid`;
  const approveUrl = `${baseUrl}/request-service/org1/users/user1/services/service1/roles/${encodeURIComponent(
    JSON.stringify(requestedSubServices),
  )}/approve-roles-request?reqId=new-uuid`;
  const helpUrl =
    "https://localhost:3001/help/requests/can-end-user-request-service";

  let client;

  beforeEach(() => {
    const { NotificationClient } = require("../../lib");
    client = new NotificationClient({ connectionString: connectionString });
  });

  it("then it should create queue connecting to provided connection string", async () => {
    await client.sendSubServiceRequestToApprovers(
      senderFirstName,
      senderLastName,
      senderEmail,
      orgId,
      orgName,
      serviceName,
      requestedSubServices,
      rejectUrl,
      approveUrl,
      helpUrl,
    );

    expect(Queue.mock.calls.length).toBe(1);
    expect(Queue.mock.calls[0][1].connection.url).toBe(connectionString);
  });

  it("then it should create job with type of sub_service_request_to_approvers", async () => {
    await client.sendSubServiceRequestToApprovers(
      senderFirstName,
      senderLastName,
      senderEmail,
      orgId,
      orgName,
      serviceName,
      requestedSubServices,
      rejectUrl,
      approveUrl,
      helpUrl,
    );

    expect(Queue.mock.calls.length).toBe(1);
    expect(Queue.mock.calls[0][0]).toBe("sub_service_request_to_approvers");
  });

  it("then it should create job with data including sender`s first name", async () => {
    await client.sendSubServiceRequestToApprovers(
      senderFirstName,
      senderLastName,
      senderEmail,
      orgId,
      orgName,
      serviceName,
      requestedSubServices,
      rejectUrl,
      approveUrl,
      helpUrl,
    );

    expect(
      Queue.mock.results[0].value.add.mock.calls[0][1].senderFirstName,
    ).toBe(senderFirstName);
  });

  it("then it should create job with data including sender`s lastName", async () => {
    await client.sendSubServiceRequestToApprovers(
      senderFirstName,
      senderLastName,
      senderEmail,
      orgId,
      orgName,
      serviceName,
      requestedSubServices,
      rejectUrl,
      approveUrl,
      helpUrl,
    );

    expect(
      Queue.mock.results[0].value.add.mock.calls[0][1].senderLastName,
    ).toBe(senderLastName);
  });

  it("then it should create job with data including sender Email address", async () => {
    await client.sendSubServiceRequestToApprovers(
      senderFirstName,
      senderLastName,
      senderEmail,
      orgId,
      orgName,
      serviceName,
      requestedSubServices,
      rejectUrl,
      approveUrl,
      helpUrl,
    );

    expect(Queue.mock.results[0].value.add.mock.calls[0][1].senderEmail).toBe(
      senderEmail,
    );
  });

  it("then it should create job with data including organisation id", async () => {
    await client.sendSubServiceRequestToApprovers(
      senderFirstName,
      senderLastName,
      senderEmail,
      orgId,
      orgName,
      serviceName,
      requestedSubServices,
      rejectUrl,
      approveUrl,
      helpUrl,
    );

    expect(Queue.mock.results[0].value.add.mock.calls[0][1].orgId).toBe(orgId);
  });

  it("then it should create job with data including organisation name", async () => {
    await client.sendSubServiceRequestToApprovers(
      senderFirstName,
      senderLastName,
      senderEmail,
      orgId,
      orgName,
      serviceName,
      requestedSubServices,
      rejectUrl,
      approveUrl,
      helpUrl,
    );

    expect(Queue.mock.results[0].value.add.mock.calls[0][1].orgName).toBe(
      orgName,
    );
  });

  it("then it should create job with data including service name", async () => {
    await client.sendSubServiceRequestToApprovers(
      senderFirstName,
      senderLastName,
      senderEmail,
      orgId,
      orgName,
      serviceName,
      requestedSubServices,
      rejectUrl,
      approveUrl,
      helpUrl,
    );

    expect(Queue.mock.results[0].value.add.mock.calls[0][1].serviceName).toBe(
      serviceName,
    );
  });

  it("then it should create job with data including requested sub services names", async () => {
    await client.sendSubServiceRequestToApprovers(
      senderFirstName,
      senderLastName,
      senderEmail,
      orgId,
      orgName,
      serviceName,
      requestedSubServices,
      rejectUrl,
      approveUrl,
      helpUrl,
    );

    expect(
      Queue.mock.results[0].value.add.mock.calls[0][1].requestedSubServices,
    ).toBe(requestedSubServices);
  });

  it("then it should create job with data including the url for rejecting the request", async () => {
    await client.sendSubServiceRequestToApprovers(
      senderFirstName,
      senderLastName,
      senderEmail,
      orgId,
      orgName,
      serviceName,
      requestedSubServices,
      rejectUrl,
      approveUrl,
      helpUrl,
    );

    expect(Queue.mock.results[0].value.add.mock.calls[0][1].rejectUrl).toBe(
      rejectUrl,
    );
  });

  it("then it should create job with data including the url for approving the request", async () => {
    await client.sendSubServiceRequestToApprovers(
      senderFirstName,
      senderLastName,
      senderEmail,
      orgId,
      orgName,
      serviceName,
      requestedSubServices,
      rejectUrl,
      approveUrl,
      helpUrl,
    );

    expect(Queue.mock.results[0].value.add.mock.calls[0][1].approveUrl).toBe(
      approveUrl,
    );
  });

  it("then it should create job with data including the url for help pages", async () => {
    await client.sendSubServiceRequestToApprovers(
      senderFirstName,
      senderLastName,
      senderEmail,
      orgId,
      orgName,
      serviceName,
      requestedSubServices,
      rejectUrl,
      approveUrl,
      helpUrl,
    );

    expect(Queue.mock.results[0].value.add.mock.calls[0][1].helpUrl).toBe(
      helpUrl,
    );
  });

  it("then it should save the job", async () => {
    await client.sendSubServiceRequestToApprovers(
      senderFirstName,
      senderLastName,
      senderEmail,
      orgId,
      orgName,
      serviceName,
      requestedSubServices,
      rejectUrl,
      approveUrl,
      helpUrl,
    );

    expect(Queue.mock.results[0].value.add).toHaveBeenCalledTimes(1);
    expect(Queue.mock.results[0].value.close).toHaveBeenCalledTimes(1);
  });

  it("then it should reject if there is an error", async () => {
    Queue.mockImplementation(() => {
      return {
        add: jest.fn(),
        close: jest.fn().mockImplementation(() => {
          throw new Error("bad times");
        }),
      };
    });

    await expect(
      client.sendSubServiceRequestToApprovers(
        senderFirstName,
        senderLastName,
        senderEmail,
        orgId,
        orgName,
        serviceName,
        requestedSubServices,
        rejectUrl,
        approveUrl,
        helpUrl,
      ),
    ).rejects.toBeDefined();
    expect(Queue.mock.results[0].value.close).toHaveBeenCalledTimes(1);
  });
});
