const utils = require("./utils");

utils
  .getClient()
  .then((client) => {
    client
      .sendPasswordReset("some.user@test.local", "A1B2C3D4", "foo4")
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
