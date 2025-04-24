const { Queue } = require("bullmq");
const { bullQueueTtl } = require("./bullOptions");

const send = async (type, data, connectionString) => {
  let queue = null;
  try {
    queue = new Queue(type, { connection: { url: connectionString } });
    await queue.add(type, data, bullQueueTtl);
  } catch (error) {
    throw new Error(
      `PublicApiClient: Error while adding message to redis queue - ${JSON.stringify(error)}`,
    );
  } finally {
    if (queue) {
      await queue.close();
    }
  }
};

class PublicApiClient {
  constructor({ connectionString }) {
    this.connectionString = connectionString;
  }

  async sendInvitationRequest(
    firstName,
    lastName,
    email,
    organisation,
    sourceId,
    callback,
    userRedirect,
    clientId,
    inviteSubjectOverride = undefined,
    inviteBodyOverride = undefined,
  ) {
    await send(
      "publicinvitationrequest_v1",
      {
        firstName,
        lastName,
        email,
        organisation,
        sourceId,
        callback,
        userRedirect,
        clientId,
        inviteSubjectOverride,
        inviteBodyOverride,
      },
      this.connectionString,
    );
  }

  async sendInvitationComplete(userId, callbacks) {
    await send(
      "publicinvitationcomplete_v1",
      { userId, callbacks },
      this.connectionString,
    );
  }

  async sendNotifyRelyingParty(callback, userId, sourceId) {
    await send(
      "publicinvitationnotifyrelyingparty_v1",
      { callback, userId, sourceId },
      this.connectionString,
    );
  }
}

module.exports = PublicApiClient;
