const Kafka = require("node-rdkafka");
const { getLocationData, readConfigFile, sleep } = require("./utils");

const VEHICLE_LOCATION_TOPIC = "vehicle_locations";

class VehicleProducer {
  vehicleId;
  routeId;
  kafkaProducer;
  isReady;

  constructor(vehicleId, routeId) {
    this.vehicleId = vehicleId;
    this.routeId = routeId;
    this.createKafkaProducer();
  }

  async createKafkaProducer() {
    const config = await readConfigFile(
      "./vehicle_client_config.properties",
      `vehicle-${this.vehicleId}`
    );
    this.kafkaProducer = new Kafka.Producer(config);
    this.kafkaProducer.connect();
    this.kafkaProducer.on("ready", () => {
      this.isReady = true;
      console.log(`Producer for vehicle ${this.vehicleId} is ready`);
    });
    this.kafkaProducer.setPollInterval(500);
  }

  async start() {
    while (!this.isReady) {
      await sleep(1000);
    }
    const routeData = await getLocationData(this.vehicleId, this.routeId);
    if (!routeData) {
      console.log("Could not fetch data for route");
      return;
    }
    for (let i = 0; i < routeData.length; i++) {
      const key = this.vehicleId;
      const value = Buffer.from(JSON.stringify(routeData[i]));
      try {
        this.kafkaProducer.produce(
          VEHICLE_LOCATION_TOPIC,
          -1,
          value,
          key,
          Date.now()
        );
        await sleep(3000);
      } catch (e) {
        console.log(`Error producing data ${e}`);
      }
    }
  }

  async stop() {
    this.kafkaProducer.disconnect();
  }
}

module.exports = {
  VehicleProducer,
};
