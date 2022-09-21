const fs = require("fs");
const readline = require("readline");

function readAllLines(path) {
  return new Promise((resolve, reject) => {
    // Test file access directly, so that we can fail fast.
    // Otherwise, an ENOENT is thrown in the global scope by the readline internals.
    try {
      fs.accessSync(path, fs.constants.R_OK);
    } catch (err) {
      reject(err);
    }

    let lines = [];

    const reader = readline.createInterface({
      input: fs.createReadStream(path),
      crlfDelay: Infinity,
    });

    reader
      .on("line", (line) => lines.push(line))
      .on("close", () => resolve(lines));
  });
}

async function configFromPath(filepath) {
  const lines = await readAllLines(filepath);

  return lines
    .filter((line) => !/^\s*?#/.test(line))
    .map((line) => line.split("=").map((s) => s.trim()))
    .reduce((config, [k, v]) => {
      config[k] = v;
      return config;
    }, {});
}

exports.createConfigMap = async function createConfigMap(filepath, clientId) {
  const config = await configFromPath(filepath);
  const mappedConfig = {
    "bootstrap.servers": config["bootstrap.servers"],
    "sasl.username": config["sasl.username"],
    "sasl.password": config["sasl.password"],
    "security.protocol": config["security.protocol"],
    "sasl.mechanisms": config["sasl.mechanisms"],
    "group.id": clientId,
    "client.id": clientId,
  };
  return mappedConfig;
};
