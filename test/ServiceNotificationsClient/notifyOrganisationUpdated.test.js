jest.mock('bullmq', () => {
  return {
    Queue: jest.fn().mockImplementation(() => {
      return {
        add: jest.fn().mockReturnValue({ id: 1}),
        close: jest.fn(),
      };
    })
  };
});

const { Queue } = require('bullmq');
const { ServiceNotificationsClient } = require('../../lib');

const connectionString = 'some-redis-connection-string';
const organisation = {
  id: 'organisaton-1',
  name: 'Organisation One',
  category: {
    id: '001',
    name: 'Establishment',
  }
};

describe('when sending organisationupdated_v1', () => {
  let client;

  beforeEach(() => {
    client = new ServiceNotificationsClient({ connectionString });
  });

  it('then it should create new queue connection to redis', async () => {
    await client.notifyOrganisationUpdated(organisation);

    expect(Queue.mock.calls.length).toBe(1);
    expect(Queue.mock.calls[0][1].connection.url).toBe(connectionString);
  });

  it('then it should create job with correct type', async () => {
    await client.notifyOrganisationUpdated(organisation);

    expect(Queue.mock.calls.length).toBe(1);
    expect(Queue.mock.calls[0][0]).toBe('organisationupdated_v1');
    expect(Queue.mock.results[0].value.close.mock.calls.length).toBe(1);
  });

  it('then it should create job with correct data', async () => {
    await client.notifyOrganisationUpdated(organisation);

    expect(Queue.mock.results[0].value.add).toHaveBeenCalledTimes(1);
    expect(Queue.mock.results[0].value.add.mock.calls[0][1]).toEqual(organisation);
  });

  it('then it should save job', async () => {
    await client.notifyOrganisationUpdated(organisation);

    expect(Queue.mock.results[0].value.add).toHaveBeenCalledTimes(1);
    expect(Queue.mock.results[0].value.close).toHaveBeenCalledTimes(1);
  });

  it('then it should return job id', async () => {
    const jobId = await client.notifyOrganisationUpdated(organisation);

    expect(jobId).toBe(1);
    expect(Queue.mock.results[0].value.add.mock.calls.length).toBe(1);
    expect(Queue.mock.results[0].value.close.mock.calls.length).toBe(1);
  });

  it('then it should error if fails to save job', async () => {
    Queue.mockImplementation(() => {
      return {
        add: jest.fn(),
        close: jest.fn().mockImplementation(() => {
          throw new Error('bad times');
        })
      };
    });

    await expect(client.notifyOrganisationUpdated(organisation)).rejects.toThrow('bad times');
    expect(Queue.mock.results[0].value.close.mock.calls.length).toBe(1);
  });

  it('then it should error if organisation not passed', async () => {
    
    await expect(client.notifyOrganisationUpdated(undefined)).rejects.toThrow('Organisation must be provided');
  });

  it('then it should error if organisation missing id', async () => {
    const brokenOrganisation = Object.assign({}, organisation, { id: undefined });

    await expect(client.notifyOrganisationUpdated(brokenOrganisation)).rejects.toThrow('Organisation must have id');
    expect(Queue.mock.calls.length).toBe(0);
  });

  it('then it should error if organisation missing name', async () => {
    const brokenOrganisation = Object.assign({}, organisation, { name: undefined });

    await expect(client.notifyOrganisationUpdated(brokenOrganisation)).rejects.toThrow('Organisation must have name');
    expect(Queue.mock.calls.length).toBe(0);
  });

  it('then it should error if organisation missing category', async () => {
    const brokenOrganisation = Object.assign({}, organisation, { category: undefined });
    await expect(client.notifyOrganisationUpdated(brokenOrganisation)).rejects.toThrow('Organisation must have category');
    expect(Queue.mock.calls.length).toBe(0);
  });

  it('then it should error if organisation missing category.id', async () => {
    const brokenOrganisation = Object.assign({}, organisation, { category: { name: 'category one' } });
    await expect(client.notifyOrganisationUpdated(brokenOrganisation)).rejects.toThrow('Organisation must have category.id');
    expect(Queue.mock.calls.length).toBe(0);
  });
});
