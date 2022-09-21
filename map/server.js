const os = require("os");
const Kafka = require("node-rdkafka");
const { createConfigMap } = require("./utils");

const TOPICS = ["vehicle_locations"];
const CONFIG_FILE = "./client.properties";
const CLIENT_ID = "map-application-consumer";

async function setupConsumer() {
  const config = await createConfigMap(CONFIG_FILE, CLIENT_ID);
  const stream = Kafka.createReadStream(
    config,
    { "auto.offset.reset": "earliest" },
    {
      topics: TOPICS,
      waitInterval: 0,
    }
  );

  stream.on("data", function (data) {
    if (data && data.value) {
      try {
        const parsedData = JSON.parse(data.value.toString());
        console.log("parsed data", parsedData);
        const websocketMessage = {
          key: data.key.toString(),
          latitude: parseFloat(parsedData.lat),
          longitude: parseFloat(parsedData.lon),
          timestamp: data.timestamp,
          riderid: parsedData.riderid,
          driverid: parsedData.driverid,
        };
        io.sockets.emit("location_update", websocketMessage);
      } catch (e) {
        console.log("Could not parse message", e);
      }
    }
  });
}

// Setup basic express server
const express = require("express");
const app = express();
const path = require("path");
const server = require("http").createServer(app);
const io = require("socket.io")(server, {
  cors: {
    origin: "http://localhost:3001",
    methods: ["GET", "POST"],
  },
});
const port = process.env.PORT || 3000;

server.listen(port, () => {
  console.log("Server listening at port %d", port);
});
// log when we get a websocket connection
io.on("connection", (socket) => {
  console.log("new connection, socket.id: " + socket.id);
});

setupConsumer();
