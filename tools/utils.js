const path = require("path");
const fs = require("fs");
const NotificationClient = require("./../lib/");
const { promisify } = require("util");

const readConfig = async () => {
  const configPath = path.resolve("./tools/config.json");
  const readFile = promisify(fs.readFile);

  const json = await readFile(configPath);
  return JSON.parse(json);
};
const getClient = async () => {
  const config = await readConfig();
  return new NotificationClient(config);
};

module.exports = {
  readConfig,
  getClient,
};
