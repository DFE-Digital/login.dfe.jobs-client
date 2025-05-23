const { Queue } = require("bullmq");
const { bullQueueTtl } = require("./bullOptions");

const send = async (type, data, connectionString) => {
  let queue = null;
  try {
    queue = new Queue(type, { connection: { url: connectionString } });
    await queue.add(type, data, bullQueueTtl);
  } catch (error) {
    throw new Error(
      `NotificationClient: Error while adding message to redis queue - ${JSON.stringify(error)}`,
    );
  } finally {
    if (queue) {
      await queue.close();
    }
  }
};

class NotificationClient {
  constructor({ connectionString }) {
    this.connectionString = connectionString;
  }

  async sendServiceRequestToApprovers(
    senderName,
    senderEmail,
    orgId,
    orgName,
    requestedServiceName,
    requestedSubServices,
    rejectServiceUrl,
    approveServiceUrl,
    helpUrl,
  ) {
    await send(
      "servicerequest_to_approvers_v2",
      {
        senderName,
        senderEmail,
        orgId,
        orgName,
        requestedServiceName,
        requestedSubServices,
        rejectServiceUrl,
        approveServiceUrl,
        helpUrl,
      },
      this.connectionString,
    );
  }

  async sendSubServiceRequestToApprovers(
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
  ) {
    await send(
      "sub_service_request_to_approvers",
      {
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
      },
      this.connectionString,
    );
  }

  async sendPasswordReset(email, firstName, lastName, code, clientId, uid) {
    await send(
      "passwordreset_v1",
      { email, firstName, lastName, code, clientId, uid },
      this.connectionString,
    );
  }

  async sendInvitation(
    email,
    firstName,
    lastName,
    invitationId,
    code,
    serviceName,
    selfInvoked,
    overrides,
    approverEmail,
    orgName,
    isApprover,
  ) {
    await send(
      "invitation_v2",
      {
        email,
        firstName,
        lastName,
        invitationId,
        code,
        serviceName,
        selfInvoked,
        overrides,
        approverEmail,
        orgName,
        isApprover,
      },
      this.connectionString,
    );
  }

  async sendSupportRequest(
    name,
    email,
    service,
    type,
    typeAdditionalInfo,
    orgName,
    urn,
    message,
  ) {
    await send(
      "supportrequest_v1",
      { name, email, service, type, typeAdditionalInfo, orgName, urn, message },
      this.connectionString,
    );
  }

  async sendRegisterExistingUser(
    email,
    firstName,
    lastName,
    serviceName,
    returnUrl,
  ) {
    await send(
      "registerexistinguser_v1",
      {
        email,
        firstName,
        lastName,
        serviceName,
        returnUrl,
      },
      this.connectionString,
    );
  }

  async sendVerifyChangeEmail(
    email,
    firstName,
    lastName,
    code,
    uid = undefined,
  ) {
    const data = { email, firstName, lastName, code };
    if (uid) {
      data.uid = uid;
    }
    await send("verifychangeemail_v1", data, this.connectionString);
  }

  async sendNotifyMigratedEmail(email, firstName, lastName, newEmail) {
    await send(
      "notifychangeemail_v1",
      { email, firstName, lastName, newEmail },
      this.connectionString,
    );
  }

  async sendAccessRequest(email, name, orgName, approved, reason) {
    await send(
      "accessrequest_v1",
      { email, name, orgName, approved, reason },
      this.connectionString,
    );
  }

  async sendServiceAdded(email, firstName, lastName) {
    await send(
      "userserviceadded_v1",
      { email, firstName, lastName },
      this.connectionString,
    );
  }

  async sendServiceRequestApproved(
    email,
    firstName,
    lastName,
    orgName,
    serviceName,
    requestedSubServices,
    permission = {},
  ) {
    await send(
      "userserviceadded_v2",
      {
        email,
        firstName,
        lastName,
        orgName,
        serviceName,
        requestedSubServices,
        permission,
      },
      this.connectionString,
    );
  }

  async sendServiceRequestRejected(
    email,
    firstName,
    lastName,
    orgName,
    serviceName,
    requestedSubServices,
    reason,
  ) {
    await send(
      "userservicerejected_v1",
      {
        email,
        firstName,
        lastName,
        orgName,
        serviceName,
        requestedSubServices,
        reason,
      },
      this.connectionString,
    );
  }

  async sendUserOrganisationRequest(requestId) {
    await send("organisationrequest_v1", { requestId }, this.connectionString);
  }

  async sendUserAddedToOrganisation(email, firstName, lastName, orgName) {
    await send(
      "useraddedtoorganisationrequest_v1",
      { email, firstName, lastName, orgName },
      this.connectionString,
    );
  }

  async sendUserRemovedFromOrganisation(email, firstName, lastName, orgName) {
    await send(
      "userremovedfromorganisationrequest_v1",
      { email, firstName, lastName, orgName },
      this.connectionString,
    );
  }

  async sendUserServiceRemoved(
    email,
    firstName,
    lastName,
    serviceName,
    orgName,
  ) {
    await send(
      "userserviceremoved_v1",
      { email, firstName, lastName, serviceName, orgName },
      this.connectionString,
    );
  }

  async sendUserPermissionChanged(
    email,
    firstName,
    lastName,
    orgName,
    permission,
  ) {
    await send(
      "changeuserpermissionlevelrequest_v1",
      { email, firstName, lastName, orgName, permission },
      this.connectionString,
    );
  }

  async sendSupportOverdueRequest(name, requestsCount, email) {
    await send(
      "supportoverduerequest",
      { name, requestsCount, email },
      this.connectionString,
    );
  }

  async sendSubServiceRequestRejected(
    email,
    firstName,
    lastName,
    orgName,
    serviceName,
    requestedSubServices,
    reason,
  ) {
    await send(
      "sub_service_request_rejected",
      {
        email,
        firstName,
        lastName,
        orgName,
        serviceName,
        requestedSubServices,
        reason,
      },
      this.connectionString,
    );
  }

  async sendSubServiceRequestApproved(
    email,
    firstName,
    lastName,
    orgName,
    serviceName,
    requestedSubServices,
    permission = {},
  ) {
    await send(
      "sub_service_request_approved",
      {
        email,
        firstName,
        lastName,
        orgName,
        serviceName,
        requestedSubServices,
        permission,
      },
      this.connectionString,
    );
  }
}

module.exports = NotificationClient;
