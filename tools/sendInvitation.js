const utils = require("./utils");

utils
  .getClient()
  .then((client) => {
    client
      .sendInvitation(
        "some.user@test.local",
        "Test",
        "User",
        "New service",
        "12345",
        "654321",
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
