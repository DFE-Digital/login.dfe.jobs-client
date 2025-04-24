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
const user = {
  sub: "user-1",
  email: "user.one@unit.test",
  status: {
    id: 1,
  },
};

describe("when sending userupdated_v1", () => {
  let client;

  beforeEach(() => {
    client = new ServiceNotificationsClient({ connectionString });
  });

  it("then it should create new queue connection to redis", async () => {
    await client.notifyUserUpdated(user);

    expect(Queue.mock.calls.length).toBe(1);
    expect(Queue.mock.calls[0][1].connection.url).toBe(connectionString);
  });

  it("then it should create job with correct type", async () => {
    await client.notifyUserUpdated(user);

    expect(Queue.mock.calls.length).toBe(1);
    expect(Queue.mock.calls[0][0]).toBe("userupdated_v1");
    expect(Queue.mock.results[0].value.close.mock.calls.length).toBe(1);
  });

  it("then it should create job with correct data", async () => {
    await client.notifyUserUpdated(user);

    expect(Queue.mock.results[0].value.add).toHaveBeenCalledTimes(1);
    expect(Queue.mock.results[0].value.add.mock.calls[0][1]).toEqual(user);
  });

  it("then it should save job", async () => {
    await client.notifyUserUpdated(user);

    expect(Queue.mock.results[0].value.add).toHaveBeenCalledTimes(1);
    expect(Queue.mock.results[0].value.close).toHaveBeenCalledTimes(1);
  });

  it("then it should return job id", async () => {
    const jobId = await client.notifyUserUpdated(user);

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

    await expect(client.notifyUserUpdated(user)).rejects.toThrow("bad times");
    expect(Queue.mock.results[0].value.close.mock.calls.length).toBe(1);
  });
});
