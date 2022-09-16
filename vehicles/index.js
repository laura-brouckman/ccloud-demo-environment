const { VehicleProducer } = require("./vehicle_producer");

const ROUTE_IDS = [
  7428721, 7428722, 7428723, 7428725, 7428726, 7428727, 7428728, 7428730,
  7428732, 7428733, 7428734, 7428735, 7428736, 7428737, 7428738, 7428739,
  7428740, 7428741, 7428743, 7428744, 7428746, 7428747, 7428748,
];

function runVehicles(numVehicles = 1) {
  const vehicles = [];
  for (let i = 0; i < numVehicles; i++) {
    const vehicleId = 1000 + i;
    const routeId = ROUTE_IDS[i % ROUTE_IDS.length];
    const vehicle = new VehicleProducer(vehicleId, routeId);
    vehicles.push(vehicle);
    vehicle.start();
  }
  process.on("SIGINT", () => {
    vehicles.forEach((vehicle) => {
      vehicle.stop();
    });
    process.exit();
  });
}

const args = process.argv;
const numVehicles = args[2] ? parseInt(args[2], 10) : 1;
runVehicles(numVehicles);
