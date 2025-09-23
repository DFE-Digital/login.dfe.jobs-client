const utils = require("./utils");

// Need to fill in variables with real data
utils
  .getClient()
  .then((client) => {
    client
      .sendOrganisationRequestOutcomeToApprovers(
        "an-approver-uuid",
        "end-user-email@test.gov.uk",
        "End User Name",
        "an-organisation-uuid",
        "Organisation Name",
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
