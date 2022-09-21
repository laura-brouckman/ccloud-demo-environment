from random import random
from random import shuffle
import os
import sys
from time import sleep
from confluent_kafka import Producer
import json
from configparser import ConfigParser

DRIVER_FILE_PREFIX = "./routes/"
CONFIG_FILE = "client.ini"
KAFKA_TOPIC = "vehicle_locations"
NUM_DRIVERS = 15
NUM_RIDERS = 30

# For simplicity, we won't worry about riders being duplicated across 
# vehicle, and will just randomly select riders for each vehicle
rider_pool = [i + 1 for i in range(NUM_RIDERS)]
shuffle(rider_pool)

def pickup_rider():
    rider = rider_pool.pop(0)
    return rider

def dropoff_rider(rider):
    rider_pool.append(rider)

class Vehicle():
    def __init__(self, driver_id):
        print("Creating a producer for driver " + str(driver_id))
        self.driver_id = driver_id
        # Parse the configuration.
        # See https://github.com/edenhill/librdkafka/blob/master/CONFIGURATION.md
        config_parser = ConfigParser()
        config_parser.read(CONFIG_FILE)
        config = dict(config_parser['default'])
        # Create a producer
        self.producer = Producer({
            'bootstrap.servers': config['bootstrap.servers'],
            'security.protocol': config['security.protocol'],
            'sasl.mechanisms': config['sasl.mechanisms'],
            'sasl.username': config['sasl.username'],
            'sasl.password': config['sasl.password'],
            'client.id': 'vehicle-' + str(driver_id)
        })
            
    def stop_driving(self):
        print("Stopping driver " + str(self.driver_id))
        self.producer.flush()
        sys.exit(0)

    def start_driving(self):
        with open(os.path.join(DRIVER_FILE_PREFIX, "route-" + str(self.driver_id) + ".csv")) as f:
                lines = f.readlines()
        
        pos = 0
        # pick up a rider and determine how long to "drive" them for
        curr_rider = pickup_rider()
        ride_length = round(random() * 100)
        print("Driver " + str(self.driver_id) + " picking up rider " + str(curr_rider))
        # Loop forever over the route CSV file..
        while True:
            if curr_rider == None:
                # if there is no current rider, optionally pick one up
                if random() >= 0.7:
                    curr_rider = pickup_rider()
                    ride_length = round(random() * 100)
                    print("Driver " + str(self.driver_id) + " picking up rider " + str(curr_rider))
            # Read in the lat/lon
            line = lines[pos].strip()
            self.producer.poll(0)
            [lat,lon] = line.split(',')
            msg = {"driverid": self.driver_id, "riderid": curr_rider, "lat": float(lat), "lon": float(lon)}
            # Produce a message to the topic that contains the rider and driver ids and the vehicle location
            self.producer.produce(
                KAFKA_TOPIC,
                key=str(self.driver_id),
                value=json.dumps(msg).encode('utf-8'))
            sleep(1)
            pos = (pos + 1) % len(lines)
            # If the "ride" is over, drop off the rider
            ride_length = ride_length - 1
            if ride_length <= 0 and curr_rider != None:
                dropoff_rider(curr_rider)
                print("Driver " + str(self.driver_id) + " dropping up rider " + str(curr_rider))
                curr_rider = None

if __name__ == '__main__':
  try:
    driver_id = sys.argv[1]
    if driver_id == None:
      driver_id = 1
    v = Vehicle(driver_id)
    v.start_driving()
  except KeyboardInterrupt:
    v.stop_driving()