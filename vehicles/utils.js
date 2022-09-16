const { stringify, parse } = require("querystring");
const { request } = require("https");
const fs = require("fs");
const readline = require("readline");

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

const getRoute = (routeId) => {
  const payload = stringify({ rId: routeId });
  return new Promise((resolve) => {
    let data = "";
    const req = request(
      "https://www.gmap-pedometer.com/gp/ajaxRoute/get",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
          "Content-Length": Buffer.byteLength(payload),
        },
      },
      (res) => {
        res.on("data", (d) => {
          data += Buffer.from(d).toString();
        });
      }
    );
    req.on("close", () => {
      resolve({ data });
    });

    req.end(payload, "utf-8");
  });
};

async function getLocationData(id, routeId) {
  const response = await getRoute(routeId);
  const data = parse(response.data);
  const lonsAndLats = data.polyline.split("a");
  const locations = [];
  for (let i = 0; i < lonsAndLats.length; i += 2) {
    const lat = parseFloat(lonsAndLats[i]);
    const lon = parseFloat(lonsAndLats[i + 1]);
    locations.push({
      vehicleId: id,
      lat,
      lon,
    });
  }
  return locations;
}

function readFile(path) {
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

async function readConfigFile(path, clientId) {
  const lines = await readFile(path);

  const config = lines
    .filter((line) => !/^\s*?#/.test(line))
    .map((line) => line.split("=").map((s) => s.trim()))
    .reduce((config, [k, v]) => {
      if (k) {
        config[k] = v;
      }
      return config;
    }, {});
  config["client.id"] = clientId;
  return config;
}

module.exports = {
  getLocationData,
  readConfigFile,
  sleep,
};
