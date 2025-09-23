const utils = require("./utils");

utils
  .getClient()
  .then((client) => {
    client
      .sendServiceRequestOutcomeToApprovers(
        "an-approver-uuid",
        "end-user-email@test.gov.uk",
        "End User Name",
        "an-organisation-uuid",
        "Organisation Name",
        "Service Name Here",
        [],
        true,
        null,
      )
      .then(() => {
        console.info("Sent");
      })
      .catch((err) => {
        console.error(`Error sending - ${err}`);
      });
  })
  .catch((err) => {
    console.error(`Error getting client - ${err}`);
  });
