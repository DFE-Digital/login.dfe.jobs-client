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

describe("when sending an organisation request outcome to approvers email", () => {
  const connectionString = "some-redis-connection";
  const organisationId = "org-1";
  const approverUserId = "approver-1";
  const email = "user.one@unit.test";
  const name = "Test Tester";
  const orgName = "My Org";
  const approved = true;
  const reason = "reason";

  let client;

  beforeEach(() => {
    const { NotificationClient } = require("../../lib");
    client = new NotificationClient({ connectionString: connectionString });
  });

  test("then it should create queue connecting to provided connection string and template", async () => {
    await client.sendOrganisationRequestOutcomeToApprovers(
      email,
      name,
      orgName,
      approved,
      reason,
    );

    expect(Queue.mock.calls.length).toBe(1);
    expect(Queue.mock.calls[0][1].connection.url).toBe(connectionString);
    expect(Queue.mock.calls.length).toBe(1);
    expect(Queue.mock.calls[0][0]).toBe(
      "organisation_request_outcome_to_approvers",
    );
  });

  test("then it should create job with data including email", async () => {
    await client.sendOrganisationRequestOutcomeToApprovers(
      organisationId,
      approverUserId,
      email,
      name,
      orgName,
      approved,
      reason,
    );

    expect(Queue.mock.results[0].value.add).toHaveBeenCalledWith(
      "organisation_request_outcome_to_approvers",
      {
        organisationId: "org-1",
        approverUserId: "approver-1",
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

  test("then it should save the job", async () => {
    await client.sendOrganisationRequestOutcomeToApprovers(
      organisationId,
      approverUserId,
      email,
      name,
      orgName,
      approved,
      reason,
    );

    expect(Queue.mock.results[0].value.add).toHaveBeenCalledTimes(1);
    expect(Queue.mock.results[0].value.close).toHaveBeenCalledTimes(1);
  });

  test("then it should resolve if there is no error", async () => {
    await expect(
      client.sendOrganisationRequestOutcomeToApprovers(
        organisationId,
        approverUserId,
        email,
        name,
        orgName,
        approved,
        reason,
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
      client.sendOrganisationRequestOutcomeToApprovers(
        organisationId,
        approverUserId,
        email,
        name,
        orgName,
        approved,
        reason,
      ),
    ).rejects.toBeDefined();
    expect(Queue.mock.results[0].value.close).toHaveBeenCalledTimes(1);
  });
});
