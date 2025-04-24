jest.mock("bullmq", () => {
  return {
    Queue: jest.fn().mockImplementation(() => {
      return {
        add: jest.fn().mockReturnValue({ id: 1 }),
        close: jest.fn(),
      };
    }),
  };
});

const { Queue } = require("bullmq");
const { ServiceNotificationsClient } = require("../../lib");

const connectionString = "some-redis-connection-string";
const role = {
  id: "role-1",
  name: "Role One",
  code: "ROLEONE",
  status: {
    id: 1,
  },
};

describe("when sending roleupdated_v1", () => {
  let client;

  beforeEach(() => {
    client = new ServiceNotificationsClient({ connectionString });
  });

  it("then it should create new queue connection to redis", async () => {
    await client.notifyRoleUpdated(role);

    expect(Queue.mock.calls.length).toBe(1);
    expect(Queue.mock.calls[0][1].connection.url).toBe(connectionString);
  });

  it("then it should create job with correct type", async () => {
    await client.notifyRoleUpdated(role);

    expect(Queue.mock.calls.length).toBe(1);
    expect(Queue.mock.calls[0][0]).toBe("roleupdated_v1");
    expect(Queue.mock.results[0].value.close.mock.calls.length).toBe(1);
  });

  it("then it should create job with correct data", async () => {
    await client.notifyRoleUpdated(role);

    expect(Queue.mock.results[0].value.add).toHaveBeenCalledTimes(1);
    expect(Queue.mock.results[0].value.add.mock.calls[0][1]).toEqual(role);
  });

  it("then it should save job", async () => {
    await client.notifyRoleUpdated(role);

    expect(Queue.mock.results[0].value.add).toHaveBeenCalledTimes(1);
    expect(Queue.mock.results[0].value.close).toHaveBeenCalledTimes(1);
  });

  it("then it should return job id", async () => {
    const jobId = await client.notifyRoleUpdated(role);

    expect(jobId).toBe(1);
    expect(Queue.mock.results[0].value.add.mock.calls.length).toBe(1);
    expect(Queue.mock.results[0].value.close.mock.calls.length).toBe(1);
  });

  it("then it should error if fails to save job", async () => {
    Queue.mockImplementation(() => {
      return {
        add: jest.fn(),
        close: jest.fn().mockImplementation(() => {
          throw new Error("bad times");
        }),
      };
    });

    await expect(client.notifyRoleUpdated(role)).rejects.toThrow("bad times");
    expect(Queue.mock.results[0].value.close.mock.calls.length).toBe(1);
  });

  it("then it should error if role not passed", async () => {
    await expect(client.notifyRoleUpdated(undefined)).rejects.toThrow(
      "Role must be provided",
    );
  });

  it("then it should error if role has no id", async () => {
    const clonedRole = { ...role };
    delete clonedRole.id;

    await expect(client.notifyRoleUpdated(clonedRole)).rejects.toThrow(
      "Role must have id",
    );
  });

  it("then it should error if role has no name", async () => {
    const clonedRole = { ...role };
    delete clonedRole.name;

    await expect(client.notifyRoleUpdated(clonedRole)).rejects.toThrow(
      "Role must have name",
    );
  });

  it("then it should error if role has no code", async () => {
    const clonedRole = { ...role };
    delete clonedRole.code;

    await expect(client.notifyRoleUpdated(clonedRole)).rejects.toThrow(
      "Role must have code",
    );
  });
});
