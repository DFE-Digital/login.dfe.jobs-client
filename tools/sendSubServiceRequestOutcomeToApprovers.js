const utils = require("./utils");

utils
  .getClient()
  .then((client) => {
    client
      .sendSubServiceRequestOutcomeToApprovers(
        "faa4a47a-0d26-4eb5-8be5-11ccb53ad801", //Cardiff Academy
        "6bea40ae-947d-4767-9a97-c52fced78b33",
        "adam.mann+3@education.gov.uk",
        "Adam Mann",
        "Cardiff Academy",
        "Service Name Here",
        ["Sub Service 1", "Sub Service 2"],
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
